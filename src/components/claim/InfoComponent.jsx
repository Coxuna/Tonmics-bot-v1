import React from "react";
import { useUser } from "../../hooks/UserProvider";

const InfoComponent = () => {
  const { user } = useUser();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-row justify-between w-full p-2 bg-white border-b-4 border-black shadow-md">
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
          >
            {user?.user_name?.charAt(0)}
          </div>
        </div>

        {/* Full Username */}
        <span className="text-[30px] font-medium">{user?.user_name}</span>
      </div>

      {/* Token Info */}
      <div className="rounded-xl text-white w-[45%] flex items-center justify-center h-10">
        <div className="shrink-0 w-[82px] h-[29.1px] relative">
          <div className="bg-[#262626] rounded-[15px] w-[92.74px] h-[23.52px] absolute left-[9.26px] top-[5.29px]"></div>

          <div className="text-[#ffffff] text-left font-normal absolute left-[42px] top-[5.55px] w-[21.16px] h-[19.84px]">
            {user?.tms_points}
          </div>

          <div className="w-[31.1px] h-[33.1px] absolute left-0 top-0">
            <img
              className="w-[100%] h-[100%] absolute right-[0%] left-[0%] bottom-[0%] top-[0%] overflow-visible"
              src="/assets/tokken.png"
              alt="Token Icon"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoComponent;