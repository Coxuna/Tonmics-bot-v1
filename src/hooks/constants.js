export const getAvailableSpinCounts = (value) => {
  const maxSpin = 15;
  
  // Ensure the value doesn't exceed the maximum spin count
  if (value < 0 || value > maxSpin) {
    return 0; // Return 0 if the value is out of range
  }

  // Calculate the available spin counts dynamically based on the value
  const spinMapping = Math.max(0, maxSpin - value);

  return spinMapping;
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
