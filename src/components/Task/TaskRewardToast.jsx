import React from 'react';

const TaskRewardToast = ({
  isVisible,
  rewardAmount,
  rewardType,
  message = "Reward Claimed!",
  message2 = "Complete more tasks to earn rewards",
  onClose
}) => {
  const closeModal = () => {
    onClose();
  };

  if (!isVisible) return null;

  // Select appropriate image based on reward type
  let imageSrc = "";
  if (rewardType?.toLowerCase().includes('key')) {
    imageSrc = "/assets/thought_balloon.svg";
  } else if (rewardType?.toLowerCase().includes('tms')) {
    imageSrc = "/assets/thought_balloon_coins.png";
  } else if (rewardType?.toLowerCase().includes('gem')) {
    imageSrc = "/assets/thought_balloon_diamond.png";
  } else {
    // Default image for other reward types
    imageSrc = "/assets/thought_balloon_coins.png";
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]" onClick={closeModal}>
      <div
        className="bg-[#18325B] p-5 w-full max-w-lg mx-auto rounded-lg text-center shadow-[2px_10px_0px_0px_black]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="invisible">Reward Claimed</h3>
          <button onClick={closeModal} className="bg-transparent border-none text-2xl cursor-pointer">
            <img src="/assets/x.png" alt="close" />
          </button>
        </div>
        
        <div className="w-full mt-3 flex flex-col justify-center items-center">
          {imageSrc && <img className="w-3/4" src={imageSrc} alt="reward" />}
          <h2 className="text-xl mb-2 text-white">{message}</h2>
          <span className="text-white text-lg font-bold">+{rewardAmount} {rewardType}</span>
          <span className="text-white mt-2">{message2}</span>
        </div>
        
        <div className="flex justify-center mt-5">
          <button
            onClick={closeModal}
            className="bg-[#FAA31E] h-10 px-10 text-black font-bold shadow-[2px_10px_0px_0px_black]"
          >
            <span>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskRewardToast;