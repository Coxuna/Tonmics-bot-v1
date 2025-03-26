import { useState, useEffect } from "react";

export default function Scrabble() {
 

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
               
                {/* Countdown Timer */}
             
            </div>
        </div>
    );
}
