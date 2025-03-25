import { useState, useEffect } from "react";

export default function FarmPage() {
    const [time, setTime] = useState(2 * 30 * 24 * 60 * 60); // 30 days in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        const months = Math.floor(time / (30 * 24 * 3600));
        const days = Math.floor((time % (30 * 24 * 3600)) / (24 * 3600));
        const hours = Math.floor((time % (24 * 3600)) / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        return `${months} month : ${days} day : ${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden">
            <img className="absolute -z-50 top-0 w-full h-full object-cover" src="/assets/secondbackground.webp" alt="Background" />
            <div className="relative z-10 text-center p-6 bg-transparent">
                <h1 className="text-4xl md:text-6xl font-bold comic-font mb-8 text-black">
                    COMICS FROM US!!
                </h1>
                <div className="inline-block p-6 md:p-8 bg-transparent mb-8">
                    <img src="/assets/comingsoon.png" alt="Coming Soon" />
                </div>
                <p className="text-lg md:text-xl font-semibold text-black mb-8 max-w-md mx-auto">
                    KEEP UP GAMING AND PLAYING GAMES TO GET ACCESS TO THE COMIC BELOW IN STAGE 2.
                </p>
                {/* Countdown Timer */}
             
            </div>
        </div>
    );
}
