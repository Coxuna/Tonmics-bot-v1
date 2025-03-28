import { useState, useEffect } from "react";
import { useUser } from "../hooks/UserProvider";
import { useUserStore } from "../hooks/UserStoreProvider";
import BackSheetModal from "../components/Main/BackSheetModal";
import Welcome from "../components/Main/Welcome";
import FinalInfo from "../components/Main/FinalInfo";
import SpinInfo from "../components/Main/SpinInfo";
import BottomNav from "../components/shared/NavBar";
import { useTelegramWebApp } from "../hooks/TelegramProvider";
import InfoComponent from "../components/Main/Info";
import { getAvailableSpinCounts } from "../hooks/constants";
import HomeLayout from "./MainLayout";
import ResponsivePadding from "../components/shared/ResponsivePadding";
import { useTonConnectUI } from "@tonconnect/ui-react";
import AdComponent from "../components/shared/ShowAdsButton";
import SpinTheWheel from "../components/Main/SpinWheel";
import ConnectButton from "../components/Main/TonConnectBtn";

const MainPage = () => {
  const { user } = useUser();
  const [tonConnectUI, setOptions] = useTonConnectUI();

  useEffect(() => {
    if (user) {
      console.log("Updated User Data:", user);
    }
  }, [user]);

  return (
    <>
      <HomeLayout>
        {/* Modal for tour guide */}
        <BackSheetModal isVisible={user?.first_time}>
          {user?.stateVariable === 1 && <Welcome />}
          {user?.stateVariable === 2 && <SpinInfo />}
          {user?.stateVariable === 3 && <FinalInfo />}
        </BackSheetModal>
        
        {/* Main Application */}
        <main className="fixed w-full top-0 left-0 min-h-screen bg-gradient-radial from-[#FAA31E] to-[#D72B29] flex flex-col">
          <img className="absolute -z-50 top-0 left-0 w-full h-full object-cover" src="/assets/homedesignscreen.webp" alt="Background" />
          
          {/* Top section with info and status */}
          <div className="flex-grow-0">
            <InfoComponent />
          
            <div className="w-full flex flex-row justify-between items-start">
              {/* Left Navigation */}
              <div className="w-fit flex flex-col justify-between items-start p-[5px]">
                <div className="bg-[#D72B29] p-[4px] mb-1">
                  <div className="border border-white p-1">
                    <span className="text-white text-sm">Tasks</span>
                  </div>
                </div>

                <div className="bg-[#D72B29] p-[4px] mb-1">
                  <div className="border border-white p-1">
                    <span className="text-white text-sm">Referral</span>
                  </div>
                </div>

                <ConnectButton/>
              </div>
              
              {/* Right Status Counters */}
              <div className="w-fit flex flex-col justify-between items-end p-[10px]">
                <div className="card w-fit flex px-4 mb-2 flex-row items-center bg-blue-600 rounded-md w-6 h-6" style={{marginBottom:'13px'}}>
                  <img className="w-6 h-6 mr-2" src="/assets/diamond.png" alt="Diamonds" />
                  <span className="text-white flex h-full items-center py-2">{user?.gems}</span>
                </div>
                <div className="card w-fit flex px-4 mb-2 flex-row items-center bg-blue-600 rounded-md w-7 h-7" style={{marginBottom:'13px'}}>
                  <img className="w-6 h-6 mr-2" src="/assets/keys.png" alt="Keys" />
                  <span className="text-white flex h-full items-center py-2">{user?.t_keys}</span>
                </div>
                <div className="card w-fit flex px-4 mb-2 flex-row items-center bg-blue-600 rounded-md w-7 h-7" style={{marginBottom:'13px'}}>
                  <img className="w-6 h-6 mr-2" src="/assets/zap.png" alt="Keys" />
                  <span className="text-white flex h-full items-center py-2">{getAvailableSpinCounts(user?.spin_count)}/3</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Spinner Section - Partially Hidden */}
          <div className="flex-grow flex flex-col justify-end items-center w-full px-4 pb-8">
            <div className="w-full max-w-md relative">
            <div className="absolute -top-58 short:-top-40 medium:-top-50 tall:-top-90 left-0 right-0">
   <SpinTheWheel/>
</div>
            </div>
          </div>
        </main>
      </HomeLayout>
    </>
  );
};

export default MainPage;