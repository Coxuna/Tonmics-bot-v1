// ClaimInfo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const ClaimInfo = () => {
  const [progress, setProgress] = useState(25);
  const navigate = useNavigate();

  const handleNext = () => {
    // Increment progress if less than 100
    if (progress < 100) {
      setProgress(prev => prev + 25);
    }
    
  };

  const handleSkip = () => {
    // Placeholder for skipping
    console.log('Skipped');
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-start bg-black/50 pt-60">
      <div className="relative w-full px-10 mt-8">
        <div className="bg-white border-red-500 border-2 p w-full rounded-lg p-4 mb-8 relative z-10">
          <div className="text-black/70 mb-2">4.008</div>
          <div className="flex justify-between items-center">
            <div className="text-black font-medium"></div>
            <div className="text-black font-medium">
              Click claim to fill
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-black font-medium">LEVEL 1</div>
            <div className="text-black font-medium">
              SPEED 0.003476
              <img 
                className="mr-1 w-3 inline" 
                src="/assets/token.png" 
                alt="Token"
              />/S
            </div>
          </div>
        </div>
      </div>
      
      <div className="triangle-basic relative"></div>
      
      <div className="relative w-[80%] max-w-md bg-white rounded-lg p-6">
        <div className="text-center space-y-4 text-primary pt-10">
          <h2 className="text-xl font-bold">
            Farm to earn
          </h2>
          
          <ul className="space-y-2 text-center list-disc">
            <li>
              Visit the Tonmics ComicPad every 4 hours to claim more $TMS points.
            </li>
          </ul>
        </div>
        
        <div className="flex gap-4 mt-8 mb-8">
          <button 
            onClick={handleSkip}
            className="flex-1 py-2 px-4 text-gray-700 box font-bold border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            SKIP
          </button>
          <button 
            onClick={handleNext}
            className="flex-1 py-2 px-4 text-white box font-bold bg-red-600 hover:bg-red-700 transition-colors"
          >
            NEXT
          </button>
        </div>
      </div>
      
      <div className="h-24 mb-6 relative w-full -top-10 -left-0 flex items-center justify-center">
        <img 
          src="/public/assets/Tonmics.png" 
          alt="Tonmics Logo" 
          className="w-32" 
        />
      </div>
    </div>
  );
};

export default ClaimInfo;

// Custom styles for ClaimInfo
const styles = `
  .triangle-basic {
    width: 0;
    height: 0;
    border-left: 25px solid transparent;
    border-right: 25px solid transparent;
    border-bottom: 50px solid white;
  }
  .box {
    box-shadow: 2px 10px 2px 0px black;
  }
`;

// Inject styles
const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet);