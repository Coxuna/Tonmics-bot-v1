import { useUser } from "../../hooks/UserProvider";

const SpinInfo = () => {
  const { workWithTour, setFirstTime } = useUser();
  
  const handleNext = () => {
    // Navigate to claim page - using React Router would be better
    workWithTour();
  };
  
  const handleSkip = () => {
    setFirstTime(false);
  };
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-end bg-black/50 bottom-0">
      <div className="relative w-[90%] sm:w-[80%] max-w-md bg-white rounded-lg p-4 sm:p-6 -top-12 sm:-top-16">
        <div className="h-16 sm:h-24 mb-4 sm:mb-6 -top-8 sm:-top-10 absolute w-full -left-0 flex items-center justify-center">
          <img src="/assets/Tonmics.png" alt="Tonmics Logo" className="w-24 sm:w-32" />
        </div>
        <div className="text-center space-y-2 sm:space-y-4 text-primary pt-6 sm:pt-10">
          <h2 className="text-lg sm:text-xl font-bold">
            © Spin the Wheel & Win Rewards
          </h2>
          <p className="text-base sm:text-lg">
            Get 15 spins to win Gems 💎, Keys 🔑, and $TMS points!
          </p>
          <ul className="space-y-1 sm:space-y-2 text-center text-sm sm:text-base">
            <li>Gems & Keys unlock exclusive packages.</li>
            <li>
              Visit the Tonmics ComicPad every 4 hours to claim more $TMS points.
            </li>
          </ul>
        </div>
        <div className="flex gap-4 mt-4 sm:mt-8">
          <button 
            onClick={handleSkip}
            className="flex-1 py-1 sm:py-2 px-4 text-gray-700 box font-bold border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            SKIP
          </button>
          <button 
            onClick={handleNext}
            className="flex-1 py-1 sm:py-2 px-4 text-white box font-bold bg-red-600 hover:bg-red-700 transition-colors"
          >
            NEXT
          </button>
        </div>
      </div>
      <div className="triangle-basic rotate-180 relative -top-12 sm:-top-16"></div>
      <div className="relative mt-6 sm:mt-8 -top-[60px] sm:-top-[70px]">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white boxcustom rounded-full border-[8px] sm:border-[10px] border-red-500 flex items-center justify-center">
          <span className="text-lg sm:text-xl font-bold text-red-500 underline">SPIN</span>
        </div>
      </div>
    </div>
  );
};

export default SpinInfo;