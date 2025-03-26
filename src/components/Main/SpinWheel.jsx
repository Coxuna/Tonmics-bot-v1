import React, { useEffect, useRef, useState } from 'react';
import Toast from "./ToastModal";
import { useUser } from '../../hooks/UserProvider';

const SpinTheWheel = () => {
  // Use user context
  const { user, updateUser } = useUser();

  const canvasRef = useRef(null);
  const spinElRef = useRef(null);
  const [spinButtonClicked, setSpinButtonClicked] = useState(false);

  // Enhanced spin tracking states
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [lastSpinTime, setLastSpinTime] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastMessage2, setToastMessage2] = useState("Keep spinning to win more daily");
  const [responseType, setResponseType] = useState("");
  const [showOutOfSpins, setShowOutOfSpins] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(Date.now());

  const sectors = [
    { color: "black", text: "#fff", label: "Try again", responseType: "Try again" },
    { color: "white", text: "#000", label: "2 Gems 💎", responseType: "2 Gems" },
    { color: "black", text: "#fff", label: "1 Key 🔑", responseType: "1 Key" },
    { color: "white", text: "#000", label: "Try again", responseType: "Try again" },
    { color: "black", text: "#fff", label: "2 Keys 🔑", responseType: "2 Keys" },
    { color: "white", text: "#000", label: "20 Tonmics", responseType: "20 Tonmics" },
    { color: "black", text: "#fff", label: "Try again", responseType: "Try again" },
    { color: "white", text: "#000", label: "50 Tonmics", responseType: "50 Tonmics" },
  ];

  const tot = sectors.length;
  const friction = 0.991;
  const TAU = 2 * Math.PI;
  const arc = TAU / sectors.length;

  const [angVel, setAngVel] = useState(0);
  const [ang, setAng] = useState(0);

  // Flexible time conversion function
  const getTimeDifference = (currentTime, lastTime, unit = 'minutes') => {
    const timeDiff = currentTime - lastTime;
    switch(unit) {
      case 'seconds':
        return timeDiff / 1000;
      case 'minutes':
        return timeDiff / (1000 * 60);
      case 'hours':
        return timeDiff / (1000 * 60 * 60);
      default:
        throw new Error('Invalid time unit. Use "seconds", "minutes", or "hours".');
    }
  };

  // Check and update available spins
  const checkAndUpdateSpins = (timeUnit = 'minutes', resetInterval = 1) => {
    if (!user) return;

    const currentTime = new Date().getTime();
    const lastSpinTime = user.last_spin ? new Date(user.last_spin).getTime() : 0;
    
    const timeSinceLastSpin = getTimeDifference(currentTime, lastSpinTime, timeUnit);

    if (timeSinceLastSpin >= resetInterval) {
      const newSpinCount = 3; // Reset to default spin count
      setSpinsLeft(newSpinCount);
      
      // Update user data if needed
      updateUserData({
        spin_count: newSpinCount,
        last_spin: new Date().toISOString().replace("T", " ").split(".")[0]
      });

      // Reset out of spins state
      if (showOutOfSpins) {
        setShowOutOfSpins(false);
        setShowToast(false);
      }
    } else {
      // Use spin count from user data
      setSpinsLeft(user.spin_count || 0);
    }
    
    setLastCheckedTime(currentTime);
  };

  // Update user data
  const updateUserData = async (updateObj) => {
    if (user && user.telegram_id) {
      try {
        await updateUser(user.telegram_id, updateObj);
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }
  };

  // Periodic spin checks
  useEffect(() => {
    const checkSpinsInterval = setInterval(() => {
      checkAndUpdateSpins(); // Uses default 'minutes' and 1-minute interval
    }, 5000);
    return () => clearInterval(checkSpinsInterval);
  }, [user, lastCheckedTime]);

  // Initial spin check when user changes
  useEffect(() => {
    checkAndUpdateSpins();
  }, [user]);

  const drawSector = (ctx, sector, i) => {
    const radius = ctx.canvas.width / 2;
    const angle = arc * i;
    
    ctx.save();
    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, angle, angle + arc);
    ctx.lineTo(radius, radius);
    ctx.fill();
    
    // TEXT
    ctx.translate(radius, radius);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = sector.text;
    ctx.font = "bold 14px 'Adventure', monospace";
    ctx.fillText(sector.label, radius - 10, 10);
    
    ctx.restore();
  };

  const getIndex = () => {
    // More precise sector calculation at the top
    const normalizedAng = (TAU - ang) % TAU;
    const selectedIndex = Math.floor((normalizedAng / TAU) * tot);
    
    console.log('Wheel Stopping Calculations:');
    console.log(`Original Angle: ${ang} radians`);
    console.log(`Normalized Angle: ${normalizedAng} radians`);
    console.log(`Angle in Degrees: ${normalizedAng * (180/Math.PI)} degrees`);
    console.log(`Selected Sector Index: ${selectedIndex}`);
    console.log(`Selected Sector: ${sectors[selectedIndex].label}`);
    
    return selectedIndex;
  };

  const rotate = (ctx, currentAng) => {
    ctx.canvas.style.transform = `rotate(${currentAng}rad)`;
  };

 useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const dia = canvas.width;
  const rad = dia / 2;

  // Initial draw
  sectors.forEach((sector, i) => drawSector(ctx, sector, i));
  rotate(ctx, ang);

  // Animation loop
  let rafId;
  const engine = () => {
    // More precise check for wheel stopping
    if (angVel < 0.002 && spinButtonClicked) {
      console.log('Wheel has stopped spinning!');
      const finalSectorIndex = getIndex();
      const finalSector = sectors[finalSectorIndex];
      console.log(`Final Result: ${finalSector.label}`);
      
      // Prepare toast message
      if (finalSector.responseType === "Try again") {
        setToastMessage("Better luck next time!");
      } else {
        setToastMessage(`Congratulations! You won ${finalSector.label}`);
      }
      
      // Call the new finalization method
      finalizeSpinResult(finalSector);
      
      // Update response type for toast
      setResponseType(finalSector.responseType);
      
      // Show toast
      setShowToast(true);
      
      // Post message to parent
      window.parent.postMessage({
        message: `You have earned ${finalSector.label}`, 
        source: "spinner", 
        type: finalSector.responseType
      }, "*");
      
      setSpinButtonClicked(false);
      return;
    }

    const newAngVel = angVel * friction;
    const newAng = (ang + newAngVel) % TAU;

    setAngVel(newAngVel < 0.002 ? 0 : newAngVel);
    setAng(newAng);

    rotate(ctx, newAng);
    rafId = requestAnimationFrame(engine);
  };

  rafId = requestAnimationFrame(engine);

  return () => {
    cancelAnimationFrame(rafId);
  };
}, [ang, angVel, spinButtonClicked, user]);

 const handleSpin = () => {
    // Check if user is logged in
    if (!user) {
      setToastMessage("Please log in to spin the wheel");
      setToastMessage2("");
      setShowToast(true);
      return;
    }

    // Force a check of available spins before proceeding
    checkAndUpdateSpins();

    // Check if spins are available
    if (spinsLeft <= 0) {
      setShowOutOfSpins(true);
      setToastMessage("You're out of spins!");
      setToastMessage2("Watch an ad to earn more spins");
      setResponseType("Try again");
      setShowToast(true);
      return;
    }

    if (!angVel) {
      // Random spin velocity between 0.25 and 0.45
      const spinVelocity = Math.random() * (0.45 - 0.25) + 0.25;
      console.log(`Spin Initiated with Velocity: ${spinVelocity}`);
      setAngVel(spinVelocity);
      setSpinButtonClicked(true);
    }
  };

  // Modified handleSpin in main useEffect to handle user updates
  const finalizeSpinResult = (finalSector) => {
    const currentTime = new Date().toISOString().replace("T", " ").split(".")[0];
    const newSpinCount = spinsLeft - 1;

    // Prepare update object
    const updateObj = {
      spin_count: newSpinCount,
      last_spin: currentTime
    };

    // Add specific rewards based on sector
    if (finalSector.responseType === "2 Gems") {
      updateObj.gems = (user.gems || 0) + 2;
    
    } else if (finalSector.responseType === "2 Keys") {
      updateObj.t_keys = (user.t_keys || 0) + 2;
    } else if (finalSector.responseType === "50 Tonmics") {
      updateObj.tms_points = (user.tms_points || 0) + 50;
      
    }else if (finalSector.responseType === "20 Tonmics") {
      updateObj.tms_points = (user.tms_points || 0) + 20;
    }else if (finalSector.responseType === "1 Keys") {
      updateObj.tms_points = (user.tms_points || 0) + 1;
    }

    // Update user data
    updateUserData(updateObj);

    // Update local states
    setSpinsLeft(newSpinCount);
    setLastSpinTime(new Date().getTime());
  };

  // Existing toast and ad watching handlers
  const handleCloseToast = () => {
    setShowToast(false);
    checkAndUpdateSpins();
  };

  const handleWatchAd = () => {
    window.Adsgram?.init({ blockId: "int-7955" })?.show()
      .then((result) => {
        if (result.done) {
          // Give one more spin, max 3
          const newSpinCount = Math.min((spinsLeft || 0) + 1, 3);
          
          // Update user data
          updateUserData({
            spin_count: newSpinCount
          });
          
          setSpinsLeft(newSpinCount);
          setShowToast(false);
          setShowOutOfSpins(false);
        }
      })
      .catch(() => {
        alert('Error playing ad');
      });
  };

  return (
    <div className="relative w-full max-w-[400px] mx-auto flex justify-center items-center">
      <div className="bg-[#18325B] p-[20px] rounded-full relative">
        {/* Tonmics SVG positioned inside the blue background */}
        <img 
          src="/assets/tonmicss.svg" 
          className="absolute z-10 top-[-90px] left-1/2 transform -translate-x-1/2 w-[200px] h-[200px]" 
        />
        <div className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px] bg-white rounded-full flex justify-center items-center">
          <canvas 
            ref={canvasRef} 
            id="wheel" 
            width="350" 
            height="350" 
            className="absolute top-0 left-0 w-full h-full"
          />
          <div 
            ref={spinElRef} 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              w-[25%] h-[25%] bg-white text-white rounded-full 
              flex justify-center items-center cursor-pointer
              shadow-[0_0_0_8px_currentColor,0_0px_15px_5px_rgba(0,0,0,0.6)]"
            onClick={handleSpin}
          >
            <span className="text-black">Spin</span>
          </div>
        </div>

        {/* Toast Component */}
        {showToast && (
          <Toast
            title="Spin Result"
            cta="Spin Again"
            isVisible={true}
            watchAds={showOutOfSpins}
            responseType={responseType}
            message={toastMessage}
            message2={toastMessage2}
            showOutOfSpins={showOutOfSpins}
            onClose={handleCloseToast}
            onWatchAd={handleWatchAd}
          />
        )}
      </div>
    </div>
  );
};

export default SpinTheWheel;