import React, { useContext, useState } from 'react';
import {  useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import ConnectButton from '../../components/Main/TonConnectBtn';
import { useUser } from '../../hooks/UserProvider';
import PaymentConfirmationModal from '../../components/Star/PaymentConfirmModal';
import megaPackages from '../../components/Star/megaPackages';
import exclusivePackages from '../../components/Star/exclusivePackages';
import {toNano, beginCell} from '@ton/ton'
import ResponsivePadding from '../../components/shared/ResponsivePadding';
// Smart contract configuration

const RewardsPanel = () => {
  const [activeTab, setActiveTab] = useState('mega');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get user wallet connection
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  // Get user context for updating user data
  const { user, updateUser } = useUser();
  

  const currentPackages = activeTab === 'mega' ? megaPackages : exclusivePackages;

  const handleUnlock = (packageItem) => {
    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    setSelectedPackage(packageItem);
    setShowPaymentModal(true);
    setErrorMessage('');
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPackage(null);
    setErrorMessage('');
  };
 

 
  const handleConfirmPayment = async () => {
    console.log('⚡ DEBUG: handleConfirmPayment triggered');
  
    // Configuration
    const RECIPIENT_ADDRESS = "UQCsFgwsaz2cF4jJA2Ns2pM6Wo0D3RkLLpI53vrdZvXUyEcR"; // The destination wallet address
    
    if (!selectedPackage || !userAddress) {
      console.error("❌ Missing selectedPackage or userAddress");
      setErrorMessage("Something went wrong. Missing package or address.");
      return;
    }
  
    // Make sure the wallet is connected before proceeding
    if (!tonConnectUI.connected) {
      console.error("❌ Wallet not connected");
      setErrorMessage("Please connect your wallet first.");
      return;
    }
  
    setIsProcessing(true);
    setErrorMessage('');
  
    try {
      const packageAmount = toNano(selectedPackage.tonAmount);
  
      console.log("✅ Selected package:", selectedPackage);
      console.log("👤 User address:", userAddress);
      console.log("📬 Recipient address:", RECIPIENT_ADDRESS);
      console.log("💰 TON amount in nano:", packageAmount.toString());
  
      // Transaction sending with proper error handling
      try {
        console.log("🚀 Preparing to send transaction...");
        
        // Create a simple transaction request
        const transactionRequest = {
          validUntil: Math.floor(Date.now() / 1000) + 60, // Valid for 6 minutes
          network: 'testnet',
          messages: [
            {
              address: RECIPIENT_ADDRESS,
              amount: packageAmount.toString()
            }
          ]
        };
        
        console.log("📝 Transaction request:", JSON.stringify(transactionRequest));
        
        // Send the transaction
        const result = await tonConnectUI.sendTransaction(transactionRequest);
        
        console.log("✅ Transaction result:", result);
        
        // Success flow
        console.log("🎉 Updating user data...");
        await updateUser(user?.telegram_id, {
          gems: user.gems + selectedPackage.gems,
          tms_points: user.tms_points + selectedPackage.tmsPoints,
          t_keys: user.t_keys + selectedPackage.keys
        });
  
        setShowPaymentModal(false);
        alert(`✅ Successfully purchased ${selectedPackage.title}!`);
        
      } catch (e) {
        console.error("❌ sendTransaction threw error:", e);
        
        // More specific error handling
        if (e.message && e.message.includes('Transaction was not sent')) {
          setErrorMessage("Transaction was cancelled or rejected by wallet.");
        } else if (e.message && e.message.includes('Wallet not connected')) {
          setErrorMessage("Wallet connection lost. Please reconnect and try again.");
        } else {
          setErrorMessage(`Transaction failed: ${e.message || 'Unknown error'}`);
        }
        
        setIsProcessing(false);
        return;
      }
      
    } catch (error) {
      console.error("🔥 Unexpected error in handleConfirmPayment:", error);
      setErrorMessage(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      console.log("🧹 Done processing payment");
    }
  };

  return (
    <ResponsivePadding>
     <div className="flex justify-center items-start overflow-auto py-1 px-4 pb-12 w-full min-h-screen">
     <img
            className="fixed w-full h-full object-cover top-0 left-0 -z-10"
            src="/assets/secondbackground.webp"
            alt="Background"
          />
      
      <div className="flex flex-col items-center justify-center w-full max-w-xl px-6 py-10">
        <img src='/star.png' alt="Star" className="mb-4 w-30 h-25" style={{marginBottom:'30px'}}/>
        
        <div className="text-white text-center font-bold text-2xl uppercase mb-6" style={{marginBottom:'20px'}}>
          Get Your Star Packages
        </div>
        
        {/* Wallet connection button */}
        <div className="mb-4">
          <ConnectButton/>
         
        </div>
        
        <div className="flex w-full max-w-xl mx-auto border-b-2 border-black" style={{marginBottom:'20px'}}>
          {['mega', 'exclusive'].map((tab) => (
            <div 
              key={tab}
              className={`flex-1 h-12 flex items-center justify-center cursor-pointer transition-all ${
                activeTab === tab ? 'bg-white text-black font-bold' : 'bg-[#17325b] text-white'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="text-sm uppercase">
                {tab === 'mega' ? 'Mega' : 'Exclusive Dorm'}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
          {currentPackages.map((item, index) => (
            <RewardItem 
              key={index}
              title={item.title}
              description={item.description}
              price={item.price}
              wide={item.wide}
              onUnlock={() => handleUnlock(item)}
            />
          ))}
        </div>
      </div>

      {showPaymentModal && selectedPackage && (
        <PaymentConfirmationModal
          isVisible={showPaymentModal}
          packageTitle={selectedPackage.title}
          packagePrice={`${selectedPackage.tonAmount} TON`}
          onConfirm={handleConfirmPayment}
          onClose={handleCloseModal}
          isProcessing={isProcessing}
          errorMessage={errorMessage}
        />
      )}
    </div>
    </ResponsivePadding>
  );
};

const RewardItem = ({ title, description, price, wide = false, onUnlock }) => {
  return (
    <div className="bg-[#17325b] border-b-2 border-black p-5 rounded-lg flex flex-col gap-3 shadow-lg">
      <h3 className="text-white font-bold text-lg">{title}</h3>
      <p className="text-white/90 text-sm">{description}</p>
      <div className="flex justify-between items-center">
        <p className="text-white text-sm">{price}</p>
        <button 
          className="bg-[#faa31e] border-r-2 border-b-4 border-black px-4 py-2 text-black text-sm uppercase font-bold rounded-md shadow-md transition-transform active:translate-y-0.5"
          onClick={onUnlock}
        >
          Unlock
        </button>
      </div>
    </div>
  );
};

export default RewardsPanel;