// BackSheetModal Component
const BackSheetModal = ({ isVisible, children }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/80 flex justify-center items-center z-[9999]">
      <div className="w-auto bg-transparent" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default BackSheetModal;