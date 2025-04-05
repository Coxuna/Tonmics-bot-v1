import React, { useEffect, useRef, useState } from 'react';
import Toast from "./ToastModal";
import { useUser } from '../../hooks/UserProvider';

// Helper function to safely parse timestamp from database
const parseStoredTimestamp = (storedTime) => {
  if (!storedTime) return null;
  
  // If it's already a number, return it
  if (typeof storedTime === 'number') return storedTime;
  
  try {
    // If it's an ISO string
    if (typeof storedTime === 'string' && storedTime.includes('T')) {
      return new Date(storedTime).getTime();
    }
    
    // If it's a formatted date string
    const dateStr = storedTime.includes('T') ? storedTime : storedTime.replace(' ', 'T');
    // Add Z to ensure UTC interpretation if not already present
    const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    return new Date(utcDateStr).getTime();
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    return null;
  }
};

const SpinTheWheel = () => {
  // Use user context
  const { user, updateUser } = useUser();

  const canvasRef = useRef(null);
  const spinElRef = useRef(null);
  const [spinButtonClicked, setSpinButtonClicked] = useState(false);

  // Enhanced spin tracking states
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [lastSpinTime, setLastSpinTime] = useState(null);
  const [spinCountdown, setSpinCountdown] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastMessage2, setToastMessage2] = useState("Keep spinning to win more daily");
  const [responseType, setResponseType] = useState("");
  const [showOutOfSpins, setShowOutOfSpins] = useState(false);

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

  // Load user spin data when user is available
  useEffect(() => {
    if (user && user.telegram_id) {
      console.log("Setting user spin data:", user.spin_count, user.last_spin);
      
      // Fix: Make sure we properly handle different data types
      const spinCount = user.spin_count !== undefined && user.spin_count !== null ? Number(user.spin_count) : 3;
      setSpinsLeft(spinCount);
      
      // Parse the stored timestamp correctly
      if (user.last_spin === null || user.last_spin === undefined) {
        setLastSpinTime(null);
      } else {
        const parsedLastSpin = parseStoredTimestamp(user.last_spin);
        setLastSpinTime(parsedLastSpin);
      }
    }
  }, [user]);

  // Timer effect to check and reset spins
  useEffect(() => {
    if (!user) {
      // Don't run the timer until we have proper data
      return;
    }
  
    // Only start timer if lastSpinTime exists
    if (lastSpinTime) {
      const checkAndUpdateTimer = () => {
        const now = Date.now();
        const timeElapsed = now - lastSpinTime;
        // Reset after 60 minutes (60 * 60 * 1000 ms)
        const timeRemaining = 24 * 60 * 60 * 1000 - timeElapsed;
        console.log("Time remaining for spin reset:", timeRemaining);
        
        if (timeRemaining <= 0) {
          // Reset spins to 3
          setSpinsLeft(3);
          setLastSpinTime(null);
          setSpinCountdown("");
          setShowOutOfSpins(false);
          
          // Update database
          updateUser(user?.telegram_id, { 
            spin_count: 3,
            last_spin: null
          });
        } else {
          // Update countdown display with hours, minutes, and seconds
          const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
          const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
          const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
          
          // Format with leading zeros for better readability
          const formattedHours = String(hours).padStart(2, '0');
          const formattedMinutes = String(minutes).padStart(2, '0');
          const formattedSeconds = String(seconds).padStart(2, '0');
          
          setSpinCountdown(`${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`);
        }
      };
      
      // Initial check
      checkAndUpdateTimer();
      
      // Set interval to update every second
      const interval = setInterval(checkAndUpdateTimer, 1000);
      
      return () => clearInterval(interval);
    } else {
      // Clear any countdown if lastSpinTime is null
      setSpinCountdown("");
    }
  }, [lastSpinTime, user]);
  
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

    console.log("Spins left:", spinsLeft);
    
    // Check if spins are available
    if (spinsLeft <= 0) {
      setShowOutOfSpins(true);
      setToastMessage("You're out of spins!");
      setToastMessage2(`Watch an ad to earn more spins${spinCountdown ? `. Free spins reset in ${spinCountdown}` : ''}`);
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

  // Modified finalizeSpinResult to handle user updates
  const finalizeSpinResult = (finalSector) => {
    const newSpinCount = spinsLeft - 1;
    const currentTime = Date.now();

    // Prepare update object
    const updateObj = {
      spin_count: newSpinCount
    };

    // Add specific rewards based on sector
    if (finalSector.responseType === "2 Gems") {
      updateObj.gems = (user.gems || 0) + 2;
    } else if (finalSector.responseType === "2 Keys") {
      updateObj.t_keys = (user.t_keys || 0) + 2;
    } else if (finalSector.responseType === "50 Tonmics") {
      const tms_points = parseFloat(user.tms_points || 0) + parseFloat(50);
      updateObj.tms_points = tms_points.toFixed(2);
    } else if (finalSector.responseType === "20 Tonmics") {
      const tms_points = parseFloat(user.tms_points || 0) + parseFloat(20);
      updateObj.tms_points = tms_points.toFixed(2);
    } else if (finalSector.responseType === "1 Key") {
      updateObj.t_keys = (user.t_keys || 0) + 1;
    }
   
    // If this was the last spin, set the timer
    if (newSpinCount === 0) {
      setLastSpinTime(currentTime);
      updateObj.last_spin = currentTime;
    }

    // Update user data
    if (user && user.telegram_id) {
      updateUser(user.telegram_id, updateObj);
    }

    // Update local states
    setSpinsLeft(newSpinCount);
  };

  // Existing toast and ad watching handlers
  const handleCloseToast = () => {
    setShowToast(false);
  };

  const handleWatchAd = () => {
    window.Adsgram?.init({ blockId: "int-7955" })?.show()
      .then((result) => {
        if (result.done) {
          // Give one more spin, max 3
          const newSpinCount = Math.min((spinsLeft || 0) + 1, 3);
          
          // Update user data
          if (user && user.telegram_id) {
            updateUser(user.telegram_id, {
              spin_count: newSpinCount
            });
          }
          
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
          className="absolute z-10 top-[-70px] left-1/2 transform -translate-x-1/2 w-[160px] h-[160px] object-contain" 
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