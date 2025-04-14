import React, { useContext, useState } from 'react';
import {  useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import ConnectButton from '../../components/Main/TonConnectBtn';
import { useUser } from '../../hooks/UserProvider';
import PaymentConfirmationModal from '../../components/Star/PaymentConfirmModal';
import megaPackages from '../../components/Star/megaPackages';
import exclusivePackages from '../../components/Star/exclusivePackages';
import {beginCell} from'@ton/ton';
// Smart contract configuration
const CONTRACT_ADDRESS = 'EQAqGyYfyIZuseIhybZ1ZrgcepNZxol7zaPf_p37s-iQrxC9'; // Replace with actual contract address

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
  function toNano(amount) {
    return BigInt(Math.floor(parseFloat(amount) * 1e9));
  }

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
    if (!selectedPackage || !userAddress) return;
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const packageAmount = toNano(selectedPackage.tonAmount);
      
      // Create payload cell for contract interaction
      const methodName = activeTab === 'mega' ? 'BuyMegaPackage' : 'BuyExclusive';
      
      // Create the payload cell with the method and parameters
      const payload = beginCell()
        .storeUint(0, 32) // op code for comment
        .storeString(methodName + ":" + selectedPackage.id)
        .endCell();
      
      // Convert cell to base64 encoded BOC
      const payloadBase64 = payload.toBoc().toString('base64');
      
      // Transaction structure according to TON Connect docs
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360, // Valid for 6 minutes
        network: 'testnet', // Specify testnet!
        messages: [
          {
            address: CONTRACT_ADDRESS,
            amount: packageAmount.toString(),
            payload: payloadBase64
          }
        ]
      });
      
      console.log('Transaction result:', result);
      
      // After successful transaction, update user data in your system
      if (result) {
        await updateUser(user?.telegram_id, {
          gems: user.gems + selectedPackage.gems,
          tms_points: user.tms_points + selectedPackage.tmsPoints,
          t_keys: user.t_keys + selectedPackage.keys
        });
        
        // Close modal and show success notification
        setShowPaymentModal(false);
        alert(`Successfully purchased ${selectedPackage.title}!`);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      if (error.message && error.message.includes('Wallet declined')) {
        setErrorMessage('Transaction was declined by the wallet.');
      } else {
        setErrorMessage('Transaction failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute w-full min-h-screen bg-gradient-radial from-[#FAA31E] to-[#D72B29] flex items-center justify-center p-4">
      <img className="absolute w-full h-full object-cover -z-50" src="/assets/secondbackground.webp" alt="Background" />
      
      <div className="flex flex-col items-center justify-center w-full max-w-xl px-6 py-10">
        <img src='/star.png' alt="Star" className="mb-4 w-40 h-40" style={{marginBottom:'30px'}}/>
        
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