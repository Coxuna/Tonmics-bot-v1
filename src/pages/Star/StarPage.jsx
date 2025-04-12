import React, { useState } from 'react';
import PaymentConfirmationModal from '../../components/Star/PaymentConfirmModal';

const RewardsPanel = () => {
  const [activeTab, setActiveTab] = useState('mega');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  const megaPackages = [
    {
      title: "🌟 Rising Panel",
      description: <>🔓 Unlock <strong>400 $TMS Points + 10 Golden Keys</strong></>,
      price: "50 ⭐ (0.1434 TON)",
      tonAmount: "0.1434 TON",
      wide: false
    },
    {
      title: "🛡 Hero's Journey",
      description: <>🔓 Unlock <strong>Scrabble AI Mode + 20 Gems &amp; 20 Keys</strong></>,
      price: "200 ⭐ (0.5736 TON)",
      tonAmount: "0.5736 TON",
      wide: false
    },
    {
      title: "⚔ Vigilante Vault",
      description: <>
        🎮 Play <strong>Scrabble with your best friends</strong><br />
        🏆 <strong>+100 $TMS Points + 10 Gems &amp; 35 Keys</strong>
      </>,
      price: "300 ⭐ (0.8604 TON)",
      tonAmount: "0.8604 TON",
      wide: true
    },
    {
      title: "🏅 Legends League",
      description: <>🎁 Unlock <strong>3500 $TMS Points + 50 Golden Keys</strong></>,
      price: "800 ⭐ (2.2944 TON)",
      tonAmount: "2.2944 TON",
      wide: false
    }
  ];
  
  const exclusivePackages = [
    {
      title: "🚀 Cosmic Crossover",
      description: <>🔓 Unlock <strong>50 Gems</strong></>,
      price: "500 ⭐",
      tonAmount: "1.434 TON",
      wide: false
    },
    {
      title: "💫 Infinity Saga",
      description: <>🔓 Unlock <strong>100 Gems</strong></>,
      price: "1,000 ⭐",
      tonAmount: "2.868 TON",
      wide: false
    },
    {
      title: "🌌 Omniverse Mastery",
      description: <>🔓 Unlock <strong>150 Gems</strong></>,
      price: "1,500 ⭐",
      tonAmount: "4.302 TON",
      wide: false
    },
    {
      title: "🔮 Secret Saga",
      description: <>🔓 Unlock <strong>300 Gems</strong></>,
      price: "3,000 ⭐",
      tonAmount: "8.604 TON",
      wide: false
    },
    {
      title: "⚡ Infinity Warfront",
      description: <>🔓 Unlock <strong>500 Gems</strong></>,
      price: "5,000 ⭐",
      tonAmount: "14.34 TON",
      wide: false
    },
    {
      title: "🌀 Quantum Rebirth",
      description: <>🔓 Unlock <strong>1K Gems</strong></>,
      price: "10,000 ⭐",
      tonAmount: "28.68 TON",
      wide: false
    },
    {
      title: "❄ Absolute Zero Hour",
      description: <>🔓 Unlock <strong>2K Gems</strong></>,
      price: "20,000 ⭐",
      tonAmount: "57.36 TON",
      wide: false
    },
    {
      title: "🛑 The Endgame",
      description: <>🔓 Unlock <strong>5K Gems</strong></>,
      price: "50,000 ⭐",
      tonAmount: "143.4 TON",
      wide: false
    },
    {
      title: "👑 Tonmics Legend",
      description: <>🔓 Unlock <strong>10K Gems</strong></>,
      price: "100,000 ⭐",
      tonAmount: "286.8 TON",
      wide: false
    }
  ];

  const currentPackages = activeTab === 'mega' ? megaPackages : exclusivePackages;

  const handleUnlock = (packageItem) => {
    setSelectedPackage(packageItem);
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPackage(null);
  };

  const handleConfirmPayment = () => {
    // Process payment here
    console.log(`Processing payment for ${selectedPackage.title} - ${selectedPackage.tonAmount}`);
    setShowPaymentModal(false);
    setSelectedPackage(null);
  };

  return (
    <div className="absolute w-full min-h-screen bg-gradient-radial from-[#FAA31E] to-[#D72B29] flex items-center justify-center p-4">
      <img className="absolute w-full h-full object-cover -z-50" src="/assets/secondbackground.webp" alt="Background" />
      
      <div className="flex flex-col items-center justify-center w-full max-w-xl px-6 py-10 " >
        <img src='star.png' alt="Star" className="mb-4 w-40 h-40"  style={{marginBottom:'30px'}}/>
        
        <div className="text-white text-center font-bold text-2xl uppercase mb-6" style={{marginBottom:'20px'}}>
          Get Your Star Packages
        </div>
        
        <div className="flex w-full max-w-xl mx-auto border-b-2 border-black " style={{marginBottom:'20px'}}>
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
          packagePrice={selectedPackage.tonAmount}
          onConfirm={handleConfirmPayment}
          onClose={handleCloseModal}
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