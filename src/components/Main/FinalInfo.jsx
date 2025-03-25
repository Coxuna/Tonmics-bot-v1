// FinalInfo Component
import { useUser } from "../../hooks/UserProvider";
const FinalInfo = () => {
  const { setFirstTime } = useUser();
  
  return (
    <div className="min-h-screen flex items-center justify-center w-fit h-fit p-4">
      <div className="bg-white shadow-lg box-red p-6 max-w-sm w-[70%] transform transition-transform hover:-translate-y-1 relative left-0 -top-20 z-50">
        <div className="absolute w-48 h-24 mx-auto mb-6 -top-12 right-3">
          <img src="/assets/Tonmics.png" alt="Tonmics Logo" className="relative top-0 w-32" />
        </div>
        <div className="space-y-6">
          <p className="text-gray-800 text-lg">
            Enjoy the adventure, and start earning today! 🚀✨
          </p>
          <button
            className="relative z-50 w-full bg-red-600 text-white py-2 px-4 box hover:bg-red-700 transition-colors"
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