import React from "react";
import { TonConnectButton } from "@tonconnect/ui-react";

const InfoBox = () => {
  return (
    <div className="relative w-full">
      {/* White Background Section */}
      <div className="bg-white w-full p-6 md:p-10">
        <div className="flex justify-between items-center w-full">
          {/* Left Side Content */}
          <div className="text-black text-lg md:text-xl font-semibold">
            Left 
          </div>

          {/* Right Side Content */}
          <div className="text-black text-lg md:text-xl font-semibold">
         <TonConnectButton/>
          </div>
        </div>
      </div>

      {/* Black Divider Section */}
      <div className="w-full h-2 bg-black"></div>

     
    </div>
  );
};

export default InfoBox;
