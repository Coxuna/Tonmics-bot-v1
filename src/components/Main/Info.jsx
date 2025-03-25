import React from "react";
import { TonConnectButton } from "@tonconnect/ui-react";

const InfoComponent = ({ point, username }) => {
  return (
    <>
      <div className="flex flex-row justify-between w-full bg-white p-2">
        {/* User Info */}
        <div className="rounded-xl w-[50%] h-10 flex items-center space-x-4">
          <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
            <span className="uppercase font-semibold">
              {username ? username.slice(0, 1) : "?"}
            </span>
          </div>
          <span className="text-black uppercase font-semibold text-lg">
            {username || "Guest"}
          </span>
        </div>

        {/* Token Info */}
        <div className="rounded-xl text-white w-[45%] flex items-center justify-center h-10">
          <TonConnectButton />
        </div>
      </div>

      <div className="w-full h-2 bg-black"></div>
    </>
  );
};

export default InfoComponent;
