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
  const [farmStatus, setFarmStatus] = useState({
    stage: 'initial', // can be 'initial', 'farming', 'farmed', 'claim_available'
    startTime: null,
    timeRemaining: 0
  });

  const intervalRef = useRef(null);

  // Configurable farming settings
  const FARM_INTERVAL = 4 *60 * 60 * 1000; // 1 minute farming duration for testing
  const CLAIM_DURATION = 10 * 60 * 1000; // 1 minute claim duration for testing

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

  // Calculate dynamic claim amount per second based on level
  const calculateClaimAmountPerSecond = (level = lowerLevel) => {
    return 0.00346 * Math.pow(1.1, level - 1);
  };

  // Improved time formatting function
  const formatTimeRemaining = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedHours = hours.toString().padStart(1, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}H ${formattedMinutes}M ${formattedSeconds}S`;
  };

  // Calculate user's current level and progress
  const calculateLevelProgress = (points) => {
    let currentLevel = 1;
    let levelInfo = calculateLevelThreshold(currentLevel);

    while (points >= levelInfo.end) {
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

  // Restore or initialize farming state on component mount
  useEffect(() => {
    if (user) {
      const currentTime = Date.now();
      
      // Check if there's a saved farming state
      if (user.farming_stage && user.farming_stage !== 'initial') {
        const savedStartTime = user.farming_start_time 
          ? new Date(user.farming_start_time).getTime() 
          : null;
        
        // Determine appropriate interval based on saved stage
        const interval = user.farming_stage === 'farming' 
          ? FARM_INTERVAL 
          : CLAIM_DURATION;
        
        // Calculate elapsed time
        const elapsedTime = savedStartTime 
          ? currentTime - savedStartTime 
          : 0;
        
        // Calculate accumulated amount if in farming stage
        const accumulatedAmount = user.farming_stage === 'farming'
          ? Math.min(
              calculateClaimAmountPerSecond() * (elapsedTime / 1000), 
              calculateClaimAmountPerSecond() * (FARM_INTERVAL / 1000)
            )
          : parseFloat(user.accumulated_amount || 0);
        
        // Determine the state based on elapsed time
        if (elapsedTime >= interval) {
          // Interval has expired, move to next stage or reset
          if (user.farming_stage === 'farming') {
            // Farming interval expired, move to 'farmed' state
            setFarmStatus({
              stage: 'farmed',
              startTime: savedStartTime + FARM_INTERVAL,
              timeRemaining: CLAIM_DURATION
            });
            
            setAmountToClaim(accumulatedAmount);
            
            // Update user state to reflect 'farmed' status
            updateUser(user.telegram_id, {
              farming_stage: 'farmed',
              farming_start_time: new Date(savedStartTime + FARM_INTERVAL).toISOString().replace("T", " ").split(".")[0],
              farming_time_remaining: CLAIM_DURATION,
              accumulated_amount: accumulatedAmount,
              last_farming_update: new Date().toISOString().replace("T", " ").split(".")[0]
            });
            
            // Start claim countdown
            startClaimCountdown(savedStartTime + FARM_INTERVAL, accumulatedAmount);
          } else if (user.farming_stage === 'farmed') {
            // Claim duration has expired, reset to initial state
            updateUser(user.telegram_id, {
              farming_stage: 'initial',
              farming_start_time: null,
              farming_time_remaining: 0,
              accumulated_amount: 0,
              last_farming_update: new Date().toISOString().replace("T", " ").split(".")[0]
            });
            
            // Reset local state
            setFarmStatus({
              stage: 'initial',
              startTime: null,
              timeRemaining: 0
            });
            setAmountToClaim(0);
          }
        } else {
          // Interval not yet expired, restore previous state
          const remainingTime = Math.max(interval - elapsedTime, 0);
          
          // Set farm status and accumulated amount
          setFarmStatus({
            stage: user.farming_stage,
            startTime: savedStartTime,
            timeRemaining: remainingTime
          });
          
          setAmountToClaim(accumulatedAmount);
          
          // Restart appropriate countdown based on stage
          if (user.farming_stage === 'farming') {
            startFarmingCountdown(savedStartTime, accumulatedAmount);
          } else if (user.farming_stage === 'farmed') {
            startClaimCountdown(savedStartTime, accumulatedAmount);
          }
        }
      }
    }
  }, [user]);

  // Start farming countdown
  const startFarmingCountdown = (startTime = Date.now(), initialAmount = 0) => {
    // Clear existing intervals
    if (intervalRef.current) {
      if (Array.isArray(intervalRef.current)) {
        intervalRef.current.forEach(interval => {
          if (interval) clearInterval(interval);
        });
      } else {
        clearInterval(intervalRef.current);
      }
    }

    // Set initial farm status
    setFarmStatus({
      stage: 'farming',
      startTime: startTime,
      timeRemaining: FARM_INTERVAL
    });

    let accumulatedAmount = initialAmount;

    // Start accumulating amount
    const accumulationIntervalId = setInterval(() => {
      const newAmount = accumulatedAmount + calculateClaimAmountPerSecond();
      const cappedAmount = Math.min(
        newAmount, 
        calculateClaimAmountPerSecond() * (FARM_INTERVAL / 1000)
      );
      
      accumulatedAmount = parseFloat(cappedAmount.toFixed(4));
      setAmountToClaim(accumulatedAmount);
    }, 1000);

    // Periodic state save interval
    const stateSaveInterval = setInterval(() => {
      if (user) {
        updateUser(user.telegram_id, {
          farming_stage: 'farming',
          farming_start_time: new Date(startTime).toISOString().replace("T", " ").split(".")[0],
          farming_time_remaining: FARM_INTERVAL,
          accumulated_amount: accumulatedAmount,
          last_farming_update: new Date().toISOString().replace("T", " ").split(".")[0]
        });
      }
    }, 30000); // Save every 30 seconds

    // Countdown interval
    intervalRef.current = [
      setInterval(() => {
        setFarmStatus(prev => {
          const newTimeRemaining = startTime + FARM_INTERVAL - Date.now();
          
          if (newTimeRemaining <= 0) {
            // Farming duration finished
            clearInterval(intervalRef.current[0]);
            clearInterval(accumulationIntervalId);
            clearInterval(stateSaveInterval);
            
            // Save final state
            if (user) {
              updateUser(user.telegram_id, {
                farming_stage: 'farmed',
                farming_start_time: new Date().toISOString().replace("T", " ").split(".")[0],
                farming_time_remaining: CLAIM_DURATION,
                accumulated_amount: accumulatedAmount,
                last_farming_update: new Date().toISOString().replace("T", " ").split(".")[0]
              });
            }
            
            return {
              stage: 'farmed',
              startTime: Date.now(),
              timeRemaining: CLAIM_DURATION
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000),
      stateSaveInterval,
      accumulationIntervalId
    ];
  };

  // Start claim countdown
  const startClaimCountdown = (startTime = Date.now(), savedAmount = 0) => {
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

    // Set farm status to claim stage
    setFarmStatus({
      stage: 'farmed',
      startTime: startTime,
      timeRemaining: CLAIM_DURATION
    });

    setAmountToClaim(savedAmount);

    // Periodic state save interval
    const stateSaveInterval = setInterval(() => {
      if (user) {
        updateUser(user.telegram_id, {
          farming_stage: 'farmed',
          farming_start_time: new Date(startTime).toISOString().replace("T", " ").split(".")[0],
          farming_time_remaining: CLAIM_DURATION,
          accumulated_amount: savedAmount,
          last_farming_update: new Date().toISOString().replace("T", " ").split(".")[0]
        });
      }
    }, 30000); // Save every 30 seconds

    // Countdown interval
    intervalRef.current = [
      setInterval(() => {
        setFarmStatus(prev => {
          const newTimeRemaining = startTime + CLAIM_DURATION - Date.now();
          
          if (newTimeRemaining <= 0) {
            // Claim duration finished
            clearInterval(intervalRef.current[0]);
            clearInterval(stateSaveInterval);
            
            // Reset state in database
            if (user) {
              updateUser(user.telegram_id, {
                farming_stage: 'initial',
                farming_start_time: null,
                farming_time_remaining: 0,
                accumulated_amount: 0,
                last_farming_update: new Date().toISOString().replace("T", " ").split(".")[0]
              });
            }
            
            // Reset local state
            setAmountToClaim(0);
            
            return {
              stage: 'initial',
              startTime: null,
              timeRemaining: 0
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000),
      stateSaveInterval
    ];
  };

  // Handle button click
  const handleButtonClick = () => {
    switch (farmStatus.stage) {
      case 'initial':
        // Start farming
        if (!user) return;
  
        // Immediately update database to farming state
        updateUser(user.telegram_id, {
          farming_stage: 'farming',
          farming_start_time: new Date().toISOString().replace("T", " ").split(".")[0],
          farming_time_remaining: FARM_INTERVAL,
          accumulated_amount: 0,
          last_farming_update: new Date().toISOString().replace("T", " ").split(".")[0]
        });
  
        // Start farming countdown
        startFarmingCountdown();
        break;
      case 'farming':
        // Cannot interact during farming
        break;
      case 'farmed':
        // Claim the amount
        if (!user) return;
        const roundedAmountToClaim = parseFloat(amountToClaim.toFixed(2));
        const updatedPoints = parseFloat(
            (Number(user.tms_points) + roundedAmountToClaim).toFixed(2)
        );
        
        // Prepare update data
        const updateData = {
          tms_points: updatedPoints,
          last_claim: new Date().toISOString().replace("T", " ").split(".")[0],
          farming_stage: 'initial',
          farming_start_time: null,
          farming_time_remaining: 0,
          accumulated_amount: 0,
          last_farming_update: new Date().toISOString().replace("T", " ").split(".")[0]
        };
        
        updateUser(user.telegram_id, updateData);
  
        // Reset local state
        setAmountToClaim(0);
        setFarmStatus({
          stage: 'initial',
          startTime: null,
          timeRemaining: 0
        });
        break;
    }
  };

  // Level and points update
  useEffect(() => {
    if (user) {
      const points = user.tms_points || 0;
      setUserPoints(points);

      const { lowerLevel, upperLevel, progressPercentage } = calculateLevelProgress(points);
      
      setProgress(progressPercentage);
      setUpperLevel(upperLevel);
      setLowerLevel(lowerLevel);

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

  if (!user) return null;

  // Determine status text based on farm stage
  const getStatusText = () => {
    switch (farmStatus.stage) {
      case 'initial':
        return 'Ready to Farm';
      case 'farming':
        return 'Filling in progress';
      case 'farmed':
        return 'Farmed Point Resets in';
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