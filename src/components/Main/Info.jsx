import React from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useUser } from "../../hooks/UserProvider";
const InfoComponent = () => {
  const {user} =useUser()
  return (
    <>
      <div className="flex flex-row justify-between w-full  p-2">
        {/* User Info */}
        <div className="rounded-xl w-[50%] h-10 flex items-center space-x-2">
  {/* Icon + First Letter */}
  <div className="shrink-0 w-8 h-[32.34px] relative">
    <img
      className="w-8 h-[32.34px] absolute left-0 top-0 overflow-visible"
      src="/assets/na.png"
      alt="Icon"
    />
    <div
      className="text-center text-[17.2px] font-normal uppercase absolute left-[8.6px] top-[2.88px] w-[13.07px] h-[17.19px]"
      style={{ transformOrigin: "0 0", transform: "rotate(0deg) scale(1, 1)" }}
    >
      {user?.user_name?.charAt(0)}
    </div>
  </div>

  {/* Full Username Outside the Rectangle */}
  <span className="text-[30px] font-medium">{user?.user_name}</span>
</div>


        {/* Token Info */}
        <div className="rounded-xl text-white w-[45%] flex items-center justify-center h-10">
        <div className="shrink-0 w-[82px] h-[29.1px] relative">
  <div className="bg-[#262626] rounded-[15px] w-[92.74px] h-[23.52px] absolute left-[9.26px] top-[5.29px]"></div>
  
  <div className="text-[#ffffff] text-left  font-normal absolute left-[42px] top-[5.55px] w-[21.16px] h-[19.84px]">
    {user?.tms_points}
  </div>

  <div className="w-[31.1px] h-[33.1px] absolute left-0 top-0">
    <img
      className="w-[100%] h-[100%] absolute right-[0%] left-[0%] bottom-[0%] top-[0%] overflow-visible"
      src="/assets/tokken.png"
      alt="Mask Group 0"
    />
    
    <div
      className=" rounded-[50%] border-solid border-[rgba(255,255,255,0.11)] border-[0.29px] w-[69.74%] h-[69.74%] absolute right-[15.13%] left-[15.13%] bottom-[15.13%] top-[15.13%]"
      style={{ boxShadow: "inset 0px 0.58px 0.54px 0px rgba(0, 0, 0, 0.47)" }}
    ></div>
    
 
    
  
    
    <div className="rounded-[50%] border-dashed border-[rgba(180,113,9,0.24)] border-[2.03px] w-[76.32%] h-[76.32%] absolute right-[11.84%] left-[11.84%] bottom-[11.84%] top-[11.84%]"></div>

    
  </div>
</div>

        </div>
      </div>

     
    </>
  );
};

export default InfoComponent;
