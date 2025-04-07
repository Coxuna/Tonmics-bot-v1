import React from 'react';

const Toast = ({ 
  title, 
  cta = "Spin more", 
  isVisible, 
  watchAds = false, 
  responseType, 
  message, 
  message2 = "Keep spinning to win more daily", 
  showOutOfSpins = false,
  onClose, 
  onWatchAd 
}) => {
  const closeModal = () => {
    onClose();
  };

  const watchAdFunction = () => {
    if (onWatchAd) {
      window.Adsgram?.init({ blockId: "int-9606" })?.show()
        .then((result) => {
          if (result.done) {
            onWatchAd();
          }
        })
        .catch(() => {
          alert('Error playing ad');
        });
    }
  };

  if (!isVisible) return null;

  let imageSrc = "";
  
  if (showOutOfSpins) {
    imageSrc = "/assets/thought_balloon_nospins.png";
  } else if (responseType === '2 Keys') {
    imageSrc = "/assets/thought_balloon.svg";
  } else if (responseType === '50 Tonmics') {
    imageSrc = "/assets/thought_balloon_coins.png";
  } else if (responseType === '2 Gems') {
    imageSrc = "/assets/thought_balloon_diamond.png";
  } else if (responseType === 'Try again' || responseType === 'Draw') {
    imageSrc = "/assets/thought_balloon_oops.png";
  }else if (responseType === '1 Key') {
    imageSrc = "/assets/thought_balloon.svg";
  }else if (responseType === '20 Tonmics') {
    imageSrc = "/assets/thought_balloon_coins.png";
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]" onClick={closeModal}>
      <div 
        className="bg-[#18325B] p-5 w-full max-w-lg mx-auto rounded-lg text-center shadow-[2px_10px_0px_0px_black]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="invisible">{title}</h3>
          <button onClick={closeModal} className="bg-transparent border-none text-2xl cursor-pointer">
            <img src="/assets/x.png" alt="close" />
          </button>
        </div>
        
        <div className="w-full mt-3 flex flex-col justify-center items-center">
          {imageSrc && <img className="w-3/4" src={imageSrc} alt={responseType || "spin result"} />}
          <h2 className="text-xl mb-2 text-white">{message}</h2>
          <span className="text-white">{message2 || "Keep spinning to win more daily"}</span>
        </div>
        
        <div className="flex justify-center mt-5">
          {watchAds && (
            <button 
             onClick={watchAdFunction}
              className="bg-[#FAA31E] h-10 px-10 text-black font-bold mr-10 shadow-[2px_10px_0px_0px_black]"
            >
              <span>Watch Ads</span>
            </button>
          )}
          <button 
            onClick={closeModal} style={{marginLeft:'20px'}}
            className="bg-[#FAA31E] h-10 px-10 text-black font-bold shadow-[2px_10px_0px_0px_black]"
          >
            <span>{cta}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;