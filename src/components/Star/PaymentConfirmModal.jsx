import React from 'react';

const PaymentConfirmationModal = ({
  isVisible,
  packageTitle,
  packagePrice,
  onConfirm,
  onClose,
  isProcessing = false,
  errorMessage = ''
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div
        className="bg-[#18325B] p-6 w-full max-w-lg mx-auto rounded-lg text-center shadow-[2px_10px_0px_0px_black]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end items-center">
          <button 
            onClick={onClose} 
            className="bg-transparent border-none text-2xl cursor-pointer"
            disabled={isProcessing}
          >
            <img src="/assets/x.png" alt="close" />
          </button>
        </div>
        
        <div className="w-full mt-3 flex flex-col justify-center items-center">
          <img className="w-1/3 mb-4" src="/assets/star_pay.png" alt="star" />
          <h2 className="text-2xl font-bold mb-4 text-white">CONFIRM YOUR PAYMENT</h2>
          <p className="text-white text-lg mb-6">
            Do you want to buy <strong>{packageTitle}</strong> package for <strong>{packagePrice}</strong>?
          </p>
          
          {errorMessage && (
            <div className="bg-red-600 text-white p-3 mb-4 w-full rounded">
              {errorMessage}
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2 text-white">Processing payment...</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`bg-[#FAA31E] h-12 px-10 text-black font-bold shadow-[2px_4px_0px_0px_black] hover:shadow-[1px_2px_0px_0px_black] hover:translate-y-0.5 transition-all ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span>CONFIRM AND PAY</span>
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`bg-[#414141] h-12 px-10 text-white font-bold shadow-[2px_4px_0px_0px_black] hover:shadow-[1px_2px_0px_0px_black] hover:translate-y-0.5 transition-all ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span>CANCEL</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;