import React, { useState, useEffect, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useTelegramWebApp } from "../../hooks/TelegramProvider";


const HomePage = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [homePageCover, setHomePageCover] = useState(true);
    const [isPending, startTransition] = useTransition({
        timeoutMs: 3000,
    });
    // Use the telegram web app hook from the provider
    const { 
        initProgress, 
        isInitializing, 
        user 
    } = useTelegramWebApp();

    // Navigation handler with console logs
    const handleNavigation = () => {
        try {
          startTransition(() => {
            navigate("/Home");
          });
        } catch (error) {
          console.error("Navigation error:", error);
        }
      };

    // Sync our loading progress with the API initialization progress
    useEffect(() => {
        if (isInitializing) {
            // When initializing, use the initProgress from the hook
            setProgress(initProgress);
        } else {
            // When initialization is complete, animate to 100%
            let interval;
            
            if (progress < 100) {
                interval = setInterval(() => {
                    setProgress(prev => {
                        const increment = (100 - prev) / 10; // Gradually slow down
                        return prev + Math.max(1, Math.floor(increment));
                    });
                }, 50);
            }
            
            return () => {
                if (interval) clearInterval(interval);
            };
        }
    }, [progress, initProgress, isInitializing]);

    // Handle transition after progress completes
    useEffect(() => {
        if (progress >= 100) {
            const timer = setTimeout(() => setHomePageCover(false), 500);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    // Alternative solution: Use a wrapper component for content display
    const MainContent = () => (
        <section className="relative top-0 bg-gradient-radial from-[#FAA31E] to-[#D72B29] min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8">
            <img className="absolute w-full h-full object-cover object-center -z-10" src="/assets/secondbackground.webp" alt="Background" />
            <div className="mt-5 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <img className="w-full" src="/assets/floatingchat1.svg" alt="Chat 1" />
            </div>
            <div className="mt-5 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <img className="w-full" src="/assets/floatingchat2.svg" alt="Chat 2" />
            </div>
            <div className="mt-5 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <img className="w-full" src="/assets/floatingchat3.svg" alt="Chat 3" />
            </div>
        </section>
    );

    return (
        <main className="home text-center p-0">
            {homePageCover ? (
                <section className="w-full h-screen bg-gradient-radial from-[#FAA31E] to-[#D72B29] flex flex-col justify-center items-center fixed z-50">
                    <img className="w-full h-full absolute -z-50 object-cover" src="/assets/firstbackground.webp" alt="Background" />
                    <div>
                        <img src="/assets/logofrontpage.webp" alt="Logo" className="w-32 md:w-48 lg:w-56" />
                    </div>
                    <div>
                        <span className="text-gray-900 text-xl md:text-3xl lg:text-5xl">Escape reality with us</span>
                    </div>
                    <div className="w-72 mt-4 mx-10">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center">
                                <span className="text-lg md:text-xl font-semibold py-1 px-2 uppercase rounded-full text-white">Loading...</span>
                                <span className="text-lg md:text-xl font-semibold text-white ml-2">{progress}%</span>
                            </div>
                            <div className="overflow-hidden h-8 mb-4 text-xs flex bg-white rounded">
                                <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#50C42F]"></div>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <>
                    <MainContent />
                    <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50">
                        <button
                            className="cursor-pointer bg-[#FAA31E] h-12 w-fit px-6 sm:px-8 md:px-10 text-base sm:text-lg md:text-xl lg:text-2xl text-black font-bold rounded-lg shadow-md flex items-center justify-center"
                            onClick={handleNavigation}
                        >
                            <span>Let's Begin</span>
                        </button>
                    </div>
                </>
            )}
        </main>
    );
};

export default HomePage;