import React, { useState, useEffect } from 'react';
import { 
  TonConnectUIProvider, 
  useTonConnectUI, 
  useIsConnectionRestored,
  useTonWallet
} from '@tonconnect/ui-react';

const ConnectButton = () => {
  const [tonConnectUI] = useTonConnectUI();
  const connectionRestored = useIsConnectionRestored();
  const wallet = useTonWallet();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Once connection is restored, set loading to false
    if (connectionRestored) {
      setIsLoading(false);
    }
  }, [connectionRestored]);

  // Handle button click
  const handleButtonClick = () => {
    if (wallet) {
      // If wallet is connected, disconnect
      tonConnectUI.disconnect();
    } else {
      // If no wallet is connected, open modal
      tonConnectUI.openModal();
    }
  };

  // Determine button state
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <div className="bg-gray-300 p-[4px] mb-1">
          <div className="border border-gray-400 p-1">
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="bg-[#D72B29] p-[4px] mb-1  cursor-pointer" 
        onClick={handleButtonClick}
      >
        <div className="border border-white p-1">
          <span className="text-white">
            {wallet ? 'Disconnect' : 'Connect'}
          </span>
        </div>
      </div>
    );
  };

  return getButtonContent();
};

export default ConnectButton