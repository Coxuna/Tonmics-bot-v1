import { useUser } from "../../hooks/UserProvider";
const Welcome = () => {
  const { workWithTour } = useUser();
  
  return (
    <>
      <img src="/assets/Mascot three quater view Trans[1](1) 1.svg" className="absolute bottom-0 z-10 left-0" />
      <div className="min-h-screen flex items-center justify-center w-fit h-fit p-4">
        <div className="bg-white shadow-lg box-red p-6 max-w-sm w-[70%] transform transition-transform hover:-translate-y-1 relative left-10 -top-20 z-50">
          <div className="absolute w-48 h-24 mx-auto mb-6 -top-12 right-3">
            <img src="/assets/Tonmics.png" alt="Tonmics Logo" className="relative w-32" />
          </div>
          <div className="space-y-6">
            <p className="text-gray-800 text-lg">
              Welcome to Tonmics! Let's take a quick tour of the app and explore its exciting features.
            </p>
            <button
              className="relative z-50 w-full bg-red-600 text-white py-2 px-4 box hover:bg-red-700 transition-colors"
              onClick={workWithTour}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;