import { useUser } from "../../hooks/UserProvider";

const FinalInfo = () => {
  const { setFirstTime } = useUser();
  
  return (
    <div className="min-h-screen flex items-center justify-center w-full p-4">
      <div className="bg-white shadow-lg box-red p-4 sm:p-6 max-w-sm w-[85%] sm:w-[70%] transform transition-transform hover:-translate-y-1 relative left-0 -top-10 sm:-top-20 z-50">
        <div className="absolute w-32 sm:w-48 h-16 sm:h-24 mx-auto mb-4 sm:mb-6 -top-8 sm:-top-12 right-3">
          <img src="/assets/Tonmics.png" alt="Tonmics Logo" className="relative top-0 w-24 sm:w-32" />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <p className="text-gray-800 text-base sm:text-lg">
            Enjoy the adventure, and start earning today! 🚀✨
          </p>
          <button
            className="relative z-50 w-full bg-red-600 text-white py-1.5 sm:py-2 px-4 box hover:bg-red-700 transition-colors"
            onClick={() => setFirstTime(false)}
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalInfo;