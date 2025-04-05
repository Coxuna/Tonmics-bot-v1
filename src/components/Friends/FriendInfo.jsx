import React,{useState,useEffect} from 'react';
import { useUser } from '../../hooks/UserProvider';

const FriendsInfo = () => {
    const { user, workWithFriendsTour, setFriendsFirstTime } = useUser();
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (user) {
          console.log("Updated User Data:", user);
        }
      }, [user]);

    const handleNext = () => {
        workWithFriendsTour();
    };

    const handleSkip = () => {
        setFriendsFirstTime(false);
    };

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
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center max-h-[90vh] overflow-y-auto max-w-md w-[90%] py-4">
                {/* Referral link card */}
                <div className="w-full px-3 card py-4 mb-4 flex flex-col items-start justify-between">
                    <div className="text-white">
                        <span className="block">Your referral link</span>
                        <span className="block w-full">
                            t.me/Tonmics...?start<br />
                            =REF
                        </span>
                    </div>
                    <div className="flex flex-row mt-2">
                        <button 
                            onClick={copyLink}
                            className="button bg-white py-2 px-4 h-10 text-sm text-black w-fit">
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                </div>
                
                {/* Triangle pointer */}
                <div className="triangle-basic"></div>
                
                {/* Main content */}
                <div className="w-full bg-white rounded-lg p-5">
                    <div className="text-center space-y-4 text-primary">
                        <h2 className="text-xl font-bold">
                            👥 Referrals
                        </h2>
                        <ul className="space-y-2 text-center">
                            <li>
                                Invite friends and earn 400 $TMS points for every successful referral!
                            </li>
                        </ul>
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-4 mt-6 mb-4">
                        <button 
                            onClick={handleSkip}
                            className="flex-1 py-2 px-4 text-gray-700 box font-bold border-2 border-gray-300 hover:bg-gray-100 transition-colors">
                            SKIP
                        </button>
                    </div>
                </div>
                
                {/* Logo */}
                <div className="mt-4 flex items-center justify-center">
                    <img src="/public/assets/Tonmics.png" alt="Tonmics Logo" className="w-32" />
                </div>
            </div>
            
            {/* CSS styles */}
            <style>{`
                .shadow-lg {
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                        0 5px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .box {
                    box-shadow: 2px 10px 2px 0px black;
                }
                .box-red {
                    box-shadow: 2px 10px 2px 0px red;
                }
                .triangle-basic {
                    width: 0;
                    height: 0;
                    border-left: 25px solid transparent;
                    border-right: 25px solid transparent;
                    border-bottom: 50px solid white;
                    margin-bottom: -20px;
                    z-index: 10;
                }
                .boxcustom {
                    box-shadow: 1px 0px 50px 1px rgba(255, 255, 255, 0.411);
                }
                .card {
                    display: flex;
                    justify-content: space-between;
                    height: fit-content;
                    background-color: #18325B;
                    box-shadow: 2px 10px 0px 0px black;
                }
                .button {
                    width: fit-content;
                    height: fit-content;
                    box-shadow: 2px 10px 0px 0px black;
                    padding: 8px 6px;
                }
            `}</style>
        </div>
    );
};

export default FriendsInfo;