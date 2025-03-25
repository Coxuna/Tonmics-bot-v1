
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
    
    // Calculate base size for all rows
    let baseSize = minSize + Math.floor(progressFactor * sizeRange);
    
    // Initialize row lengths
    let row1Length = baseSize;
    let row2Length = baseSize;
    let row3Length = baseSize;
    
    // Add variation to the layout
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
    
    // Ensure we stay within bounds
    row1Length = Math.min(Math.max(row1Length, minSize), maxSize);
    row2Length = Math.min(Math.max(row2Length, minSize), maxSize);
    row3Length = Math.min(Math.max(row3Length, minSize), maxSize);
    
    // Total grid size
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
    
    // Process words
    const processedWords = wordData.map((data, index) => {
      const rowLength = [row1Length, row2Length, row3Length][index];
      return data
        .map(item => item.word.toUpperCase())
        .filter(word => word.length === rowLength); // Filter to exact length
    });
    
    // Check if we have enough words
    if (processedWords.some(words => words.length < 1)) {
      throw new Error("Not enough words found for at least one row");
    }
    
    // Calculate positions - THIS IS THE CRITICAL FIX
    // Make sure positions are calculated based on the exact row lengths
    const fixedPositions = [
      Array.from({ length: row1Length }, (_, i) => i),  // First row
      Array.from({ length: row2Length }, (_, i) => i + row1Length),  // Second row
      Array.from({ length: row3Length }, (_, i) => i + row1Length + row2Length)  // Third row
    ];
    
    // Create word objects with positions
    const wordsWithPositions = processedWords.map((words, index) => {
      const randomWord = words.sort(() => Math.random() - 0.5)[0];
      
      // CRITICAL FIX: Ensure word length matches row length
      if (randomWord.length !== [row1Length, row2Length, row3Length][index]) {
        console.error(`Word length mismatch: ${randomWord} (${randomWord.length}) for row ${index+1} (${[row1Length, row2Length, row3Length][index]})`);
      }
      
      return {
        word: randomWord,
        positions: fixedPositions[index]
      };
    });
    
    console.log("Words with positions:", wordsWithPositions);
    
    // VERIFICATION STEP: Ensure all positions are covered
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
    // Fallback with layout based on level
    let fallbackLayout;
    
    // Calculate fallback based on level, ensuring we respect the 3-3-3 to 7-7-7 range
    const minSize = 3;
    const maxSize = 7;
    const levelToReachMax = 10;
    
    // Calculate progression factor (capped at 1.0)
    const progressFactor = Math.min((level - 1) / (levelToReachMax - 1), 1);
    const baseSize = Math.min(minSize + Math.floor(progressFactor * (maxSize - minSize)), maxSize);
    
    fallbackLayout = [baseSize, baseSize, baseSize];
    
    // Add variation for interest
    if (level < levelToReachMax) {
      if (level % 3 === 1) {
        fallbackLayout[1] = Math.min(fallbackLayout[1] + 1, maxSize);
      } else if (level % 3 === 2) {
        fallbackLayout[0] = Math.min(fallbackLayout[0] + 1, maxSize);
        fallbackLayout[2] = Math.min(fallbackLayout[2] + 1, maxSize);
      }
    } else if (level > levelToReachMax) {
      // For very high levels, additional variation patterns
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
    
    // Calculate positions for fallback
    const fallbackPositions = [
      Array.from({ length: fallbackLayout[0] }, (_, i) => i),
      Array.from({ length: fallbackLayout[1] }, (_, i) => i + fallbackLayout[0]),
      Array.from({ length: fallbackLayout[2] }, (_, i) => i + fallbackLayout[0] + fallbackLayout[1])
    ];
    
    // Word collections for each possible length
    const wordCollections = {
      3: ["FUN", "TRY", "WIN", "TOP", "NEW", "BIG", "BOX", "CAT", "DOG", "EGG", "FOX", "GYM", "HAT", "ICE", "JAM"],
      4: ["GAME", "PLAY", "WORD", "STEP", "MOVE", "TIME", "JUMP", "FAST", "CUBE", "DASH", "EASY", "GOLD", "HERO"],
      5: ["LEVEL", "POWER", "SKILL", "BRAIN", "SMART", "QUICK", "HAPPY", "BLAST", "CHASE", "DREAM", "FRESH"],
      6: ["PUZZLE", "TALENT", "WISDOM", "MASTER", "ACTION", "BOUNCE", "CLEVER", "DELIGHT", "ENERGY", "FUTURE"],
      7: ["AMAZING", "SUCCESS", "VICTORY", "TRIUMPH", "BELIEVE", "CAPABLE", "DYNAMIC", "EARNING", "FORWARD"]
    };
    
    // Create fallback words with positions
    const fallbackWords = [];
    
    for (let i = 0; i < 3; i++) {
      const wordLength = fallbackLayout[i];
      const wordCollection = wordCollections[wordLength];
      const word = wordCollection[Math.floor(Math.random() * wordCollection.length)];
      
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