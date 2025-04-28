
import { useState, useEffect,useRef } from "react"

import { useTelegramWebApp } from "../../../hooks/TelegramProvider"

import { useUser } from "../../../hooks/UserProvider"
import { XCircle } from "lucide-react"
import ResponsivePadding from "../../../components/shared/ResponsivePadding"
import { useNavigate } from "react-router"
import { useSoundManager } from "../../../hooks/SoundManager"

// Updated word fetching function that always uses fixed positions
// Modified fetchRandomThreeLetterWords function to adjust grid sizes
export const fetchRandomThreeLetterWords = async (level = 1) => {
  try {
    // Define constraints
    const minSize = 3;
    const maxSize = 7;
    const levelToReachMax = 10;

    // Calculate grid sizes based on level
    const progressFactor = Math.min((level - 1) / (levelToReachMax - 1), 1);
    const sizeRange = maxSize - minSize;
    let baseSize = minSize + Math.floor(progressFactor * sizeRange);

    let row1Length = baseSize;
    let row2Length = baseSize;
    let row3Length = baseSize;

    // Add variation
    if (level < levelToReachMax) {
      const variation = level % 3;
      if (variation === 1) {
        row2Length = Math.min(row2Length + 1, maxSize);
      } else if (variation === 2) {
        row1Length = Math.min(row1Length + 1, maxSize);
        row3Length = Math.min(row3Length + 1, maxSize);
      }
    } else if (level > levelToReachMax) {
      const superLevelFactor = Math.floor((level - levelToReachMax) / 5) % 3;
      if (superLevelFactor === 1) {
        const variation = level % 2;
        if (variation === 0) {
          row1Length = maxSize - 1;
          row3Length = maxSize - 1;
        } else {
          row2Length = maxSize - 1;
        }
      }
    }

    // Clamp to bounds
    row1Length = Math.min(Math.max(row1Length, minSize), maxSize);
    row2Length = Math.min(Math.max(row2Length, minSize), maxSize);
    row3Length = Math.min(Math.max(row3Length, minSize), maxSize);

    const totalCells = row1Length + row2Length + row3Length;
    console.log(`Grid layout: ${row1Length}-${row2Length}-${row3Length} (${totalCells} cells) for level ${level}`);

    // Fetch words
    const wordResponses = await Promise.all([
      fetch(`https://api.datamuse.com/words?ml=game&sp=${"?".repeat(row1Length)}&max=20`),
      fetch(`https://api.datamuse.com/words?ml=game&sp=${"?".repeat(row2Length)}&max=20`),
      fetch(`https://api.datamuse.com/words?ml=game&sp=${"?".repeat(row3Length)}&max=20`)
    ]);

    if (!wordResponses.every(response => response.ok)) {
      throw new Error('Failed to fetch words');
    }

    const wordData = await Promise.all(wordResponses.map(response => response.json()));

    // Track used words
    const usedWords = new Set();

    const processedWords = wordData.map((data, index) => {
      const rowLength = [row1Length, row2Length, row3Length][index];
      return data
        .map(item => item.word.toUpperCase())
        .filter(word => word.length === rowLength);
    });

    if (processedWords.some(words => words.length < 1)) {
      throw new Error("Not enough words found for at least one row");
    }

    const fixedPositions = [
      Array.from({ length: row1Length }, (_, i) => i),
      Array.from({ length: row2Length }, (_, i) => i + row1Length),
      Array.from({ length: row3Length }, (_, i) => i + row1Length + row2Length)
    ];

    const wordsWithPositions = processedWords.map((words, index) => {
      const availableWords = words.filter(word => !usedWords.has(word));
      if (availableWords.length === 0) {
        throw new Error("No unique words available for one row");
      }
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      usedWords.add(randomWord);
      
      return {
        word: randomWord,
        positions: fixedPositions[index]
      };
    });

    console.log("Words with positions:", wordsWithPositions);

    const allPositions = new Set();
    wordsWithPositions.forEach(wordObj => {
      wordObj.positions.forEach(pos => allPositions.add(pos));
    });

    if (allPositions.size !== totalCells) {
      console.error(`Position mismatch: ${allPositions.size} positions mapped for ${totalCells} cells`);
    }

    return {
      words: wordsWithPositions,
      gridSizes: [row1Length, row2Length, row3Length],
      totalCells
    };

  } catch (error) {
    console.error(error.message);

    // Fallback layout
    const minSize = 3;
    const maxSize = 7;
    const levelToReachMax = 10;

    const progressFactor = Math.min((level - 1) / (levelToReachMax - 1), 1);
    const baseSize = Math.min(minSize + Math.floor(progressFactor * (maxSize - minSize)), maxSize);

    let fallbackLayout = [baseSize, baseSize, baseSize];

    if (level < levelToReachMax) {
      if (level % 3 === 1) {
        fallbackLayout[1] = Math.min(fallbackLayout[1] + 1, maxSize);
      } else if (level % 3 === 2) {
        fallbackLayout[0] = Math.min(fallbackLayout[0] + 1, maxSize);
        fallbackLayout[2] = Math.min(fallbackLayout[2] + 1, maxSize);
      }
    } else if (level > levelToReachMax) {
      const superLevelFactor = Math.floor((level - levelToReachMax) / 5) % 3;
      if (superLevelFactor === 1) {
        const variation = level % 2;
        if (variation === 0) {
          fallbackLayout[0] = maxSize - 1;
          fallbackLayout[2] = maxSize - 1;
        } else {
          fallbackLayout[1] = maxSize - 1;
        }
      }
    }

    const totalCells = fallbackLayout.reduce((sum, size) => sum + size, 0);

    const fallbackPositions = [
      Array.from({ length: fallbackLayout[0] }, (_, i) => i),
      Array.from({ length: fallbackLayout[1] }, (_, i) => i + fallbackLayout[0]),
      Array.from({ length: fallbackLayout[2] }, (_, i) => i + fallbackLayout[0] + fallbackLayout[1])
    ];

    const wordCollections = {
      3: ["FUN", "TRY", "WIN", "TOP", "NEW", "BIG", "BOX", "CAT", "DOG", "EGG", "FOX", "GYM", "HAT", "ICE", "JAM"],
      4: ["GAME", "PLAY", "WORD", "STEP", "MOVE", "TIME", "JUMP", "FAST", "CUBE", "DASH", "EASY", "GOLD", "HERO"],
      5: ["LEVEL", "POWER", "SKILL", "BRAIN", "SMART", "QUICK", "HAPPY", "BLAST", "CHASE", "DREAM", "FRESH"],
      6: ["PUZZLE", "TALENT", "WISDOM", "MASTER", "ACTION", "BOUNCE", "CLEVER", "DELIGHT", "ENERGY", "FUTURE"],
      7: ["AMAZING", "SUCCESS", "VICTORY", "TRIUMPH", "BELIEVE", "CAPABLE", "DYNAMIC", "EARNING", "FORWARD"]
    };

    const usedWords = new Set();

    const fallbackWords = [];
    for (let i = 0; i < 3; i++) {
      const wordLength = fallbackLayout[i];
      const wordCollection = wordCollections[wordLength];
      const availableWords = wordCollection.filter(word => !usedWords.has(word));
      const word = availableWords[Math.floor(Math.random() * availableWords.length)];
      usedWords.add(word);

      fallbackWords.push({
        word: word,
        positions: fallbackPositions[i]
      });
    }

    return {
      words: fallbackWords,
      gridSizes: fallbackLayout,
      totalCells
    };
  }
};

  
  
  
  
  
  export const validateWordWithAPIV = async (word) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) return false; // API returns 404 if word is invalid
      const data = await response.json();
      return data.length > 0; // Valid word if response has entries
    } catch (error) {
      console.error("Error validating word with API:", error);
      return false;
    }
  };
  
  export const validateWordWithAPI = async (word) => {
    try {
      // Query Datamuse using the 'sp' parameter for an exact (case-insensitive) match
      const response = await fetch(`https://api.datamuse.com/words?sp=${word.toLowerCase()}&max=1`);
      if (!response.ok) return false;
      
      const data = await response.json();
      if (data.length === 0) return false;
      
      // Check if the returned word exactly matches (ignoring case)
      return data[0].word.toLowerCase() === word.toLowerCase();
    } catch (error) {
      console.error("Error validating word with Datamuse API:", error);
      return false;
    }
  };
  
  
  // Helper function to check if a word is complete (no empty spaces)
  export const isCompleteWord = (word) => {
    return word.trim() !== "" && !word.includes(" ") && !word.includes("");
  };

const JumbleJestersGame = () => {
  const navigate=useNavigate()
  const { 
    playSound,
    toggleMute,
    isMuted,
    playBackgroundMusic,
    stopBackgroundMusic,
    switchBackgroundMusic,
    fadeToTrack,
    duckBackgroundMusic,
    currentMusicTrack,
    getAvailableMusicTracks,
    getAvailableMainThemes,
    volume,
    adjustVolume,
    isLoaded,
    forceInitialize,
    // Playlist controls
    startPlaylist,
    stopPlaylist,
    playNextInPlaylist   // Add this if you want to track the current music
  } = useSoundManager();
  const { user } = useTelegramWebApp()
  // Game state
  const { updateUser } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedLetterIndex, setSelectedLetterIndex] = useState(null)
  const [selectedGridIndex, setSelectedGridIndex] = useState(null)
  const [timer, setTimer] = useState(0)
  const [level, setLevel] = useState(1)
  const [hintsUsed, setHintsUsed] = useState(null)
  const [shufflesUsed, setShufflesUsed] = useState(null)
  const [purchasedHints, setPurchasedHints] = useState(0)
  const [purchasedShuffles, setPurchasedShuffles] = useState(0)
  const [lastHintTime, setLastHintTime] = useState(user?.last_hint || null)
  const [lastShuffleTime, setLastShuffleTime] = useState(user?.last_shuffle || null)
  const [hintCountdown, setHintCountdown] = useState("")
  const [shuffleCountdown, setShuffleCountdown] = useState("")
  const [countdownInterval, setCountdownInterval] = useState(null)
  const [gridSizes, setGridSizes] = useState([4, 4, 3]); // Default grid layout
  const [totalCells, setTotalCells] = useState(11); // Default total cells
  const [grid, setGrid] = useState(Array(11).fill("")); // Initialize with default size
  const tmsPoints = user?.tms_points || 0
  const gems = user?.gems || 0
  const [highScore, setHighScore] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  const [toastMessage2, setToastMessage2] = useState("")
  const [timerInterval, setTimerInterval] = useState(null)
  const [currentLevelWords, setCurrentLevelWords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [validatingWords, setValidatingWords] = useState(false)
  const [letters, setLetters] = useState([])
  const [autoLevelAdvanceScheduled, setAutoLevelAdvanceScheduled] = useState(false);
  const [trialsUsed, setTrialsUsed] = useState(null);

  const [freeTrials, setFreeTrials] = useState(null);
  const [purchasedTrials, setPurchasedTrials] = useState(null);
  const [availableTrials, setAvailableTrials] = useState(null);
const [lastTrialTime, setLastTrialTime] = useState(null); // Track when free trials were used up
const [trialCountdown, setTrialCountdown] = useState(""); // For timer display
const timerStarted = useRef(false);
const [totalTrials, setTotalTrials] = useState(3); 
  // Add these near your other state definitions
const gridRef = useRef([]);
const currentLevelWordsRef = useRef([]);
const levelRef = useRef(1)

const [highestLevel, setHighestLevel] = useState(1); // Default to level 1
const [highestScore, setHighestScore] = useState(0); // Track highest score separately from TMS points

// 2. Add new refs for these values to access in functions that use refs
const highestLevelRef = useRef(1);
const highestScoreRef = useRef(0);

const [sessionScore, setSessionScore] = useState(0);
const sessionScoreRef = useRef(0);
const [toastMessage3, setToastMessage3] = useState("");
 
useEffect(() => {
  if (isLoaded) {
    // Need to call this from a user interaction event
    // like a button click due to browser autoplay policies
    console.log('Sounds are loaded and ready');
  }
  
  return () => {
    stopBackgroundMusic();
  };
}, [isLoaded, stopBackgroundMusic]);

useEffect(() => {
  console.log(`Sound system status: ${isLoaded ? 'Loaded' : 'Loading'}`);
  
  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) {
    const handleFirstInteraction = () => {
      console.log('First interaction detected, starting main theme playlist');
      // Start a shuffled playlist of all main themes instead of just one track
      startPlaylist(getAvailableMainThemes(), true);
      gameContainer.removeEventListener('click', handleFirstInteraction);
    };
    
    gameContainer.addEventListener('click', handleFirstInteraction);
    
    return () => {
      gameContainer.removeEventListener('click', handleFirstInteraction);
      stopBackgroundMusic(); // This will also stop any playlist
    };
  }
}, [isLoaded, startPlaylist, getAvailableMainThemes, stopBackgroundMusic]);


useEffect(() => {
  if (isLoaded) {
    console.log("Sound system loaded, initializing...");
    
    // Create a one-time initialization function
    const initializeSound = () => {
      // Try to initialize the sound system with the first user interaction
      playSound('select');
      
      if (!isMuted) {
        // If you want to use the playlist system instead of a single track:
        startPlaylist(getAvailableMainThemes(), true); // Start a shuffled playlist of main themes
        // Or keep using the original function for a single track:
        // playBackgroundMusic();
      }
      
      // Remove these event listeners once we've initialized
      document.removeEventListener('click', initializeSound);
      document.removeEventListener('touchstart', initializeSound);
      document.removeEventListener('keydown', initializeSound);
    };
    
    // Add listeners for the first interaction
    document.addEventListener('click', initializeSound, { once: true });
    document.addEventListener('touchstart', initializeSound, { once: true });
    document.addEventListener('keydown', initializeSound, { once: true });
    
    return () => {
      // Clean up listeners if component unmounts before initialization
      document.removeEventListener('click', initializeSound);
      document.removeEventListener('touchstart', initializeSound);
      document.removeEventListener('keydown', initializeSound);
      stopBackgroundMusic(); // This will also stop any playlist
    };
  }
}, [isLoaded, isMuted, playSound, playBackgroundMusic, stopBackgroundMusic, startPlaylist, getAvailableMainThemes]);


// Update the refs whenever their respective states change
useEffect(() => {
  gridRef.current = grid;
}, [grid]);

useEffect(() => {
  currentLevelWordsRef.current = currentLevelWords;
}, [currentLevelWords]);

useEffect(() => {
  levelRef.current = level;
}, [level]);

useEffect(() => {
  if (user && user.telegram_id) {
    // Make sure user is actually loaded with proper data
    console.log("Setting user hint/shuffle data:", user.hint_count, user.shuffle_count);

    // Fix: Make sure we properly handle different data types
    // Some databases might return strings instead of numbers
    const hintCount = user.hint_count !== undefined && user.hint_count !== null ? Number(user.hint_count) : 0;
    const shuffleCount = user.shuffle_count !== undefined && user.shuffle_count !== null ? Number(user.shuffle_count) : 0;
   
    setHintsUsed(hintCount);
    setShufflesUsed(shuffleCount);

    // Set timestamps for last hint/shuffle
    setLastHintTime(user.last_hint || null);
    setLastShuffleTime(user.last_shuffle || null);
    
    // Parse the stored timestamp correctly
    if (user.last_jumbo === null || user.last_jumbo === undefined) {
      setLastTrialTime(null);
    } else {
      // Parse the stored timestamp correctly if not null
      const parsedLastJumbo = parseStoredTimestamp(user.last_jumbo);
      setLastTrialTime(parsedLastJumbo);
    }

    const storedHighestLevel = user.highest_level || 1;
    const storedHighestScore = user.highest_score || 0;
    
    setHighestLevel(storedHighestLevel);
    setHighestScore(storedHighestScore);
    
    // Update refs
    highestLevelRef.current = storedHighestLevel;
    highestScoreRef.current = storedHighestScore;
    
  }
}, [user]);

// Add this useEffect to initialize the trial counts when user data loads
useEffect(() => {
  if (user && user.telegram_id) {
    // Get trial counts from user data
    const freeTr = user.free_trials !== undefined ? Number(user.free_trials) : 0;
    const purchasedTr = user.purchased_trials !== undefined ? Number(user.purchased_trials) : 0;
    
    // Set the states
    setFreeTrials(freeTr);

    setPurchasedTrials(purchasedTr);
    setAvailableTrials(freeTr + purchasedTr);
    
    // Also set last trial time if it exists
    
  }
}, [user]);

useEffect(() => {
  if (!user) {
    // Don't run the timer until we have proper data
    return;
  }

  // Only start timer if lastTrialTime exists
  if (lastTrialTime) {
    const checkAndUpdateTimer = () => {
      const now = Date.now();
      const timeElapsed = now - lastTrialTime;
      const timeRemaining = 24 *60 * 60 * 1000 - timeElapsed;
      console.log(timeRemaining);
      
      if (timeRemaining <= 0) {
        // Reset only the free trials to 3
        const newFreeTrials = 3;
        const totalTrials = newFreeTrials + (purchasedTrials || 0);
        
        setFreeTrials(newFreeTrials);
        setAvailableTrials(totalTrials);
        setLastTrialTime(null);
        setTrialCountdown("");
        
        // Update both fields in the database
        updateUser(user?.telegram_id, { 
          free_trials: newFreeTrials, 
          purchased_trials: purchasedTrials,
          last_jumbo: null 
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
        
        setTrialCountdown(`${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`);
      }
    };
    
    // Initial check
    checkAndUpdateTimer();
    
    // Set interval to update every second
    const interval = setInterval(checkAndUpdateTimer, 1000);
    
    return () => clearInterval(interval);
  } else {
    // Clear any countdown if lastTrialTime is null
    setTrialCountdown("");
  }
}, [lastTrialTime, user, purchasedTrials]); // Remove freeTrials and purchasedTrials from dependencies
  // Add this useEffect to see when the state values actually change
  useEffect(() => {
    if (shufflesUsed !== null) {
      console.log("Updated shufflesUsed state:", shufflesUsed)
    }
  }, [shufflesUsed])

  useEffect(() => {
    if (hintsUsed !== null) {
      console.log("Updated hintsUsed state:", hintsUsed)
    }
  }, [hintsUsed])

  useEffect(() => {
    if (user) {
      console.log("Updated User Data:", user)
      console.log("c", currentLevelWords)
    }
  }, [user, currentLevelWords])
  // In the setupGame function after setting the timer
  useEffect(() => {
    console.log("Timer value changed:", timer);
  }, [timer]);
  
  useEffect(() => {
    console.log("Timer interval changed:", timerInterval);
    return () => {
      if (timerInterval) {
        console.log("Cleaning up timer interval on effect cleanup");
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

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
const formatCountdown = (timeInMs) => {
  if (timeInMs <= 0) return "00:00:00"

  const totalSeconds = Math.floor(timeInMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

// Add this useEffect to handle the countdown timer
useEffect(() => {
  // Clear any existing interval when component mounts or unmounts
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  // Start a new interval that runs every second
  const interval = setInterval(() => {
    const now = new Date().getTime()

    // Calculate hint countdown if user has used all free hints
    if (hintsUsed >= 3 && lastHintTime) {
      // For testing: 1 minute (60000 ms)
      // For production: 24 hours (24 * 60 * 60 * 1000)
      const resetTime = 24 * 60 * 60 * 1000 // 24 hours
      const hintResetAt = new Date(lastHintTime).getTime() + resetTime
      const timeLeft = hintResetAt - now

      if (timeLeft <= 0) {
        // Time is up, reset hint count
        setHintsUsed(0)
        setLastHintTime(null)
        setHintCountdown("")
        updateUser(user?.telegram_id, { hint_count: 0 })
      } else {
        // Update the countdown
        setHintCountdown(formatCountdown(timeLeft))
      }
    } else {
      setHintCountdown("")
    }

    // Calculate shuffle countdown if user has used all free shuffles
    if (shufflesUsed >= 3 && lastShuffleTime) {
      const resetTime = 24 * 60 * 60 * 1000 // 24 hours
      const shuffleResetAt = new Date(lastShuffleTime).getTime() + resetTime
      const timeLeft = shuffleResetAt - now

      if (timeLeft <= 0) {
        // Time is up, reset shuffle count
        setShufflesUsed(0)
        setLastShuffleTime(null)
        setShuffleCountdown("")
        updateUser(user?.telegram_id, { shuffle_count: 0 })
      } else {
        // Update the countdown
        setShuffleCountdown(formatCountdown(timeLeft))
      }
    } else {
      setShuffleCountdown("")
    }
  }, 1000)

  setCountdownInterval(interval)

  // Clean up interval on unmount
  return () => {
    if (interval) {
      clearInterval(interval)
    }
  }
}, [hintsUsed, lastHintTime, shufflesUsed, lastShuffleTime, user])

// Get current level words - now using the dynamically fetched words
useEffect(() => {
  if (gameStarted) {
    loadWords()
  }
}, [level, gameStarted])



// Function to load words from API
const loadWords = async () => { 
  console.log("Loading words for level:", levelRef.current);
  console.log("Game started:", gameStarted);
  
  setIsLoading(true);
  try {
    // Pass the level to fetchRandomThreeLetterWords
    const wordData = await fetchRandomThreeLetterWords(levelRef.current);
    console.log("Loaded new words:", wordData);
  
    // Update grid size information
    setGridSizes(wordData.gridSizes);
    setTotalCells(wordData.totalCells);
    
    // Reset grid with new size
    setGrid(Array(wordData.totalCells).fill(""));
    setLetters([]);
  
    // Set current level words with fresh data
    setCurrentLevelWords(wordData.words);
    setIsLoading(false);
    setupGame(wordData.words);
  } catch (error) {
    console.error("Error loading words:", error);
    setIsLoading(false);
    
     let fallbackLayout;
    
   
     if (levelRef.current <= 2) {
      fallbackLayout = [3, 3, 3];
    } else if (levelRef.current <= 4) {
      fallbackLayout = [3, 4, 4];
    } else if (levelRef.current <= 6) {
      fallbackLayout = [4, 4, 4];
    } else {
      fallbackLayout = [4, 5, 4];
    }
    const totalFallbackCells = fallbackLayout.reduce((sum, size) => sum + size, 0);
    
    setGridSizes(fallbackLayout);
    setTotalCells(totalFallbackCells);
    setGrid(Array(totalFallbackCells).fill(""));
    
    // Use fallback words based on level
    const fallbackPositions = [
      Array.from({ length: fallbackLayout[0] }, (_, i) => i),
      Array.from({ length: fallbackLayout[1] }, (_, i) => i + fallbackLayout[0]),
      Array.from({ length: fallbackLayout[2] }, (_, i) => i + fallbackLayout[0] + fallbackLayout[1])
    ];
    
    const fallbackWords = [
      { word: fallbackLayout[0] === 3 ? "FUN" : "GAME", positions: fallbackPositions[0] },
      { word: fallbackLayout[1] === 3 ? "TRY" : "PLAY", positions: fallbackPositions[1] },
      { word: fallbackLayout[2] === 3 ? "WIN" : "WORD", positions: fallbackPositions[2] }
    ];
    
    console.log("Using fallback words:", fallbackWords);
    setCurrentLevelWords(fallbackWords);
    setupGame(fallbackWords);
  }
  };
  
  
  // Modified setupGame function with fixed letter generation for rack
const setupGame = (words) => {
  // Initialize hint/shuffle counts (keep as is)
  if (hintsUsed === null && user && typeof user.hint_count === "number") {
    setHintsUsed(user.hint_count);
  }
  
  if (shufflesUsed === null && user && typeof user.shuffle_count === "number") {
    setShufflesUsed(user.shuffle_count);
  }
  
  // Check and update totalCells BEFORE creating the grid
  const highestPosition = Math.max(...words.flatMap(wordObj => wordObj.positions));
  const effectiveTotalCells = highestPosition >= totalCells ? highestPosition + 1 : totalCells;
  
  if (effectiveTotalCells > totalCells) {
    setTotalCells(effectiveTotalCells);
  }
  
  // Clear grid with the correct size
  const newGrid = Array(effectiveTotalCells).fill("");
  
  // Create direct mapping of positions to letters
  const positionToLetterMap = new Map();
  
  // Map every position to its expected letter
  words.forEach(wordObj => {
    const word = wordObj.word;
    const positions = wordObj.positions;
    
    positions.forEach((pos, idx) => {
      if (pos >= 0 && pos < effectiveTotalCells) {
        positionToLetterMap.set(pos, word[idx]);
      }
    });
  });
  
  // Calculate row width (assuming grid is square)
  const rowWidth = Math.ceil(Math.sqrt(effectiveTotalCells));
  
  // FIRST PASS: Attempt to prefill grid with balanced approach
  words.forEach(wordObj => {
    wordObj.positions.forEach((position, index) => {
      if (position >= 0 && position < effectiveTotalCells) {
        // Higher chance (60%) to prefill letters
        if (Math.random() < 0.6) {
          newGrid[position] = wordObj.word[index];
        }
      }
    });
  });
  
  // SECOND PASS: Ensure each row has at least 1-2 prefilled letters
  for (let row = 0; row < Math.ceil(effectiveTotalCells / rowWidth); row++) {
    const rowStart = row * rowWidth;
    const rowEnd = Math.min(rowStart + rowWidth, effectiveTotalCells);
    
    // Count filled cells in this row
    let filledInRow = 0;
    for (let i = rowStart; i < rowEnd; i++) {
      if (newGrid[i] !== "") filledInRow++;
    }
    
    // If row has no filled cells, fill 1-2 random positions
    if (filledInRow === 0) {
      // Get all valid positions in this row that have letter mappings
      const validPositions = [];
      for (let i = rowStart; i < rowEnd; i++) {
        if (positionToLetterMap.has(i)) {
          validPositions.push(i);
        }
      }
      
      if (validPositions.length > 0) {
        // Choose 1-2 random positions to fill
        const numToFill = Math.min(validPositions.length, 1 + Math.floor(Math.random() * 2));
        for (let i = 0; i < numToFill; i++) {
          const randomIndex = Math.floor(Math.random() * validPositions.length);
          const posToFill = validPositions[randomIndex];
          newGrid[posToFill] = positionToLetterMap.get(posToFill);
          validPositions.splice(randomIndex, 1); // Remove this position from options
        }
      }
    }
  }
  
  // THIRD PASS: Ensure no row is completely filled (max 80% filled)
  for (let row = 0; row < Math.ceil(effectiveTotalCells / rowWidth); row++) {
    const rowStart = row * rowWidth;
    const rowEnd = Math.min(rowStart + rowWidth, effectiveTotalCells);
    const rowLength = rowEnd - rowStart;
    
    // Count filled cells in this row
    let filledInRow = 0;
    for (let i = rowStart; i < rowEnd; i++) {
      if (newGrid[i] !== "") filledInRow++;
    }
    
    // If row is too full (more than 80%), randomly empty some cells
    const maxFillPercentage = 0.6;
    if (filledInRow > rowLength * maxFillPercentage) {
      const positionsToEmpty = filledInRow - Math.floor(rowLength * maxFillPercentage);
      let emptied = 0;
      
      while (emptied < positionsToEmpty) {
        const randomPos = rowStart + Math.floor(Math.random() * rowLength);
        if (newGrid[randomPos] !== "") {
          newGrid[randomPos] = "";
          emptied++;
        }
      }
    }
  }
  
  // Identify all empty positions after grid adjustments
  const emptyPositions = newGrid.map((cell, idx) => cell === "" ? idx : -1).filter(idx => idx !== -1);
  
  // Track which letters we need and the count for each letter
  const letterNeeds = new Map(); // letter -> count needed
  
  // For each empty position, get the correct letter and increment its count
  emptyPositions.forEach(pos => {
    const letter = positionToLetterMap.get(pos);
    if (letter) {
      letterNeeds.set(letter, (letterNeeds.get(letter) || 0) + 1);
    } else {
      console.warn(`Missing letter mapping for position: ${pos}`);
      // Fallback
      const randomWord = words[Math.floor(Math.random() * words.length)].word;
      const randomLetter = randomWord[Math.floor(Math.random() * randomWord.length)];
      letterNeeds.set(randomLetter, (letterNeeds.get(randomLetter) || 0) + 1);
    }
  });
  
  // Build the rack with exactly the needed number of each letter
  const requiredLetters = [];
  letterNeeds.forEach((count, letter) => {
    // Add this letter to the rack exactly as many times as needed
    for (let i = 0; i < count; i++) {
      requiredLetters.push(letter);
    }
  });
  
  // Add distraction letters to the rack
  const distractionLetterCount = Math.ceil(requiredLetters.length * 0.3); // Add ~30% extra distraction letters
  
  const distractionLetters = [];
  for (let i = 0; i < distractionLetterCount; i++) {
    // Randomly select letters that appear in the puzzle words to make them more confusing
    const randomWordObj = words[Math.floor(Math.random() * words.length)];
    const randomLetter = randomWordObj.word[Math.floor(Math.random() * randomWordObj.word.length)];
    distractionLetters.push(randomLetter);
  }
  
  // Combine required and distraction letters
  const allRackLetters = [...requiredLetters, ...distractionLetters];
  
  // Shuffle the rack
  const shuffledRack = [...allRackLetters].sort(() => 0.5 - Math.random());
  
  // Set state with fixed data
  setLetters(shuffledRack);
  setGrid(newGrid);
  
  // FIXED: Timer calculation based on percentage of empty cells
  // Calculate empty percentage (empty cells / total cells)
  const emptyPercentage = emptyPositions.length / effectiveTotalCells;
  
  // Define minimum and maximum times
  const minTime = 15; // Minimum time when very few empty cells
  const maxTime = 60; // Maximum time when lots of empty cells
  
  // Simple direct linear relationship - timer is directly proportional to empty percentage
  // If 10% cells empty → timer closer to 15s
  // If 90% cells empty → timer closer to 60s
  const baseTime = minTime + Math.floor(emptyPercentage * (maxTime - minTime));
  
  console.log(`Empty cells: ${emptyPositions.length}/${effectiveTotalCells} (${(emptyPercentage * 100).toFixed(1)}%) → Timer: ${baseTime}s`);
  
  // Additional time based on level difficulty
  let levelMultiplier;
  if (levelRef.current <= 2) {
    levelMultiplier = 0.7;
  } else if (levelRef.current <= 5) {
    levelMultiplier = 0.6;
  } else if (levelRef.current <= 10) {
    levelMultiplier = 0.5;
  } else {
    levelMultiplier = 0.4;
  }
  
  // Calculate final timer
 // Calculate final timer
 let roundTimer = Math.ceil(baseTime * levelMultiplier);
  
 // Ensure timer stays within reasonable bounds
 roundTimer = Math.max(15, Math.min(60, roundTimer));
 
 // IMPORTANT: Clear any existing timer before setting a new one
 if (timerInterval) {
   clearInterval(timerInterval);
   setTimerInterval(null);
 }
 
 setTimer(roundTimer);
 
 // Check if timer is already started to prevent multiple timer starts
 if (!timerStarted.current) {
   timerStarted.current = true;
   setTimeout(() => {
     startTimer();
     // Reset the flag after timer is started
     timerStarted.current = false;
   }, 100);
 }
};
  // Initialize game
const initializeGame = async() => {

  

  sessionScoreRef.current = 0;
  setSessionScore(0);

   // Try to use a trial
   const success = await useOneTrial();
   if (!success) {
     return; // Don't restart game if no trials available
   }

  
  // Double-check that we have the user data before starting
  if (user && hintsUsed === null) {
    setHintsUsed(typeof user.hint_count === "number" ? user.hint_count : 0);
  }
  
  if (user && shufflesUsed === null) {
    setShufflesUsed(typeof user.shuffle_count === "number" ? user.shuffle_count : 0);
  }
  
  // Start with grid size 3-4-3 for level 1
  const defaultLayout = [3, 4, 3]; // Changed from [4, 4, 3]
  const defaultTotalCells = defaultLayout.reduce((sum, size) => sum + size, 0);
    
  setGridSizes(defaultLayout);
  setTotalCells(defaultTotalCells);
  
  // Make sure grid and letters are reset
  setGrid(Array(defaultTotalCells).fill(""));
  setLetters([]);
  setSelectedLetterIndex(null);
  setSelectedGridIndex(null);
  
  setGameStarted(true);
  
  // Start with a clean slate for currentLevelWords
  setCurrentLevelWords([]);
  loadWords();
  };
  
 
  
  // Timer logic
  const startTimer = () => {
    // Always clear existing interval first
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
   
    // Add a check to prevent starting a timer if one is already running
    if (timerInterval !== null) {
      console.log("Timer already running, not starting a new one");
      return;
    }
   
    console.log("Starting new timer from:", timer);
   
    const interval = setInterval(() => {
      setTimer((prevTime) => {
        if (isSubmitting) {
          return prevTime; // Pause timer during submission
        }
  
        // Play countdown sound when time is decreasing
        // You might want to only play it during the last 5 seconds
        if (prevTime === 3) {
          playSound('countdown', true, 0.9, 3000); 
        }
        
       
        
  
        if (prevTime <= 1) {
          clearInterval(interval);
          setTimerInterval(null);
          if (!isSubmitting) {
            setTimeout(() => handleTimeUp(), 0);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
   
    setTimerInterval(interval);
  };
  
  
  // Handle time up
  const handleTimeUp = async () => {
    console.log("Time up! Current grid state:", gridRef.current);
    console.log("Current words to validate:", currentLevelWordsRef.current);
    console.log("level:", level);
    
    // IMPORTANT: Immediately stop the timer and ensure it's null
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Explicitly set timer to 0 to avoid any display issues
    setTimer(0);
    setValidatingWords(true);
    
    const currentGrid = [...gridRef.current];
    const wordsToValidate = [...currentLevelWordsRef.current];
    
    let correct = 0;
    let earnedPoints = 0;
    const wordResults = [];
    
    for (let i = 0; i < wordsToValidate.length; i++) {
      const wordObj = wordsToValidate[i];
      const word = wordObj.word;
      const positions = wordObj.positions;
      
      // Extract filled letters from grid
      const filledLetters = positions.map(pos => currentGrid[pos]);
      const gridWord = filledLetters.join("");
      
      // Check if word is completely filled
      const isComplete = !filledLetters.includes("");
      
      // Skip validation for incomplete words
      if (!isComplete) {
        wordResults.push({
          expected: word,
          filled: gridWord,
          isCorrect: false,
          points: 0,
          length: word.length,
          isComplete: false
        });
        continue;
      }
      
      // Use API validation for complete words
      let isWordValid = false;
      try {
        // Convert to lowercase for API validation
        isWordValid = await validateWordWithAPI(gridWord.toLowerCase());
        console.log(`API validation for "${gridWord}": ${isWordValid ? "Valid" : "Invalid"}`);
      } catch (error) {
        console.error(`API validation failed for "${gridWord}":`, error);
        // Fallback validation - exact match with expected word
        isWordValid = gridWord === word;
        console.log(`Fallback validation: "${gridWord}" equals "${word}"? ${isWordValid}`);
      }
      
      // Calculate points if word is valid
      let wordPoints = 0;
      if (isWordValid) {
        correct++;
        
        // Calculate points based on word length
        switch (gridWord.length) {
          case 3: wordPoints = 100; break;
          case 4: wordPoints = 150; break;
          case 5: wordPoints = 200; break;
          case 6: wordPoints = 250; break;
          case 7: wordPoints = 300; break;
          default: wordPoints = gridWord.length * 100;
        }
        
        earnedPoints += wordPoints;
      }
      
      wordResults.push({
        expected: word,
        filled: gridWord,
        isCorrect: isWordValid,
        points: wordPoints,
        length: gridWord.length,
        isComplete: true
      });
    }
      
    
    // Calculate completion statistics
    const completedWords = wordResults.filter(result => result.isComplete).length;
    const totalWords = wordsToValidate.length;
    playSound('submit', true, 0.5, 1000); 
    
    // Update session score
  const newSessionScore = parseFloat(sessionScoreRef.current) + parseFloat(earnedPoints);
  sessionScoreRef.current = newSessionScore;
  setSessionScore(newSessionScore);
  
  console.log(`Current session score: ${newSessionScore}`);
  
  // Compare with highest score
  if (newSessionScore > parseFloat(highestScoreRef.current)) {
    console.log(`New highest score: ${newSessionScore} (old: ${highestScoreRef.current})`);
    highestScoreRef.current = newSessionScore;
    setHighestScore(newSessionScore);
    
    // Save to database
    try {
      updateUser(user?.telegram_id, { highest_score: newSessionScore });
      console.log("Updated highest score in database:", newSessionScore);
    } catch (error) {
      console.error("Failed to update highest score:", error);
    }
  }
  
  // Update TMS points (existing code)
  const TotalPoints = parseFloat(tmsPoints) + parseFloat(earnedPoints);
  const newTotalPoints = TotalPoints.toFixed(2);
  
  try {
    await updateUser(user?.telegram_id, { tms_points: newTotalPoints });
    console.log("Database updated successfully with new tms_points:", newTotalPoints);
  } catch (error) {
    console.error("Error updating database:", error);
  }
  
  setValidatingWords(false);
  
  if (correct === totalWords && completedWords === totalWords) {
    // All words correct - complete level!
    setToastType("success");
    setToastMessage(`Perfect! Level ${levelRef.current} complete!`);
    setToastMessage2(`+${earnedPoints} TMS points (${newTotalPoints} total)`);
    setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
    playSound('success', true, 0.5, 1000); 
    // Play victory music when completing a level
    playSound('victory', true, 0.8, 1000); 
  } else {
    setToastType("gameOver");
    setToastMessage(`Time's up! You got ${correct}/${totalWords} completed words correct`);
    setToastMessage2(`+${earnedPoints} TMS points (${newTotalPoints} total)`);
    setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
    playSound('fail', true, 0.5, 1000); 
    // Reset session score on game over
    console.log("Game over (time up), resetting session score for next game");
    // Reset will happen on restart
  }
  
  setToastVisible(true);
  };
  
  
  // Handle selecting a letter from the rack
  const selectLetter = (index) => {
    if (!gameStarted || !letters[index]) return
  
    setSelectedLetterIndex(index)
    if (selectedGridIndex !== null) {
      placeLetter(index, selectedGridIndex)
      setSelectedLetterIndex(null)
      setSelectedGridIndex(null)
    }

    playSound('select'); 
  }
  
  // Handle selecting a grid position
  // Handle selecting a grid position
  const selectGridPosition = (index) => {
    if (!gameStarted) return
  
    // If the position contains a letter and no letter is currently selected from grid
    if (grid[index] !== "" && selectedGridIndex === null) {
      setSelectedGridIndex(index)
      return
    }
  
    // If we already have a letter selected from the grid
    if (selectedGridIndex !== null && grid[selectedGridIndex] !== "") {
      // Swap positions within the grid
      const newGrid = [...grid]
      const temp = newGrid[selectedGridIndex]
  
      // If target position is empty
      if (grid[index] === "") {
        newGrid[index] = temp
        newGrid[selectedGridIndex] = ""
      }
      // If target position has a letter, swap them
      else {
        newGrid[selectedGridIndex] = newGrid[index]
        newGrid[index] = temp
      }
  
      setGrid(newGrid)
      setSelectedGridIndex(null)
      return
    }
  
    // Handle normal case (empty grid position)
    if (grid[index] === "") {
      setSelectedGridIndex(index)
      if (selectedLetterIndex !== null) {
        placeLetter(selectedLetterIndex, index)
        setSelectedLetterIndex(null)
        setSelectedGridIndex(null)
      }
    }

    playSound('place'); 
  }
  
  // Place a letter on the grid
  const placeLetter = (letterIndex, gridIndex) => {
    // Place letter in grid
    const newGrid = [...grid]
    newGrid[gridIndex] = letters[letterIndex]
    setGrid(newGrid)
  
    // Remove letter from rack
    const newLetters = [...letters]
    newLetters[letterIndex] = ""
    setLetters(newLetters)
    playSound('place'); 
  
    // No refill needed as we're showing all letters at once
  }
  
  // Check answers with word validation
  // Updated checkAnswers function with API validation
  // Updated checkAnswers function to validate only fully formed words with API
  // Updated checkAnswers function to validate only completely filled rows
  // Enhanced checkAnswers function that properly handles incomplete words
  const checkAnswers = async () => {
    // Set submission flag first
    setIsSubmitting(true);
    
    // Immediately stop the timer to prevent handleTimeUp from triggering
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    console.log("Starting checkAnswers function");
    console.log("Current grid:", grid);
    console.log("Current level words:", currentLevelWords);
    
    setValidatingWords(true);
    let correct = 0;
    let earnedPoints = 0;
    const wordResults = [];
    
    // Process each word position in the grid
    for (let i = 0; i < currentLevelWords.length; i++) {
      const wordObj = currentLevelWords[i];
      console.log(`Checking word ${i+1}/${currentLevelWords.length}:`, wordObj);
    
      const word = wordObj.word;
      const positions = wordObj.positions;
    
      // Check if positions are valid
      if (!positions || !Array.isArray(positions)) {
        console.error(`Invalid positions for word ${word}:`, positions);
        continue;
      }
    
      // Extract the filled letters from the grid using the positions
      const filledLetters = positions.map(pos => grid[pos]);
    
      // Check if this word is completely filled (no empty cells)
      const isComplete = !filledLetters.includes("");
    
      // Create the grid word by joining the letters
      const gridWord = filledLetters.join("");
      console.log(`Word ${word}: Expected "${word}", Filled "${gridWord}", Complete: ${isComplete}`);
    
      // Skip validation for incomplete words
      if (!isComplete) {
        console.log(`Word in positions ${positions} is incomplete (${gridWord}), skipping validation`);
        wordResults.push({
          expected: word,
          filled: gridWord,
          isCorrect: false,
          points: 0,
          length: word.length,
          isComplete: false
        });
        continue;
      }
    
      // Only validate complete words with the API
      let isWordValid = false;
      try {
        // Convert to lowercase for API validation
        isWordValid = await validateWordWithAPI(gridWord.toLowerCase());
        console.log(`API validation for "${gridWord}": ${isWordValid ? "Valid" : "Invalid"}`);
      } catch (error) {
        console.error(`API validation failed for "${gridWord}":`, error);
        // Fallback validation - exact match with expected word
        isWordValid = gridWord === word;
        console.log(`Fallback validation: "${gridWord}" equals "${word}"? ${isWordValid}`);
      }
    
      // Calculate points if the word is valid
      let wordPoints = 0;
      if (isWordValid) {
        correct++;
    
        // Calculate points based on word length
        switch (gridWord.length) {
          case 3: wordPoints = 100; break;
          case 4: wordPoints = 150; break;
          case 5: wordPoints = 200; break;
          case 6: wordPoints = 250; break;
          case 7: wordPoints = 300; break;
          default: wordPoints = gridWord.length * 100;
        }
    
        earnedPoints += wordPoints;
        console.log(`Word "${gridWord}" earned ${wordPoints} points`);
      }
    
      wordResults.push({
        expected: word,
        filled: gridWord,
        isCorrect: isWordValid,
        points: wordPoints,
        length: gridWord.length,
        isComplete: true
      });
    }
    
    // Calculate statistics for reporting
    const completedWords = wordResults.filter(result => result.isComplete).length;
    const totalWords = currentLevelWords.length;
    const completionPercentage = Math.round((completedWords / totalWords) * 100);
    const correctPercentage = completedWords > 0 ? Math.round((correct / completedWords) * 100) : 0;
    
    console.log("Final results:", {
      correct,
      completed: completedWords,
      total: totalWords,
      completionRate: `${completionPercentage}%`,
      correctRate: `${correctPercentage}%`,
      earnedPoints,
      wordResults
    });
    
    const newSessionScore = parseFloat(sessionScoreRef.current) + parseFloat(earnedPoints);
    sessionScoreRef.current = newSessionScore;
    setSessionScore(newSessionScore);
    
    console.log(`Current session score: ${newSessionScore}`);
    
    // Compare session score with highest score
    if (newSessionScore > parseFloat(highestScoreRef.current)) {
      console.log(`New highest score: ${newSessionScore} (old: ${highestScoreRef.current})`);
      highestScoreRef.current = newSessionScore;
      setHighestScore(newSessionScore);
      
      // Save the new highest score to database
      try {
        updateUser(user?.telegram_id, { highest_score: newSessionScore });
        console.log("Updated highest score in database:", newSessionScore);
      } catch (error) {
        console.error("Failed to update highest score:", error);
      }
    }
    
    // Update total TMS points (existing logic)
    const TotalPoints = parseFloat(tmsPoints) + parseFloat(earnedPoints);
    const newTotalPoints = TotalPoints.toFixed(2);
    
    console.log(`Updating TMS points: ${tmsPoints} + ${earnedPoints} = ${newTotalPoints}`);
    
    // Update TMS points in the database (existing code)
    try {
      await updateUser(user?.telegram_id, { tms_points: newTotalPoints });
      console.log("Database updated successfully with new tms_points:", newTotalPoints);
    } catch (error) {
      console.error("Failed to update user points:", error);
    }
    
    // Flag to determine if we should proceed to next level
    const allWordsCorrect = correct === totalWords && completedWords === totalWords;

    playSound('submit',true, 0.5, 1000); 
    
    // Show appropriate toast based on performance
    if (completedWords === 0) {
      // No words completed
      setToastType("gameOver");
      setToastMessage("No words were completed!");
      setToastMessage2("Try to complete at least one word");
      setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
    } else if (allWordsCorrect) {
      // All words completed and correct - perfect score!
      setToastType("success");
      setToastMessage(`Perfect! Level ${level} complete!`);
      setToastMessage2(`+${earnedPoints} TMS points (${newTotalPoints} total)`);
      setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
      
      // Schedule the next level after showing success message
      setAutoLevelAdvanceScheduled(true);
      playSound('success', true, 0.5, 1000); 
       // Play victory music when completing a level
       playSound('victory', true, 0.8, 1000); 
  
 
    } else {
      // Some correct, some incorrect
      setToastType("gameOver");
      setToastMessage(`Score: ${correct}/3 completed words correct`);
      setToastMessage2(`+${earnedPoints} TMS points (${newTotalPoints} total)`);
      setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
      playSound('fail',true, 0.5, 1000); 
    }
    
    // If game ends, reset session score for next game
    if (!allWordsCorrect) {
      // Reset session score on game over (but not when advancing to next level)
      console.log("Game over, resetting session score for next game");
    }
    
    setToastVisible(true);
    setValidatingWords(false);
    setIsSubmitting(false);
  };
  
  
  
  
  const useHint = async () => {
    if (!gameStarted || hintsUsed === null) return
  
    // Check if 24 hours have passed since last hint
    const now = new Date().getTime()
    if (hintsUsed >= 3) {
      // If last_hint is set and 24 hours have passed, reset the counter
      if (
        lastHintTime &&
        now - new Date(lastHintTime).getTime() > 24 * 60 * 60 * 1000 // 24 hours
      ) {
        // Reset hint count to 0 in both state and DB
        await updateUser(user?.telegram_id, { hint_count: 0 })
        setHintsUsed(0)
        setLastHintTime(null)
        setHintCountdown("") // Clear the countdown
      }
      // If we still don't have free hints after potential reset
      if (hintsUsed >= 3 && purchasedHints <= 0) {
        // User has used all free hints and has no purchased hints
        setToastType("buyHint")
        setToastMessage("All free hints used")
        setToastMessage2(`Buy a hint for 5 gems? Free hints reset in ${hintCountdown}`)
        setToastVisible(true)
        return
      }
    }
  
    // Get current state of grid
    const newGrid = [...grid]
    let hintPlaced = false
  
    // Loop through each word in currentLevelWords
    for (let wordIndex = 0; wordIndex < currentLevelWords.length; wordIndex++) {
      const wordObj = currentLevelWords[wordIndex]
      const word = wordObj.word
      const positions = wordObj.positions
  
      // Check each letter position for this word
      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        const position = positions[letterIndex]
  
        // If this position is empty, place the correct letter there
        if (newGrid[position] === "") {
          const letter = word[letterIndex]
          newGrid[position] = letter
  
          // Remove this letter from rack if it's there
          const rackIndex = letters.findIndex((l) => l === letter)
          if (rackIndex >= 0) {
            const newLetters = [...letters]
            newLetters[rackIndex] = ""
            setLetters(newLetters)
          }
  
          // Always update the counts in state and DB
          if (hintsUsed < 3) {
            const newHintCount = hintsUsed + 1
  
            setHintsUsed(newHintCount)
  
            // Always update the DB, setting last_hint timestamp if it's the 3rd hint
            const updateData = { hint_count: newHintCount }
            if (newHintCount >= 3) {
              const now = new Date()
              setLastHintTime(now)
              updateData.last_hint = now.toISOString().replace("T", " ").split(".")[0]
            }
  
            // Always update the database immediately
            await updateUser(user?.telegram_id, updateData)
          } else {
            setPurchasedHints(purchasedHints - 1)
          }
  
          setGrid(newGrid)
          hintPlaced = true
          break // Exit the letter loop after placing one hint
        }
      }
  
      if (hintPlaced) break // Exit the word loop after placing one hint
    }
  
    // If no hint could be placed (all positions filled), show a message
    if (!hintPlaced) {
      setToastType("info")
      setToastMessage("No more hints needed!")
      setToastMessage2("All positions are filled.")
      setToastVisible(true)
    }
  }
  
  const purchaseHint = async () => {
    if (gems < 5) {
      setToastType("noGems")
      setToastMessage("Not enough gems!")
      setToastMessage2("Watch an ad to earn more gems")
      setToastVisible(true)
      return
    }
  
    // Deduct 5 gems
    await updateUser(user?.telegram_id, { gems: user?.gems - 5 })
  
    // Add one purchased hint
    setPurchasedHints((prev) => prev + 1)
  
    // Close the toast
    setToastVisible(false)
  
    // Don't call useHint() immediately - let the user decide when to use it
  }
  
  // Update the shuffleGrid function
  const shuffleGrid = async () => {
    if (!gameStarted || shufflesUsed === null) return
  
    // Check if 24 hours have passed since last shuffle
    const now = new Date().getTime()
    if (shufflesUsed >= 3) {
      // If last_shuffle is set and 24 hours have passed, reset the counter
      if (lastShuffleTime && now - new Date(lastShuffleTime).getTime() > 24 * 60 * 60 * 1000) {
        // Reset shuffle count to 0 in both state and DB
        await updateUser(user?.telegram_id, { shuffle_count: 0 })
        setShufflesUsed(0)
        setLastShuffleTime(null)
        setShuffleCountdown("") // Clear the countdown
      }
      // If we still don't have free shuffles after potential reset
      if (shufflesUsed >= 3 && purchasedShuffles <= 0) {
        setToastType("buyShuffle")
        setToastMessage("All free shuffles used")
        setToastMessage2(`Buy a shuffle for 3 gems? Free shuffles reset in ${shuffleCountdown}`)
        setToastVisible(true)
        return
      }
    }
  
    // Get only non-empty letters from the rack
    const nonEmptyLetters = letters.filter((letter) => letter !== "")
    if (nonEmptyLetters.length <= 1) return
  
    // Shuffle the letters
    const shuffledLetters = [...nonEmptyLetters].sort(() => 0.5 - Math.random())
  
    // Create new letters array with shuffled values
    const newLetters = [...letters]
    let shuffledIndex = 0
  
    for (let i = 0; i < newLetters.length; i++) {
      if (newLetters[i] !== "") {
        newLetters[i] = shuffledLetters[shuffledIndex]
        shuffledIndex++
      }
    }
  
    setLetters(newLetters)
    playSound('shuffle', true, 0.5, 1000); 
  
    // Always update the counts in state and DB
    if (shufflesUsed < 3) {
      const newShuffleCount = shufflesUsed + 1
      setShufflesUsed(newShuffleCount)
  
      // Always update the DB, setting last_shuffle timestamp if it's the 3rd shuffle
      const updateData = { shuffle_count: newShuffleCount }
      if (newShuffleCount >= 3) {
        const now = new Date()
        setLastShuffleTime(now)
        updateData.last_shuffle = now.toISOString().replace("T", " ").split(".")[0]
      }
  
      // Always update the database immediately
      await updateUser(user?.telegram_id, updateData)
    } else {
      setPurchasedShuffles(purchasedShuffles - 1)
    }
  }
  
  const purchaseShuffle = async () => {
    if (gems < 3) {
      setToastType("noGems")
      setToastMessage("Not enough gems!")
      setToastMessage2("Watch an ad to earn more gems")
      setToastVisible(true)
      return
    }
  
    // Deduct 3 gems
    await updateUser(user?.telegram_id, { gems: user?.gems - 3 })
  
    // Add one purchased shuffle
    setPurchasedShuffles((prev) => prev + 1)
  
    // Close the toast
    setToastVisible(false)
  
    // Don't call shuffleGrid() immediately
  }
  
  const nextLevel = () => {
   
    // Also clear the auto advancement flag if using that approach
    setAutoLevelAdvanceScheduled(false);
    
    // Increment level
    levelRef.current += 1;
    setLevel((prevLevel) => prevLevel + 1);
    
    // Update highest level if needed
    if (levelRef.current > highestLevelRef.current) {
      highestLevelRef.current = levelRef.current;
      setHighestLevel(levelRef.current);
      
      // Save the new highest level to database
      try {
        updateUser(user?.telegram_id, { highest_level: levelRef.current });
        console.log("Updated highest level in database:", levelRef.current);
      } catch (error) {
        console.error("Failed to update highest level:", error);
      }
    }

      
    
    setToastVisible(false);
    
    // Rest of function remains the same...
    setGrid(Array(totalCells).fill(""));
    setLetters([]);
    setSelectedLetterIndex(null);
    setSelectedGridIndex(null);
    
    setValidatingWords(false);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    //setTimer(0);
    
    setTimeout(() => {
      loadWords();
      // Add an additional delay to make sure setupGame is complete
      setTimeout(() => {
        // Force timer to start if it hasn't already
        if (!timerInterval) {
          startTimer();
        }
      }, 500);
    }, 100);
  };
  
  // Handle restart game after game over
  // Handle restart game after game over
 const restartGame = async () => {

  sessionScoreRef.current = 0;
  setSessionScore(0);
  console.log("Restarting game, session score reset");
  console.log("Restarting game - resetting all state");
  
  // Try to use a trial
  const success = await useOneTrial();
  if (!success) {
    return; // Don't restart game if no trials available
  }
  
  // Reset game state
  levelRef.current = 1;
  setLevel(1);
  setToastVisible(false);
  
  // Reset to default grid size
  const defaultLayout = [4, 4, 3];
  const defaultTotalCells = defaultLayout.reduce((sum, size) => sum + size, 0);
  
  setGridSizes(defaultLayout);
  setTotalCells(defaultTotalCells);
  
  // Clear the grid and letters completely
  setGrid(Array(defaultTotalCells).fill(""));
  setLetters([]);
  
  // Reset the words list
  setCurrentLevelWords([]);
  
  // Reset selection states
  setSelectedLetterIndex(null);
  setSelectedGridIndex(null);
  
  // Clear validation state
  setValidatingWords(false);
  
  // Clear any existing timer interval
  if (timerInterval) {
    clearInterval(timerInterval);
    setTimerInterval(null);
  }
  
  // Reset the timer value
  setTimer(0);
  
  // Reset isSubmitting flag
  setIsSubmitting(false);
  
  // Force a complete reset by temporarily setting gameStarted to false
  setGameStarted(false);
  
  // Use setTimeout to ensure state updates have propagated
  setTimeout(() => {
    setGameStarted(true);
    loadWords();
  }, 200);
};




// Use a trial when starting a game
const useOneTrial = async () => {
  console.log(availableTrials);
  if (availableTrials <= 0) {
    // Show purchase prompt
    setToastType("buyTrial");
    setToastMessage("No trials remaining");
    setToastMessage2(`Purchase a trial for 10 gems?${trialCountdown ? ` Free trials reset in ${trialCountdown}` : ''}`);
    setToastVisible(true);
    return false; // Return false to indicate failure
  }
  
  // First use purchased trials, then free trials
  if (purchasedTrials > 0) {
    const newPurchasedTrials = purchasedTrials - 1;
    setPurchasedTrials(newPurchasedTrials);
    setAvailableTrials(newPurchasedTrials + freeTrials);
    
    // Update both fields in the database
    await updateUser(user?.telegram_id, { 
      purchased_trials: newPurchasedTrials,
      free_trials: freeTrials
    });
  } else {
    // Use a free trial
    const newFreeTrials = freeTrials - 1;
    
    setFreeTrials(newFreeTrials);
    setAvailableTrials(newFreeTrials + purchasedTrials);
    console.log(newFreeTrials, purchasedTrials, availableTrials);
    
    // If this was the last free trial, set the timer
    if (newFreeTrials === 0) {
      // Store timestamp in milliseconds format consistent with FarmPage
      const currentTime = Date.now();
      setLastTrialTime(currentTime);
      
      await updateUser(user?.telegram_id, { 
        free_trials: newFreeTrials,
        purchased_trials: purchasedTrials,
        last_jumbo: currentTime
      });
    } else {
      await updateUser(user?.telegram_id, { 
        free_trials: newFreeTrials,
        purchased_trials: purchasedTrials
      });
    }
  }
  
  return true; // Return true to indicate success
};


const purchaseTrial = async () => {
  if (!user) return;
  
  if (user.gems < 10) {
    // Instead of just showing toast, offer to watch an ad
    watchAdForGems();
    return;
  }
  
  // Deduct gems
  const newGems = user.gems - 10;
  
  
  // Add to purchased trials, not free trials
  const newPurchasedTrials = purchasedTrials + 1;
  setPurchasedTrials(newPurchasedTrials);
  setAvailableTrials(freeTrials + newPurchasedTrials);
  
  // Update in database
  await updateUser(user.telegram_id, { 
    gems: newGems,
    purchased_trials: newPurchasedTrials,
    free_trials: freeTrials 
  });
};

const purchaseTrialViaModal = async () => {
  // Reset everything to initial state
  levelRef.current = 1;
  setLevel(1);
  
  // Reset to default grid size
  const defaultLayout = [4, 4, 3];
  const defaultTotalCells = defaultLayout.reduce((sum, size) => sum + size, 0);
  
  setGridSizes(defaultLayout);
  setTotalCells(defaultTotalCells);
  
  // Clear the grid and letters completely
  setGrid(Array(defaultTotalCells).fill(""));
  setLetters([]);
  
  // Reset the words list
  setCurrentLevelWords([]);
  
  // Reset selection states
  setSelectedLetterIndex(null);
  setSelectedGridIndex(null);
  
  // Clear validation state
  setValidatingWords(false);
  
  // Clear any existing timer interval
  if (timerInterval) {
    clearInterval(timerInterval);
    setTimerInterval(null);
  }
  
  // Reset the timer value
  setTimer(0);
  
  // Reset isSubmitting flag
  setIsSubmitting(false);
  
  // Set game as not started
  setGameStarted(false);

  if (gems < 10) {
    setToastType("noGems");
    setToastMessage("Not enough gems!");
    setToastMessage2("Watch an ad to earn more gems");
    setToastVisible(true);
    return;
  }

  // Deduct gems
  const newGems = user.gems - 10;
 
  
  // Add to purchased trials, not free trials
  const newPurchasedTrials = purchasedTrials + 1;
  setPurchasedTrials(newPurchasedTrials);
  setAvailableTrials(freeTrials + newPurchasedTrials);
  
  // Update in database
  await updateUser(user.telegram_id, { 
    gems: newGems,
    purchased_trials: newPurchasedTrials,
    free_trials: freeTrials 
  });
  
  // Close the toast
  setToastVisible(false);
};

  // Handle time extension (watch ad)
  const extendTime = () => {
    // Simulate ad watching
    setToastVisible(false)
  
    // Show ad loading message
    setToastType("adLoading")
    setToastMessage("Loading advertisement...")
    setToastMessage2("Please wait")
    setToastVisible(true)
  
    // After ad is complete (simulated)
    setTimeout(() => {
      setToastVisible(false)
  
      // Add 10 seconds to timer
      setTimer(timer + 10)
  
      // Resume the game
      startTimer()
    }, 1500)
  }
  
  // Handle watch ad for gems
  {/*  const watchAdForGems = () => {
    // Simulate ad watching
    setToastVisible(false)
  
    // Show ad loading message
    setToastType("adLoading")
    setToastMessage("Loading advertisement...")
    setToastMessage2("Please wait")
    setToastVisible(true)
  
    // After ad is complete (simulated)
    setTimeout(async () => {
      setToastVisible(false)
  
      // Add gems
      await updateUser(user?.telegram_id, { gems: user?.gems + 15 })
      // Show success message
      setToastType("gemsEarned")
      setToastMessage("You earned 15 gems!")
      setToastMessage2("")
      setToastVisible(true)
  
      // Auto-close success message
      setTimeout(() => {
        setToastVisible(false)
      }, 1500)
    }, 1500)
  }*/}

  const watchAdForGems = () => {
    // Hide any existing toast
    setToastVisible(false)
    
    // Show ad loading message
    setToastType("adLoading")
    setToastMessage("Loading advertisement...")
    setToastMessage2("Please wait")
    setToastVisible(true)
    
    // Initialize and show Adsgram ad
    window.Adsgram?.init({ blockId: "int-9606" })?.show()
      .then((result) => {
        // Hide the loading toast
        setToastVisible(false)
        
        if (result.done) {
          // Ad was watched successfully
          // Add gems to user account
          updateUser(user?.telegram_id, { gems: user?.gems + 7 })
            .then(() => {
              // Show success message
              setToastType("gemsEarned")
              setToastMessage("You earned 7 gems!")
              setToastMessage2("")
              setToastVisible(true)
              
              // Auto-close success message
              setTimeout(() => {
                setToastVisible(false)
              }, 1500)
            })
            .catch(error => {
              console.error("Error updating user gems:", error)
              setToastType("error")
              setToastMessage("Failed to add gems")
              setToastMessage2("Please try again")
              setToastVisible(true)
            })
        } else {
          // Ad wasn't completed
          setToastType("error")
          setToastMessage("Ad not completed")
          setToastMessage2("No gems awarded")
          setToastVisible(true)
        }
      })
      .catch(() => {
        setToastVisible(false)
        setToastType("error")
        setToastMessage("Error playing ad")
        setToastMessage2("Please try again later")
        setToastVisible(true)
        
        // Auto-close error message
        setTimeout(() => {
          setToastVisible(false)
        }, 3000)
      })
  }
 
  
  const getHintDescription = () => {
    if (hintsUsed === null) return "Loading..."
  
    if (hintsUsed < 3) {
      return `Hint: ${hintsUsed}/3 Free`
    } else if (purchasedHints > 0) {
      return `${purchasedHints} Paid Hints`
    } else {
      return "Hints Used"
    }
  }
  
  const getShuffleDescription = () => {
    if (shufflesUsed === null) return "Loading..."
  
    if (shufflesUsed < 3) {
      return `Shuffle: ${shufflesUsed}/3 Free`
    } else if (purchasedShuffles > 0) {
      return `${purchasedShuffles} Paid Shuffles`
    } else {
      return "Shuffles Used"
    }
  }
// Close toast
// Close toast
const closeToast = () => {
  console.log("Closing toast of type:", toastType);

  // Check the toast type and perform the corresponding action
  if (toastType === "success") {
      // Only advance level if no automatic advancement is scheduled
      if (!autoLevelAdvanceScheduled) {
          nextLevel();
      } else {
          // Just close the toast if automatic advancement is coming
          setToastVisible(false);
      }
  } else if (toastType === "gameOver" || toastType === "timeUp") {
      // User clicked X on "Play Again" toast - restart the game
      restartGame();
  }  else if (toastType === "buyTrial") {
    setToastVisible(false);
    
    // Reset everything to initial state
    levelRef.current = 1;
    setLevel(1);
    
    // Reset to default grid size
    const defaultLayout = [4, 4, 3];
    const defaultTotalCells = defaultLayout.reduce((sum, size) => sum + size, 0);
    
    setGridSizes(defaultLayout);
    setTotalCells(defaultTotalCells);
    
    // Clear the grid and letters completely
    setGrid(Array(defaultTotalCells).fill(""));
    setLetters([]);
    
    // Reset the words list
    setCurrentLevelWords([]);
    
    // Reset selection states
    setSelectedLetterIndex(null);
    setSelectedGridIndex(null);
    
    // Clear validation state
    setValidatingWords(false);
    
    // Clear any existing timer interval
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Reset the timer value
    setTimer(0);
    
    // Reset isSubmitting flag
    setIsSubmitting(false);
    
    // Set game as not started
    setGameStarted(false);
  }else {
      // For other toast types, just close the toast
      setToastVisible(false);

      // Resume game if it was paused due to an ad
      if (gameStarted && timer > 0 && !timerInterval) {
          startTimer();
      }
  }
};


  
const cycleThroughMusic = () => {
  const tracks = getAvailableMainThemes(); // For cycling through main themes only
  const currentIndex = tracks.indexOf(currentMusicTrack);
  const nextIndex = (currentIndex + 1) % tracks.length;
  fadeToTrack(tracks[nextIndex], 1000);
};

  // Modified nextLevel function to ensure clean state transitions
  
  const debugGameState = () => {
    console.log("--------------- GAME STATE DEBUG ---------------")
    console.log("Level:", level)
    console.log("Grid:", grid)
    console.log("Letters:", letters)
    console.log("Current words:", currentLevelWords)
    console.log("Timer:", timer)
    console.log("Hints used:", hintsUsed)
    console.log("Shuffles used:", shufflesUsed)
    console.log("------------------- END ----------------------")
  }
  

  // Format timer
  const formatTime = (seconds) => {
    return `${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleToggleMute = () => {
    toggleMute();
    // The sound test is now handled in the toggleMute function
  }
  
  return (
   <ResponsivePadding>
    <div className="flex justify-center items-start h-screen overflow-hidden py-2 game-container">
    {/* Background image */}
    <img
      className="fixed w-full h-full object-cover top-0 left-0 -z-10"
      src="/assets/secondbackground.webp"
      alt="Background"
    />

    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden font-['Poppins',sans-serif] flex flex-col max-h-[98vh]">
      {/* Game Header */}
   {/* Game Header with Sound Toggle */}
<div className="relative bg-[#18325B] p-3 rounded-t-xl shadow-md">
  <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
    {/* Game Stats - Responsive Grid */}
    <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-x-2 w-full sm:w-auto">
      {/* Sound Toggle Button */}
   
      
      {/* Trials - With line break and centered text */}
      <div className="bg-white p-1 px-2 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
        <span className="font-bold text-gray-800 text-xs sm:text-sm">
          {freeTrials === null || purchasedTrials === null
            ? "Loading..." 
            : availableTrials > 0 
              ? `Trials: ${availableTrials}` 
              : trialCountdown 
                ? `Free Trials in:` 
                : "No trials"}
        </span>
        { trialCountdown && (
          <span className="font-bold text-red-500 text-xs sm:text-sm">{trialCountdown}</span>
        )}
      </div>
      
      {/* TMS Points */}
      <div className="bg-white p-1 px-2 rounded-lg shadow-md flex items-center justify-center">
        <span className="font-bold text-gray-800 text-xs sm:text-sm">{tmsPoints}</span>
        <span className="text-blue-500 text-xs sm:text-sm ml-1">TMS</span>
      </div>
      
      {/* Gems */}
      <div className="bg-white p-1 px-2 rounded-lg shadow-md flex items-center justify-center">
        <span className="text-purple-500 text-xs sm:text-sm">💎</span>
        <span className="font-bold text-gray-800 text-xs sm:text-sm ml-1">{gems}</span>
      </div>
      
      {/* Level/Trophy */}
      <div className="bg-white p-1 px-2 rounded-lg shadow-md flex items-center justify-center">
        <span className="text-yellow-500 text-xs sm:text-sm">🏆</span>
        <span className="font-bold text-gray-800 text-xs sm:text-sm ml-1">{levelRef.current}</span>
      </div>

{/* 
      <div 
  className="bg-white p-1 px-2 rounded-lg shadow-md flex items-center justify-center cursor-pointer"
  onClick={handleToggleMute}
  onDoubleClick={() => {
    if (!isMuted) {
      // Force initialize the sound system
      playSound('select');
       startPlaylist();
    }
  }}
  onContextMenu={(e) => {
    e.preventDefault();
    if (!isMuted) {
      cycleThroughMusic();
    }
  }}
>
  {isMuted ? (
    <span className="text-gray-800 text-xs sm:text-sm">🔇</span>
  ) : (
    <span className="text-gray-800 text-xs sm:text-sm">🔊</span>
  )}
</div>
*/}
    </div>
  </div>
</div>


      {/* Game Status Bar */}
      <div className="p-2 bg-[#FAA31E] shadow-lg">
        <div className="flex justify-center items-center">
          <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full shadow-md">
            <span className="mr-1">⏱️</span>
            <span className="font-bold">{formatTime(timer)}</span>
          </div>
        </div>
      </div>



{/* Game Grid - Show loading state if fetching words */}
<div className="p-4 bg-white">
{isLoading || validatingWords ? (
<div className="flex flex-col items-center justify-center h-36">
  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
  <p className="text-gray-600 text-sm">{validatingWords ? "Validating words..." : "Loading words..."}</p>
</div>
) : (
<>
  {/* Dynamic Grid Rendering */}
  {gridSizes.map((rowSize, rowIndex) => {
    // Calculate starting index for this row
    const startIdx = rowIndex === 0 ? 0 : 
                     gridSizes.slice(0, rowIndex).reduce((sum, size) => sum + size, 0);
    
    // Calculate ending index (exclusive)
    const endIdx = startIdx + rowSize;
    
    // Get just the cells for this row
    const rowCells = grid.slice(startIdx, endIdx);
    
    return (
      <div 
        key={`row-${rowIndex}`} 
        className={`grid gap-2 mb-2 mt-${rowIndex > 0 ? 3 : 0}`}
        style={{
          gridTemplateColumns: `repeat(${rowSize}, minmax(0, 1fr))`,
          marginLeft: rowIndex === 2 ? "20px" : "0px", // Shift the third row as in original design
          marginTop: rowIndex > 0 ? "7px" : "0px"
        }}
      >
        {rowCells.map((letter, cellIndex) => {
          const gridIndex = startIdx + cellIndex;
          return (
            <div
              key={gridIndex}
              onClick={() => selectGridPosition(gridIndex)}
              className={`w-full h-16 flex items-center justify-center rounded-lg text-xl font-bold transition-all duration-300 shadow-md ${
                selectedGridIndex === gridIndex
                  ? "bg-yellow-200 border-2 border-yellow-400 animate-pulse"
                  : letter
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    : "bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {letter || ""}
            </div>
          );
        })}
      </div>
    );
  })}
</>
)}
</div>

      {/* Letter Rack */}
      {/* Letter Rack */}
      <div className="p-3 bg-gray-100">
        <div className="bg-[#18325B] p-3 rounded-xl shadow-inner mx-auto">
          <div className="flex justify-center flex-wrap gap-2">
            {letters.map((letter, index) => (
              <div
                key={index}
                onClick={() => letter && selectLetter(index)}
                className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                  !letter
                    ? "hidden"
                    : // Hide empty slots instead of showing them as transparent
                      selectedLetterIndex === index
                      ? "bg-yellow-400 text-gray-900 scale-110 shadow-lg"
                      : "bg-white text-gray-900 hover:bg-yellow-100 cursor-pointer shadow-md"
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="p-3 bg-white border-t border-gray-200">
{/* Button Row with responsive grid layout */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
{/* Hint Button */}
<div className="flex flex-col items-center">
  <button
    onClick={useHint}
    disabled={!gameStarted || isLoading || validatingWords}
    className={`flex items-center justify-center w-full h-10 rounded-lg text-sm ${
      gameStarted && !isLoading && !validatingWords
        ? "bg-[#FAA31E] shadow-lg text-white hover:from-green-500 hover:to-green-600 shadow-md"
        : "bg-[#FAA31E] shadow-lg text-white-400 cursor-not-allowed"
    }`}
  >
    <span className="mr-1">💡</span>
    <span className="font-bold">Hint</span>
  </button>
  <div className="text-xs mt-1 font-semibold text-blue-600">{getHintDescription()}</div>
  {hintCountdown && (
    <div className="text-xs mt-1 font-semibold text-red-500">Resets in: {hintCountdown}</div>
  )}
</div>

{/* Shuffle Button */}
<div className="flex flex-col items-center">
  <button
    onClick={shuffleGrid}
    disabled={!gameStarted || isLoading || validatingWords}
    className={`flex items-center justify-center w-full h-10 rounded-lg text-sm ${
      gameStarted && !isLoading && !validatingWords
        ? "bg-[#FAA31E] shadow-lg text-white hover:from-blue-500 hover:to-blue-600 shadow-md"
        : "bg-[#FAA31E] shadow-lg text-white-400 cursor-not-allowed"
    }`}
  >
    <span className="mr-1">🔄</span>
    <span className="font-bold">Shuffle</span>
  </button>
  <div className="text-xs mt-1 font-semibold text-blue-600">{getShuffleDescription()}</div>
  {shuffleCountdown && (
    <div className="text-xs mt-1 font-semibold text-red-500">Resets in: {shuffleCountdown}</div>
  )}
</div>

{/* Buy Trial Button */}
<div className="flex flex-col items-center">
  <button
    onClick={purchaseTrial}
    className={`flex items-center justify-center w-full h-10 rounded-lg text-sm
      bg-[#FAA31E] shadow-lg ${gameStarted ? "text-white" : "text-white-400"} font-bold`}
  >
    {user?.gems < 10 ? "WATCH AD" : "BUY TRIAL"}
  </button>
  <div className="text-xs mt-1 font-semibold text-blue-600">10 💎</div>
</div>

{/* Quit Button */}
<div className="flex flex-col items-center">
  <button
    onClick={() => {
      setToastType("quitConfirm")
      setToastMessage("Do you want to quit the game?")
      setToastMessage2("Your progress will be lost")
      setToastVisible(true)
    }}
    className={`flex items-center justify-center w-full h-10 rounded-lg text-sm bg-[#FAA31E] shadow-lg hover:from-red-500 hover:to-red-600 shadow-md ${gameStarted ? "text-white" : "text-white-400"}`}
  >
    <div className="flex items-center gap-x-1">
      <XCircle className="w-4 h-4" />
      <span className="font-bold">Quit</span>
    </div>
  </button>
</div>
</div>

{/* Play/Submit Button */}
<button
onClick={gameStarted ? checkAnswers : initializeGame}
disabled={isLoading || validatingWords || (availableTrials <= 0 && !gameStarted)}
className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
  isLoading || validatingWords || (availableTrials <= 0 && !gameStarted)
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : "bg-[#18325B] text-white hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600"
}`}
>
{isLoading
  ? "LOADING..."
  : validatingWords
    ? "VALIDATING..."
    : gameStarted
      ? "SUBMIT WORDS"
      : availableTrials <= 0
        ? "NO TRIALS LEFT"
        : "START GAME"}
</button>
</div>

      {/* Toast Modal */}
      {toastVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div
            className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-2xl w-11/12 max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button onClick={closeToast} className="text-white opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center mb-6">
              {toastType === "success" && <div className="text-6xl mb-4">🏆</div>}
              {toastType === "gameOver" && <div className="text-6xl mb-4"> <img src='/assets/wordfind.svg' className="h-16 w-16"/></div>}
              {toastType === "timeUp" && <div className="text-6xl mb-4">⏱️</div>}
              {toastType === "noGems" && <div className="text-6xl mb-4">💎</div>}
              {toastType === "adLoading" && <div className="text-6xl mb-4 animate-pulse">🎥</div>}
              {toastType === "gemsEarned" && <div className="text-6xl mb-4">💎</div>}
              {toastType === "buyHint" && <div className="text-6xl mb-4">💡</div>}
              {toastType === "buyShuffle" && <div className="text-6xl mb-4">🔄</div>}

              <h2 className="text-xl font-bold text-white text-center mb-2">{toastMessage}</h2>
              <p className="text-blue-200 text-center text-sm">{toastMessage2}</p>
              {toastMessage3 && (
          <p className="text-yellow-300 text-center text-sm mt-2 font-semibold">{toastMessage3}</p>
        )}


              {toastType === "quitConfirm" && <div className="text-6xl mb-4"> </div>}

              {toastType === "quitConfirm" && (
                <div className="flex items-center gap-x-4">
                  {" "}
                  {/* Flex container with spacing */}
                  <button
                    onClick={() => navigate("/Game")}
                    className="py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-bold shadow-lg hover:from-red-600 hover:to-red-700 transition-all text-sm"
                  >
                    Yes
                  </button>
                  <button
                    onClick={closeToast}
                    className="py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm"
                  >
                    No
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-3">
              {toastType === "timeUp" && (
                <>
                  <button
                    onClick={extendTime}
                    className="py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white font-bold shadow-lg hover:from-green-600 hover:to-green-700 transition-all text-sm"
                  >
                    +10 Sec (🎥)
                  </button>
                  <button
                    onClick={restartGame}
                    className="py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-bold shadow-lg hover:from-red-600 hover:to-red-700 transition-all text-sm"
                  >
                    Restart
                  </button>
                </>
              )}

              {toastType === "success" && (
                <button
                  onClick={nextLevel}
                  className="py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-bold shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all text-sm"
                >
                  Next Level
                </button>
              )}

              {toastType === "gameOver" && (
                <button
                  onClick={restartGame}
                  className="py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-bold shadow-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm"
                >
                  Play Again
                </button>
              )}

              {toastType === "noGems" && (
                <button
                  onClick={watchAdForGems}
                  className="py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white font-bold shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all text-sm"
                >
                  Watch Ad for Gems
                </button>
              )}

              {toastType === "buyHint" && (
                <button
                  onClick={purchaseHint}
                  className="py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white font-bold shadow-lg hover:from-green-600 hover:to-green-700 transition-all text-sm"
                >
                  Purchase (5💎)
                </button>
              )}

              {toastType === "buyShuffle" && (
                <button
                  onClick={purchaseShuffle}
                  className="py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm"
                >
                  Purchase (3💎)
                </button>
              )}

              {(toastType === "adLoading" || toastType === "gemsEarned") && (
                <div className="h-10"></div> // Spacer for ad loading state
              )}

{toastType === "buyTrial" && (
<div className="flex justify-center space-x-3">
<button
 onClick={purchaseTrialViaModal}
  className="py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white font-bold shadow-lg hover:from-green-600 hover:to-green-700 transition-all text-sm"
>
  Purchase (10💎)
</button>
<button
  onClick={closeToast}
  className="py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-bold shadow-lg hover:from-red-600 hover:to-red-700 transition-all text-sm"
>
  Cancel
</button>
</div>
)}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Add this media query component to handle different screen heights */}
    <style jsx>{`
     @media (min-height: 900px) {
    .flex.justify-center.items-start {
      padding-top: 5rem;
    }
  }
  @media (min-height: 800px) {
    .flex.justify-center.items-start {
      padding-top: 3rem;
    }
  }

  @media (min-height: 700px) {
    .flex.justify-center.items-start {
      padding-top: 1.9rem;
    }
    .p-4.bg-white {
      padding: 0.75rem;
    }
    .p-3.bg-gray-100 {
      padding: 0.5rem;
    }
    .p-3.bg-white.border-t {
      padding: 0.5rem;
    }
  } /* <- FIXED: closed this block */

  @media (min-height: 701px) and (max-height: 750px) {
  .h-10 { height: 1.95rem; }
  .w-10 { width: 1.95rem; }
  .h-12 { height: 2.3rem; }
  .w-12 { width: 2.3rem; }
  .h-16 { height: 2.85rem; }
  .text-lg { font-size: 1rem; }
  .text-xl { font-size: 1.05rem; }
  .text-2xl { font-size: 1.4rem; }
  .rounded-lg { border-radius: 0.32rem; }
  .mb-2 { margin-bottom: 0.32rem; }
  .p-4 { padding: 0.65rem; }
  .p-3 { padding: 0.5rem; }
  .p-2 { padding: 0.4rem; }
  .gap-2 { gap: 0.32rem; }
  .py-3 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
}


  @media (min-height: 650px) and (max-height: 700px) {
    .h-10 { height: 1.9rem; }
    .w-10 { width: 1.9rem; }
    .h-12 { height: 2.2rem; }
    .w-12 { width: 2.2rem; }
    .h-16 { height: 2.75rem; }
    .text-lg { font-size: 0.95rem; }
    .text-xl { font-size: 1rem; }
    .text-2xl { font-size: 1.35rem; }
    .rounded-lg { border-radius: 0.3rem; }
    .mb-2 { margin-bottom: 0.3rem; }
    .p-4 { padding: 0.6rem; }
    .p-3 { padding: 0.45rem; }
    .p-2 { padding: 0.35rem; }
    .gap-2 { gap: 0.3rem; }
    .py-3 { padding-top: 0.45rem; padding-bottom: 0.45rem; }
  }

  @media (min-height: 600px) and (max-height: 650px) {
    .h-10 { height: 1.75rem; }
    .w-10 { width: 1.75rem; }
    .h-12 { height: 2rem; }
    .w-12 { width: 2rem; }
    .h-16 { height: 2.5rem; }
    .text-lg { font-size: 0.875rem; }
    .text-xl { font-size: 0.925rem; }
    .text-2xl { font-size: 1.25rem; }
    .rounded-lg { border-radius: 0.25rem; }
    .mb-2 { margin-bottom: 0.25rem; }
    .p-4 { padding: 0.5rem; }
    .p-3 { padding: 0.375rem; }
    .p-2 { padding: 0.25rem; }
    .gap-2 { gap: 0.25rem; }
    .py-3 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
  }

  @media (min-height: 550px) and (max-height: 600px) {
    .h-10 { height: 1.6rem; }
    .w-10 { width: 1.6rem; }
    .h-12 { height: 1.85rem; }
    .w-12 { width: 1.85rem; }
    .h-16 { height: 2.3rem; }
    .text-lg { font-size: 0.8rem; }
    .text-xl { font-size: 0.88rem; }
    .text-2xl { font-size: 1.1rem; }
    .rounded-lg { border-radius: 0.22rem; }
    .mb-2 { margin-bottom: 0.2rem; }
    .p-4 { padding: 0.4rem; }
    .p-3 { padding: 0.3rem; }
    .p-2 { padding: 0.2rem; }
    .gap-2 { gap: 0.2rem; }
    .py-3 { padding-top: 0.3rem; padding-bottom: 0.3rem; }
  }

  @media (min-height: 500px) and (max-height: 550px) {
    .h-10 { height: 1.45rem; }
    .w-10 { width: 1.45rem; }
    .h-12 { height: 1.75rem; }
    .w-12 { width: 1.75rem; }
    .h-16 { height: 2.1rem; }
    .text-lg { font-size: 0.76rem; }
    .text-xl { font-size: 0.83rem; }
    .text-2xl { font-size: 1rem; }
    .rounded-lg { border-radius: 0.2rem; }
    .mb-2 { margin-bottom: 0.18rem; }
    .p-4 { padding: 0.3rem; }
    .p-3 { padding: 0.25rem; }
    .p-2 { padding: 0.18rem; }
    .gap-2 { gap: 0.18rem; }
    .py-3 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  }
    @media (max-height: 499px) {
  .h-8 { height: 1.22rem; }
  .w-8 { width: 1.22rem; }
  .h-10 { height: 1.3rem; }
  .w-10 { width: 1.3rem; }
  .h-12 { height: 1.7rem; }
  .w-12 { width: 1.7rem; }
  .h-16 { height: 1.9rem; }
  .text-base { font-size: 0.73rem; }
  .text-lg { font-size: 0.81rem; }
  .text-xl { font-size: 0.85rem; }
  .gap-2 { gap: 0.125rem; }
  .gap-1 { gap: 0.0625rem; }
  .p-2 { padding: 0.15rem; }
  .py-2 { padding-top: 0.3rem; padding-bottom: 0.15rem; }
}
`}</style>

  </div>
  </ResponsivePadding>
  
 
  )
}

export default JumbleJestersGame