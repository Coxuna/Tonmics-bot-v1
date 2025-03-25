import { useState, useEffect } from "react";
import { getAvailableSpinCounts } from "../../hooks/constants";

const SpinResetTimer = ({ lastSpinTime, resetInterval, format = "minutes", spinCount }) => {
  const [timeDisplay, setTimeDisplay] = useState("");
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  useEffect(() => {
    // Check if all spins are exhausted (0 available spins)
    const availableSpins = typeof spinCount === 'number' ?
      getAvailableSpinCounts(spinCount) :
      spinCount;
      
    const allSpinsExhausted = availableSpins === 0;
    
    // Function to calculate and format the time
    const updateTimeDisplay = () => {
      if (!lastSpinTime) {
        setTimeDisplay("Spins available!");
        setIsCountingDown(false);
        return;
      }
      
      const now = new Date().getTime();
      const lastSpin = new Date(lastSpinTime).getTime();
      
      if (allSpinsExhausted) {
        // Calculate time until next spin is available (only when all spins are used)
        const resetTime = lastSpin + resetInterval;
        const remaining = resetTime - now;
        
        if (remaining <= 0) {
          // Spin is now available
          setTimeDisplay("Spin available!");
          setIsCountingDown(false);
          return;
        }
        
        setIsCountingDown(true);
        
        // Format the remaining time
        const totalSeconds = Math.ceil(remaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (format === "seconds") {
          setTimeDisplay(`${seconds}s`);
        } else if (format === "minutes") {
          setTimeDisplay(`${minutes}m ${seconds}s`);
        } else if (format === "hours") {
          setTimeDisplay(`${hours}h ${minutes}m ${seconds}s`);
        } else if (format === "full") {
          setTimeDisplay(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        }
      } else {
        // Still have spins available
        setTimeDisplay("Spins available!");
        setIsCountingDown(false);
      }
    };
    
    // Update the timer immediately and then every second
    updateTimeDisplay();
    const interval = setInterval(updateTimeDisplay, 1000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [lastSpinTime, resetInterval, format, spinCount]);
  
  return (
    <div className="text-white text-xs text-center mt-1">
      {isCountingDown ? 
        `Next spin: ${timeDisplay}` : 
        timeDisplay}
    </div>
  );
};

export default SpinResetTimer;