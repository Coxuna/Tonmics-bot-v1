export const getAvailableSpinCounts = (value) => {
  const spinMapping = {
    0: 3,
    1: 2,
    2: 1,
    3: 0,
  };

  return spinMapping[value] ?? 0; // Default to 0 if value is not in the mapping
}





{
  /* 
  SAMPLE RESPONSE
  {
  "words": [
    { "word": "FUN", "positions": [0, 1, 2] },
    { "word": "TOY", "positions": [3, 4, 5] },
    { "word": "BIZ", "positions": [6, 7, 8] }
  ]
}
  
  
  */
}
