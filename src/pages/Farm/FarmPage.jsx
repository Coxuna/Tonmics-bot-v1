import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUser } from '../../hooks/UserProvider';

import BackSheetModal from '../../components/claim/BackSheetModal';
import ClaimInfo from '../../components/claim/ClaimInfo';
import ResponsivePadding from '../../components/shared/ResponsivePadding';
import InfoComponent from '../../components/claim/InfoComponent';

const FarmPage = () => {
  const { user, updateUser } = useUser();
  const [progress, setProgress] = useState(0);
  const [amountToClaim, setAmountToClaim] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [upperLevel, setUpperLevel] = useState(2);
  const [lowerLevel, setLowerLevel] = useState(1);
  const [claimAmountPerSecond, setClaimAmountPerSecond] = useState(0.00346);
  const actionInProgressRef = useRef(false);
  const [farmStatus, setFarmStatus] = useState({
    stage: 'initial', // can be 'initial', 'farming', 'farmed', 'claim_available'
    startTime: null,
    timeRemaining: 0
  });

  const intervalRef = useRef(null);

  // Configurable farming settings - 4 hours for farming, 10 minutes for claiming
  const FARM_INTERVAL = 0.1 * 60 * 1000; // 4 hours farming duration
  const CLAIM_DURATION = 15 * 60 * 1000; // 10 minutes claim duration

  // Dynamic level calculation function
  const calculateLevelThreshold = (level) => {
    const baseThreshold = 500;
    let totalThreshold = 0;
    for (let i = 1; i < level; i++) {
      totalThreshold += baseThreshold * i;
    }

    return {
      start: totalThreshold,
      end: totalThreshold + (baseThreshold * level)
    };
  };

  // Calculate dynamic claim amount per second based on level - FIX: ensure this returns the expected small value
  const calculateClaimAmountPerSecond = (level = lowerLevel) => {
    // Base value is 0.00346
    return 0.00346 * Math.pow(1.1, level - 1);
  };

  // Improved time formatting function
  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return "0H 00M 00S";
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedHours = hours.toString();
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}H ${formattedMinutes}M ${formattedSeconds}S`;
  };

  // Calculate user's current level and progress
  const calculateLevelProgress = (points) => {
    let currentLevel = 1;
    let levelInfo = calculateLevelThreshold(currentLevel);

    while (points >= levelInfo.end && currentLevel < 100) { // Add max level check
      currentLevel++;
      levelInfo = calculateLevelThreshold(currentLevel);
    }

    const progressPercentage = Math.min(
      100, 
      ((points - levelInfo.start) / (levelInfo.end - levelInfo.start)) * 100
    );

    return {
      lowerLevel: currentLevel,
      upperLevel: currentLevel + 1,
      progressPercentage
    };
  };

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

  // Helper function to reset to initial state
  const resetToInitialState = () => {
    console.log("Resetting to initial state");
    if (user) {
      updateUser(user.telegram_id, {
        farming_stage: 'initial',
        farming_start_time: null,
        farming_time_remaining: 0,
        accumulated_amount: 0,
        last_farming_update: Date.now()
      });
    }
    
    // Reset local state
    setFarmStatus({
      stage: 'initial',
      startTime: null,
      timeRemaining: 0
    });
    setAmountToClaim(0);
    
    // Clear any running intervals
    if (intervalRef.current) {
      if (Array.isArray(intervalRef.current)) {
        intervalRef.current.forEach(interval => {
          if (interval) clearInterval(interval);
        });
      } else {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = null;
    }
  };

  // Restore or initialize farming state on component mount
  useEffect(() => {
    if (!user || actionInProgressRef.current) return;
    
    console.log("User data loaded:", user);
    console.log("Current farming stage:", user.farming_stage);
    console.log("Current farming start time:", user.farming_start_time);

    const currentTime = Date.now();
    
    // Check if there's a saved farming state
    if (user.farming_stage && user.farming_stage !== 'initial') {
      const savedStartTime = parseStoredTimestamp(user.farming_start_time);
      
      console.log("Retrieved start time:", user.farming_start_time);
      console.log("Parsed start time:", savedStartTime, savedStartTime ? new Date(savedStartTime).toISOString() : 'Invalid');
      
      if (!savedStartTime) {
        // Invalid start time, reset to initial
        console.error("Invalid start time, resetting to initial state");
        resetToInitialState();
        return;
      }

      // Determine appropriate interval based on saved stage
      const interval = user.farming_stage === 'farming' 
        ? FARM_INTERVAL 
        : CLAIM_DURATION;
      
      // Calculate elapsed time
      const elapsedTime = currentTime - savedStartTime;
      console.log("Elapsed time since start:", elapsedTime, "ms");
      
      // Calculate accumulated amount if in farming stage
      let accumulatedAmount = 0;
      if (user.farming_stage === 'farming') {
        // Calculate based on elapsed time, capped at maximum farming amount
        const claimRate = calculateClaimAmountPerSecond();
        accumulatedAmount = Math.min(
          claimRate * (elapsedTime / 1000), 
          claimRate * (FARM_INTERVAL / 1000)
        );
        console.log("Calculated accumulated amount:", accumulatedAmount);
      } else if (user.accumulated_amount) {
        // Use stored amount for farmed state
        accumulatedAmount = parseFloat(user.accumulated_amount);
        console.log("Using stored accumulated amount:", accumulatedAmount);
      }
      
      // Determine the state based on elapsed time
      if (elapsedTime >= interval) {
        console.log("Interval has expired. Current stage:", user.farming_stage);
        // Interval has expired, move to next stage or reset
        if (user.farming_stage === 'farming') {
          // Farming interval expired, check if claim period has also expired
          const farmEndTime = savedStartTime + FARM_INTERVAL;
          const claimElapsedTime = currentTime - farmEndTime;
          
          // Calculate final accumulated amount for farming completion
          const finalAccumulatedAmount = calculateClaimAmountPerSecond() * (FARM_INTERVAL / 1000);
          console.log("Final accumulated amount:", finalAccumulatedAmount);
          
          if (claimElapsedTime >= CLAIM_DURATION) {
            // Both farming and claim periods have expired, reset to initial
            console.log("Both farming and claim periods expired");
            resetToInitialState();
          } else {
            // Only farming period expired, move to claim state
            console.log("Farming period expired, entering claim state");
            const remainingClaimTime = CLAIM_DURATION - claimElapsedTime;
            
            setFarmStatus({
              stage: 'farmed',
              startTime: farmEndTime,
              timeRemaining: remainingClaimTime
            });
            
            setAmountToClaim(finalAccumulatedAmount);
            
            // Update user state to reflect 'farmed' status
            updateUser(user.telegram_id, {
              farming_stage: 'farmed',
              farming_start_time: farmEndTime,
              farming_time_remaining: remainingClaimTime,
              accumulated_amount: finalAccumulatedAmount,
              last_farming_update: currentTime
            });
            
            // Start claim countdown with the correct remaining time
            startClaimCountdown(farmEndTime, finalAccumulatedAmount);
          }
        } else if (user.farming_stage === 'farmed') {
          // Claim duration has expired, reset to initial state
          console.log("Claim duration expired, resetting to initial state");
          resetToInitialState();
        }
      } else {
        // Interval not yet expired, restore previous state
        const remainingTime = Math.max(interval - elapsedTime, 0);
        console.log("Interval not expired. Remaining time:", remainingTime);
        
        // Set farm status and accumulated amount
        setFarmStatus({
          stage: user.farming_stage,
          startTime: savedStartTime,
          timeRemaining: remainingTime
        });
        
        setAmountToClaim(accumulatedAmount);
        
        // Restart appropriate countdown based on stage
        if (user.farming_stage === 'farming') {
          console.log("Resuming farming countdown");
          startFarmingCountdown(savedStartTime, accumulatedAmount);
        } else if (user.farming_stage === 'farmed') {
          console.log("Resuming claim countdown");
          startClaimCountdown(savedStartTime, accumulatedAmount);
        }
      }
    } else {
      console.log("No saved farming state or in initial state");
      // No saved state or in initial state
      resetToInitialState();
    }
  }, [user]);

  // Start farming countdown - FIXED version
  const startFarmingCountdown = (startTime = Date.now(), initialAmount = 0) => {
    console.log("Starting farming countdown from:", new Date(startTime).toISOString());
    console.log("Initial amount:", initialAmount);
    
    // Store a fixed reference to the start time
    const fixedStartTime = startTime;
    
    // Clear existing intervals
    if (intervalRef.current) {
      if (Array.isArray(intervalRef.current)) {
        intervalRef.current.forEach(interval => interval && clearInterval(interval));
      } else {
        clearInterval(intervalRef.current);
      }
    }

    // Update farm status with fixed start time
    setFarmStatus({
      stage: 'farming',
      startTime: fixedStartTime,
      timeRemaining: Math.max(0, fixedStartTime + FARM_INTERVAL - Date.now())
    });

    // Calculate and format remaining time
    const timeRemainingMs = Math.max(0, fixedStartTime + FARM_INTERVAL - Date.now());
    const hours = Math.floor(timeRemainingMs / 3600000);
    const minutes = Math.floor((timeRemainingMs % 3600000) / 60000);
    const seconds = Math.floor((timeRemainingMs % 60000) / 1000);

    // Debugging logs with fixed start time
    console.log("Fixed Start Time:", new Date(fixedStartTime).toISOString());
    console.log("FARM_INTERVAL (ms):", FARM_INTERVAL);
    console.log("Current Time:", new Date().toISOString());
    console.log("Expected End Time:", new Date(fixedStartTime + FARM_INTERVAL).toISOString());
    console.log(`Initial Time Remaining: ${hours}h ${minutes}m ${seconds}s (${timeRemainingMs} ms)`);

    let accumulatedAmount = initialAmount;
    const claimRate = calculateClaimAmountPerSecond(); // Get claim rate

    // Start accumulating claimable amount
    const accumulationIntervalId = setInterval(() => {
      const elapsedSeconds = Math.min(
        (Date.now() - fixedStartTime) / 1000,
        FARM_INTERVAL / 1000
      );
      
      // Calculate accumulated amount based on elapsed time
      accumulatedAmount = claimRate * elapsedSeconds;
      setAmountToClaim(parseFloat(accumulatedAmount.toFixed(8))); // More precision
    }, 1000);

    // Save farming state periodically
    const stateSaveInterval = setInterval(() => {
      if (user) {
        updateUser(user.telegram_id, {
          farming_stage: 'farming',
          farming_start_time: fixedStartTime,
          farming_time_remaining: Math.max(0, fixedStartTime + FARM_INTERVAL - Date.now()),
          accumulated_amount: accumulatedAmount,
          last_farming_update: Date.now()
        });
      }
    }, 30000); // Save every 30 sec

    // Countdown interval
    const countdownInterval = setInterval(() => {
      const newTimeRemaining = Math.max(0, fixedStartTime + FARM_INTERVAL - Date.now());

      if (newTimeRemaining <= 0) {
        // Farming finished
        clearInterval(countdownInterval);
        clearInterval(accumulationIntervalId);
        clearInterval(stateSaveInterval);

        const farmEndTime = fixedStartTime + FARM_INTERVAL;
        const finalAccumulatedAmount = claimRate * (FARM_INTERVAL / 1000);

        console.log("Farming finished. Moving to claim state.");
        console.log("Final accumulated amount:", finalAccumulatedAmount);

        // Save final state
        if (user) {
          updateUser(user.telegram_id, {
            farming_stage: 'farmed',
            farming_start_time: farmEndTime,
            farming_time_remaining: CLAIM_DURATION,
            accumulated_amount: finalAccumulatedAmount,
            last_farming_update: Date.now()
          });
        }

        // Update state to "farmed"
        setFarmStatus({
          stage: 'farmed',
          startTime: farmEndTime,
          timeRemaining: CLAIM_DURATION
        });
        
        setAmountToClaim(finalAccumulatedAmount);

        // Start claim countdown
        startClaimCountdown(farmEndTime, finalAccumulatedAmount);
      } else {
        // Update countdown time
        setFarmStatus(prev => ({
          ...prev,
          timeRemaining: newTimeRemaining
        }));
      }
    }, 1000);

    // Store intervals in `intervalRef`
    intervalRef.current = [countdownInterval, stateSaveInterval, accumulationIntervalId];
  };

  // Start claim countdown - FIXED version
  const startClaimCountdown = (startTime = Date.now(), savedAmount = 0) => {
    console.log("Starting claim countdown from:", new Date(startTime).toISOString());
    console.log("Amount to claim:", savedAmount);
    
    // Store a fixed reference to the start time
    const fixedStartTime = startTime;
    
    // Clear any existing interval
    if (intervalRef.current) {
      if (Array.isArray(intervalRef.current)) {
        intervalRef.current.forEach(interval => {
          if (interval) clearInterval(interval);
        });
      } else {
        clearInterval(intervalRef.current);
      }
    }

    // Calculate remaining claim time
    const remainingClaimTime = Math.max(0, fixedStartTime + CLAIM_DURATION - Date.now());

    // Set farm status to claim stage
    setFarmStatus({
      stage: 'farmed',
      startTime: fixedStartTime,
      timeRemaining: remainingClaimTime
    });

    setAmountToClaim(savedAmount);
    
    console.log("Claim Start Time:", new Date(fixedStartTime).toISOString());
    console.log("Current Time:", new Date().toISOString());
    console.log("Expected Claim End Time:", new Date(fixedStartTime + CLAIM_DURATION).toISOString());
    console.log("Remaining Claim Time:", remainingClaimTime);

    // Periodic state save interval
    const stateSaveInterval = setInterval(() => {
      if (user) {
        const timeRemaining = Math.max(0, fixedStartTime + CLAIM_DURATION - Date.now());
        updateUser(user.telegram_id, {
          farming_stage: 'farmed',
          farming_start_time: fixedStartTime,
          farming_time_remaining: timeRemaining,
          accumulated_amount: savedAmount,
          last_farming_update: Date.now()
        });
      }
    }, 30000); // Save every 30 seconds

    // If claim period already expired, reset immediately
    if (remainingClaimTime <= 0) {
      console.log("Claim period already expired");
      clearInterval(stateSaveInterval);
      resetToInitialState();
      return;
    }

    // Countdown interval
    const countdownInterval = setInterval(() => {
      const newTimeRemaining = Math.max(0, fixedStartTime + CLAIM_DURATION - Date.now());
      
      if (newTimeRemaining <= 0) {
        // Claim duration finished
        clearInterval(countdownInterval);
        clearInterval(stateSaveInterval);
        
        // Reset to initial state
        console.log("Claim period has expired - resetting to initial state");
        resetToInitialState();
      } else {
        // Update countdown
        setFarmStatus(prev => ({
          ...prev,
          timeRemaining: newTimeRemaining
        }));
      }
    }, 1000);
    
    intervalRef.current = [countdownInterval, stateSaveInterval];
  };

  // Handle button click
  const handleButtonClick = async () => {
    if (!user || actionInProgressRef.current) return;
    
    // Set flag to prevent multiple clicks
    actionInProgressRef.current = true;
    
    try {
      switch (farmStatus.stage) {
        case 'initial':
          // Start farming
          const startTime = Date.now();
          console.log("Starting new farming session at:", new Date(startTime).toISOString());
          
          // First update local state
          setFarmStatus({
            stage: 'farming',
            startTime: startTime,
            timeRemaining: FARM_INTERVAL
          });
          
          // Then update database (await to ensure it completes)
          await updateUser(user.telegram_id, {
            farming_stage: 'farming',
            farming_start_time: startTime,
            farming_time_remaining: FARM_INTERVAL,
            accumulated_amount: 0,
            last_farming_update: startTime
          });
      
          // Start farming countdown only after database update succeeds
          startFarmingCountdown(startTime);
          break;
            
        case 'farming':
          // Cannot interact during farming
          console.log("Cannot interact during farming");
          break;
            
        case 'farmed':
          // Claim the amount
          console.log("Claiming amount:", amountToClaim);
          const roundedAmountToClaim = parseFloat(amountToClaim.toFixed(2));
          const updatedPoints = parseFloat(
            (Number(user.tms_points || 0) + roundedAmountToClaim).toFixed(2)
          );
          
          console.log("Current points:", user.tms_points);
          console.log("New total points:", updatedPoints);
          
          // First update local state
          setFarmStatus({
            stage: 'initial',
            startTime: null,
            timeRemaining: 0
          });
          setAmountToClaim(0);
          
          // Clear any running intervals
          if (intervalRef.current) {
            if (Array.isArray(intervalRef.current)) {
              intervalRef.current.forEach(interval => {
                if (interval) clearInterval(interval);
              });
            } else {
              clearInterval(intervalRef.current);
            }
            intervalRef.current = null;
          }
          
          // Prepare update data
          const updateData = {
            tms_points: updatedPoints,
            last_claim: Date.now(),
            farming_stage: 'initial',
            farming_start_time: null,
            farming_time_remaining: 0,
            accumulated_amount: 0,
            last_farming_update: Date.now()
          };
          
          // Then update database (await to ensure it completes)
          await updateUser(user.telegram_id, updateData);
          break;
      }
    } catch (error) {
      console.error("Error in handleButtonClick:", error);
      // Handle error - maybe reset to initial state if things fail
      resetToInitialState();
    } finally {
      // Always reset action flag when done
      actionInProgressRef.current = false;
    }
  };

  // Level and points update
  useEffect(() => {
    if (!user || actionInProgressRef.current) return;
    if (user) {
      const points = parseFloat(user.tms_points || 0);
      setUserPoints(points);

      const { lowerLevel, upperLevel, progressPercentage } = calculateLevelProgress(points);
      
      setProgress(progressPercentage);
      setUpperLevel(upperLevel);
      setLowerLevel(lowerLevel);

      // Update claim rate based on level
      const newClaimAmount = calculateClaimAmountPerSecond(lowerLevel);
      setClaimAmountPerSecond(newClaimAmount);
    }
  }, [user]);

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        if (Array.isArray(intervalRef.current)) {
          intervalRef.current.forEach(interval => {
            if (interval) clearInterval(interval);
          });
        } else {
          clearInterval(intervalRef.current);
        }
      }
    };
  }, []);

  if (!user || actionInProgressRef.current) return;

  // Determine status text based on farm stage
  const getStatusText = () => {
    switch (farmStatus.stage) {
      case 'initial':
        return 'Ready to Farm';
      case 'farming':
        return 'Filling in progress';
      case 'farmed':
        return 'Unclaimed Points Resets in';
      default:
        return 'Ready to Farm';
    }
  };

  // Determine button text based on farm stage
  const getButtonText = () => {
    switch (farmStatus.stage) {
      case 'initial':
        return 'FARM';
      case 'farming':
        return `CLAIM AVAILABLE IN ${formatTimeRemaining(farmStatus.timeRemaining)}`;
      case 'farmed':
        return 'CLAIM';
      default:
        return 'FARM';
    }
  };

  return (
    <ResponsivePadding>
      <InfoComponent />
      <div className="flex justify-center items-start overflow-auto w-full min-h-screen">
        <img
          className="fixed w-full h-full object-cover top-0 left-0 -z-10"
          src="/assets/secondbackground.webp"
          alt="Background"
        />

        <div className="relative max-w-md w-full">
          <div className="relative px-4 pt-4">
            {/* Progress Bar */}
            <div className="relative mt-20">
              <div className="h-2 bg-black rounded-full relative z-10 overflow-hidden">
                <div 
                  style={{ width: `${progress}%` }}
                  className="h-full bg-[#FF6B00] rounded-full"
                ></div>
              </div>
              
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white z-20">
                {lowerLevel}
              </div>
              
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white z-20">
                {upperLevel}
              </div>
            </div>

            {/* Game Logo */}
            <div className="flex flex-row items-center justify-center w-full text-center mb-8 relative z-10">
              <img src="/assets/tonmicslogo2.png" alt="Game Logo" />
            </div>

            {/* Stats Box */}
            <div className="bg-white/90 rounded-lg p-4 mb-8 relative z-10">
              <div className="text-black/70 mb-2">{amountToClaim.toFixed(4)}</div>
              
              <div className="flex justify-between items-center">
                <div className="text-black font-medium">{getStatusText()}</div>
                <div className="text-black font-medium">
                  {farmStatus.stage === 'farmed' || farmStatus.stage === 'farming'
                    ? formatTimeRemaining(farmStatus.timeRemaining) 
                    : ''}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-black font-medium">LEVEL {lowerLevel}</div>
                <div className="text-black font-medium">
                  SPEED {claimAmountPerSecond.toFixed(5)} 
                  <img 
                    className="mr-1 w-3 inline" 
                    src="/assets/token.png" 
                    alt="Token" 
                  />/S
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <button 
              onClick={handleButtonClick}
              disabled={farmStatus.stage === 'farming'}
              className={`
                w-full 
                ${farmStatus.stage === 'farming' ? 'bg-[#463112]' : 'bg-[#FAA31E]'}
                text-black py-4 buttons font-bold text-xl mb-8 relative z-10 
                hover:bg-black/80 transition-colors
                ${farmStatus.stage === 'farming' ? 'cursor-not-allowed' : ''}
              `}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </ResponsivePadding>
  );
};

export default FarmPage;