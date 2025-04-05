import React, { useState, useEffect } from 'react';
import ClaimInfo from '../../components/claim/ClaimInfo';
import FriendsInfo from '../../components/Friends/FriendInfo';
import { useUser } from '../../hooks/UserProvider';
import BackSheetModal from '../../components/Main/BackSheetModal';
import { useNavigate } from 'react-router';
import ResponsivePadding from '../../components/shared/ResponsivePadding';
import FriendsSeparator from '../../components/Friends/FriendsComponent';

const Friends = () => {
  const [copied, setCopied] = useState(false);
  const [frens, setFrens] = useState([]);
  const [isModalReady, setIsModalReady] = useState(false);
  const navigate = useNavigate();
  
  // Mock user data (replacing userStore)
  const { user, setFriendsFirstTime } = useUser();
  
  useEffect(() => {
    // Set modal ready after user data has loaded
    if (user !== undefined) {
      setIsModalReady(true);
    }
  }, [user]);

  const copyLink = () => {
    const link = `t.me/tonmicsbot?start=${user?.referral_code}`; // Update with your actual referral link

    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = link;
    document.body.appendChild(textArea);

    // Select and copy the text
    textArea.select();
    textArea.setSelectionRange(0, 99999); // Ensure compatibility on mobile devices

    try {
        const success = document.execCommand("copy");
        if (success) {
            setCopied(true);
            alert("Copied to clipboard!"); // Telegram WebView supports alerts
        } else {
            throw new Error("Copy command failed");
        }
    } catch (err) {
        console.error("Failed to copy:", err);
        alert("Failed to copy. Please copy manually.");
    }

    // Cleanup: Remove textarea from DOM
    document.body.removeChild(textArea);

    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
};


  const goBack = () => {
    navigate("/Home");
  };

  return (
    <>
      {isModalReady && (
        <BackSheetModal isVisible={user?.is_frens_first_time}>
          <FriendsInfo />
         
        </BackSheetModal>
      )}
      
      <ResponsivePadding>
        <div className="relative min-h-screen w-full">
          {/* Background Image */}
          <img
            className="fixed w-full h-full object-cover top-0 left-0 -z-10"
            src="/assets/secondbackground.webp"
            alt="Background"
          />
          
          {/* Content Container */}
          <div className="flex flex-col w-full max-w-3xl mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between w-full mb-6 px-2">
              <h1 className="text-xl font-medium text-black md:text-2xl lg:text-3xl">
                Invite Friends
              </h1>
              <button 
                className="flex items-center justify-center w-10 h-10 shadow-[2px_4px_0px_0px_black] p-2 bg-[#18325B]" 
                onClick={goBack}
              >
                <img src="/assets/x.png" alt="Back" className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </header>
            
            {/* Referral Link Card */}
            <div className="w-full bg-[#18325B] shadow-[2px_4px_0px_0px_black] p-4 md:p-5 mb-6 mx-auto">
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="text-white">
                  <span className="block text-sm md:text-base mb-1">Your referral link</span>
                  <span className="block w-full break-words text-sm md:text-base">
                    t.me/Tonmics...?start={user?.referral_code}
                  </span>
                </div>
                <div>
                  <button 
                    onClick={copyLink} 
                    className="w-32 h-10 py-2 px-4 cursor-pointer text-sm text-black bg-white shadow-[2px_4px_0px_0px_black] hover:shadow-[1px_2px_0px_0px_black] hover:translate-y-0.5 transition-all md:text-base"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
            
            <FriendsSeparator/>
          </div>
        </div>
      </ResponsivePadding>
    </>
  );
};

export default Friends;