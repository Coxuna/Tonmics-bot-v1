// Toast Component for notifications
const Toast = ({ isVisible, onVisibilityChange, children, title, cta, onWatchAd }) => {
  if (!isVisible) return null;
 
  const handleButtonClick = () => {
    if (cta === "Watch Ad") {
      onWatchAd();
    } else {
      onVisibilityChange(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/70">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-lg max-w-md w-full md:w-4/5 lg:w-3/5 text-center">
        <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
        <div className="mb-4">
          {children}
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition-colors shadow-md"
          onClick={handleButtonClick}
        >
          {cta}
        </button>
      </div>
    </div>
  );
};

export default Toast;