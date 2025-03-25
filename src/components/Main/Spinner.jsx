import { useState, useEffect } from "react";
import Toast from "./ToastModal";
import { useUser } from "../../hooks/UserProvider";

const SpinWheel = () => {
  const { user, updateUser } = useUser(); // Access user context
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningSector, setWinningSector] = useState(null);
  
  // Toast-related states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastMessage2, setToastMessage2] = useState("Keep spinning to win more daily");
  const [responseType, setResponseType] = useState("");
  const [showWatchAds, setShowWatchAds] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(0); // Will be calculated based on user data
  const [showOutOfSpins, setShowOutOfSpins] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(Date.now());

  // Function to check and update available spins
  const checkAndUpdateSpins = () => {
    if (user) {
      const lastSpinTime = user.last_spin ? new Date(user.last_spin).getTime() : 0;
      const currentTime = new Date().getTime();
      const minutesSinceLastSpin = (currentTime - lastSpinTime) / (1000 * 60); // Convert to minutes
  
      // Reset spin count if it's been more than 1 minute since last spin
      // Note: You'll want to adjust this logic according to your reset interval
      if (minutesSinceLastSpin >= 1) {
        setSpinsLeft(3); // Reset to 3 spins every minute
        
        // If user was out of spins, close the toast notification
        if (showOutOfSpins) {
          setShowOutOfSpins(false);
          setShowToast(false);
        }
      } else {
        // Otherwise, use the remaining spins from user data
        setSpinsLeft(user.spin_count || 0);
      }
      
      setLastCheckedTime(currentTime);
    }
  };

  // Check spins when component mounts or user changes
  useEffect(() => {
    checkAndUpdateSpins();
  }, [user]);

  // Set up timer to periodically check for spin resets
  useEffect(() => {
    // Check every 5 seconds if timer has elapsed
    const timerInterval = setInterval(() => {
      checkAndUpdateSpins();
    }, 5000); // 5 seconds interval
    
    return () => clearInterval(timerInterval);
  }, [user, lastCheckedTime]);
  
  const spinWheel = () => {
    // Check if user is logged in
    if (!user) {
      setToastMessage("Please log in to spin the wheel");
      setToastMessage2("");
      setShowWatchAds(false);
      setShowToast(true);
      return;
    }

    // Force a check of available spins before proceeding
    checkAndUpdateSpins();

    // Check if user has spins left
    if (spinsLeft <= 0) {
      setShowOutOfSpins(true);
      setResponseType("");
      setToastMessage("You're out of spins!");
      setToastMessage2("Watch an ad to earn more spins");
      setShowWatchAds(true);
      setShowToast(true);
      return;
    }

    // Proceed with spinning if user has spins left
    if (isSpinning) {
      console.log("Already spinning, ignoring click");
      return;
    }

    // Decrement spins
    const newSpinCount = spinsLeft - 1;
    setSpinsLeft(newSpinCount);
    
    // Always update the last_spin timestamp whenever user spins
    const currentTime = new Date().toISOString().replace("T", " ").split(".")[0];
    
    setIsSpinning(true);
    setResult("");
    setWinningSector(null);
    
    // Generate a rotation that will land between 90-110 degrees
    const baseRotation = rotation + 1080; // At least 3 full rotations
    
    // Choose a random angle within the desired 90-110 range for the final position
    const targetAngle = Math.floor(Math.random() * 20) + 90; // Random between 90-110
    
    // Calculate what rotation will achieve this target position
    const newRotation = baseRotation + (360 - targetAngle);
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);

      // Calculate which sector is at the pointer position (top)
      const finalPosition = newRotation % 360;
      const normalizedPosition = (360 - finalPosition) % 360;
      
      // Determine winner based on which sector contains the normalized position
      let winnerIndex = -1;
      let winnerText = "";
      
      for (let i = 0; i < sectors.length; i++) {
        const sector = sectors[i];
        if (sector.range[0] <= sector.range[1]) {
          // Normal range
          if (normalizedPosition >= sector.range[0] && normalizedPosition < sector.range[1]) {
            winnerIndex = i;
            break;
          }
        } else {
          // Range wraps around 360 (e.g., 315 to 45)
          if (normalizedPosition >= sector.range[0] || normalizedPosition < sector.range[1]) {
            winnerIndex = i;
            break;
          }
        }
      }
      
      if (winnerIndex !== -1) {
        const winner = sectors[winnerIndex];
        winnerText = `${winner.labelFront} ${winner.labelBack}`;
        setWinningSector(winnerIndex);
        setResponseType(winner.responseType);
        
        // Set toast message based on what was won
        if (winner.responseType === "Try again") {
          setToastMessage("Better luck next time!");
          setShowWatchAds(true); // Show watch ads for Try again results
          
          // Update user data with just the spin count and timestamp
          updateUserData({
            spin_count: newSpinCount,
            last_spin: currentTime
          });
        } else {
          // Handle reward based on what was won
          handleReward(winner.responseType, newSpinCount, currentTime);
        }
        
        // Show the spinner result toast
        setShowOutOfSpins(false);
        setShowToast(true);
      }
      
      setResult(winnerText);
    }, 1000); // Spin animation duration
  };

  // Function to handle rewarding the user
  const handleReward = (rewardType, newSpinCount, currentTime) => {
    // Create update object with spin count and timestamp
    const updateObj = {
      spin_count: newSpinCount,
      last_spin: currentTime
    };

    // Add specific reward based on what was won
    if (rewardType === "2 Keys") {
      updateObj.t_keys = (user.t_keys || 0) + 2;
      setToastMessage("Congratulations! You won 2 Keys!");
      setShowWatchAds(false);
    } else if (rewardType === "2 Gems") {
      updateObj.gems = (user.gems || 0) + 2;
      setToastMessage("Congratulations! You won 2 Gems!");
      setShowWatchAds(false);
    } else if (rewardType === "50 TMS point") {
      updateObj.tms_points = (user.tms_points || 0) + 50;
      setToastMessage("Congratulations! You won 50 TMS Points!");
      setShowWatchAds(false);
    }

    // Update user data
    updateUserData(updateObj);
  };

  // Function to update user data via context
  const updateUserData = async (updateObj) => {
    if (user && user.telegram_id) {
      try {
        await updateUser(user.telegram_id, updateObj);
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
    // Recheck spins when toast is closed
    checkAndUpdateSpins();
  };

  const handleWatchAd = () => {
    console.log("User chose to watch an ad");
    // If user was out of spins, award them more spins after watching ad
    if (showOutOfSpins) {
      const newSpinCount = Math.min((spinsLeft || 0) + 1, 3); // Give 1 more spin, max 3
      setSpinsLeft(newSpinCount);
      
      // Update user data with new spin count
      updateUserData({
        spin_count: newSpinCount
      });
      
      setShowToast(false); // Close the toast after watching ad
      setShowOutOfSpins(false); // Reset this state
    }
  };

  const sectors = [
    { id: 0, labelFront: "TRY", labelBack: "AGAIN", bgColor: "white", textColor: "black", rotate: 45, range: [315, 45], responseType: "Try again" },
    { id: 1, labelFront: "2", labelBack: "KEYS", bgColor: "black", textColor: "white", rotate: 135, range: [45, 135], responseType: "2 Keys" },
    { id: 2, labelFront: "2", labelBack: "GEMS", bgColor: "white", textColor: "black", rotate: 225, range: [135, 225], responseType: "2 Gems" },
    { id: 3, labelFront: "50", labelBack: "TMS PTS", bgColor: "black", textColor: "white", rotate: 315, range: [225, 315], responseType: "50 TMS point" },
  ];

  return (
    <div className="relative w-full max-w-[320px] z-10">
      {/* Spin Wheel Container */}
      <div className="relative w-[250px] h-[250px] mx-auto" >
        {/* Rotating Wheel */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: "transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)", // Faster spin
          }}
        >
          {/* Wheel Background */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(white 0deg 90deg, black 90deg 180deg, white 180deg 270deg, black 270deg 360deg)",
              border: "5px solid navy",
            }}
          />

          {/* Winning Sector Highlight Overlay */}
          {winningSector !== null && (
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ zIndex: 25 }}
            >
              {/* Create a highlight for the winning sector */}
              <div
                className="absolute inset-0"
                style={{
                  background: winningSector === 0 
                    ? "conic-gradient(rgba(255, 215, 0, 0.5) 0deg 90deg, transparent 90deg 360deg)"
                    : winningSector === 1
                    ? "conic-gradient(transparent 0deg 90deg, rgba(255, 215, 0, 0.5) 90deg 180deg, transparent 180deg 360deg)"
                    : winningSector === 2
                    ? "conic-gradient(transparent 0deg 180deg, rgba(255, 215, 0, 0.5) 180deg 270deg, transparent 270deg 360deg)"
                    : "conic-gradient(transparent 0deg 270deg, rgba(255, 215, 0, 0.5) 270deg 360deg)",
                }}
              />
            </div>
          )}

          {/* Sector Labels */}
          {sectors.map((sector, index) => (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
              style={{
                transform: `rotate(${sector.rotate}deg)`,
                transformOrigin: "center",
              }}
            >
              <div
                className="absolute top-[10%] left-1/2 -translate-x-1/2 text-center font-bold"
                style={{
                  color: sector.textColor,
                  fontSize: "0.9rem",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(90deg)",
                  zIndex: 30,
                }}
              >
                {sector.labelFront}
              </div>
              <div
                className="absolute top-[15%] left-1/2 -translate-x-1/2 text-center font-bold"
                style={{
                  color: sector.textColor,
                  fontSize: "0.9rem",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(90deg)",
                  zIndex: 30,
                }}
              >
                {sector.labelBack}
              </div>
            </div>
          ))}
        </div>

        {/* Pointer at the top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0
              border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"
          style={{ zIndex: 50 }}
        />

        {/* Central Spin Button */}
        <button
          onClick={spinWheel}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-20 h-20 bg-white rounded-full
                  flex items-center justify-center
                  cursor-pointer shadow-lg
                  border-2 border-blue-500
                  z-50"
          type="button"
          disabled={isSpinning}
        >
          <span className="text-black font-bold text-sm">SPIN</span>
        </button>
      </div>

     

      {/* Tonmics SVG Overlay */}
      <img
        src="/assets/tonmicss.svg"
        className="absolute -top-30 left-[43%] -translate-x-1/2 max-w-full z-20 pointer-events-none"
        alt="Tonmics"
      />

      {/* Toast Component */}
      {showToast && (
        <Toast
          title="Spin Result"
          cta={showOutOfSpins ? "Close" : "Spin Again"}
          isVisible={true}
          watchAds={showWatchAds}
          responseType={responseType}
          message={toastMessage}
          message2={toastMessage2}
          showOutOfSpins={showOutOfSpins}
          onClose={handleCloseToast}
          onWatchAd={handleWatchAd}
        />
      )}
    </div>
  );
};

export default SpinWheel;