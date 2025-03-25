// In MainPage.jsx, add the import for the SpinResetTimer
import { useState, useEffect } from "react";
import { useUser } from "../hooks/UserProvider";
import { useUserStore } from "../hooks/UserStoreProvider";
import BackSheetModal from "../components/Main/BackSheetModal";
import Welcome from "../components/Main/Welcome";
import FinalInfo from "../components/Main/FinalInfo";
import SpinInfo from "../components/Main/SpinInfo";
import BottomNav from "../components/shared/NavBar";
import SpinWheel from "../components/Main/Spinner";
import { useTelegramWebApp } from "../hooks/TelegramProvider";
import InfoComponent from "../components/Main/Info";
import { getAvailableSpinCounts } from "../hooks/constants";
import HomeLayout from "./MainLayout";
import ResponsivePadding from "../components/shared/ResponsivePadding";
import { useTonConnectUI } from "@tonconnect/ui-react";
import AdComponent from "../components/shared/ShowAdsButton";
import SpinResetTimer from "../components/Main/SpinTimer";

const MainPage = () => {

  const { user } = useUser();

  
  // Timer format state - can be "seconds", "minutes", "hours", or "full"
  const [timerFormat, setTimerFormat] = useState("minutes");
  
  // Reset interval in milliseconds (1 minute default from your code)
  const resetInterval = 60 * 1000; // 1 minute in milliseconds
  // For 24 hours, use: const resetInterval = 24 * 60 * 60 * 1000;
  
 

  useEffect(() => {
    if (user) {
      console.log("Updated User Data:", user);
    }
  }, [user]);

 


  return (
    <>
      <HomeLayout>
        <ResponsivePadding>
          {/* Modal for tour guide */}
          <BackSheetModal isVisible={user?.first_time}>
            {user?.stateVariable === 1 && <Welcome />}
            {user?.stateVariable === 2 && <SpinInfo />}
            {user?.stateVariable === 3 && <FinalInfo />}
          </BackSheetModal>
        
          {/* Main Application */}
          <main className="fixed w-full top-0 left-0 min-h-screen bg-gradient-radial from-[#FAA31E] to-[#D72B29] flex flex-col justify-between">
            <img className="absolute -z-50 top-0 left-0 w-full h-full object-cover" src="/assets/homedesignscreen.webp" alt="Background" />
            
            {/* Top section */}
            <div className="flex-1">
              <InfoComponent />
          
              <div className="w-full flex flex-row justify-between items-start">
                {/* Left Navigation */}
                <div className="w-fit flex flex-col justify-between items-start p-[20px]">
              

                    <div className="bg-[#D72B29] p-1 ">
                      <div className="border border-white p-2">
                        <span className="text-white">Tasks</span>
                      </div>
                    </div>
                  
                
                  <div className="bg-[#D72B29] p-1 " style={{marginTop:"20px"}}>
                    <div className="border border-white p-2">
                      <span className="text-white">Referral</span>
                    </div>
                  </div>
                </div>
                
                {/* Right Status Counters */}
                <div className="w-fit flex flex-col justify-between items-end p-[20px]">
                  <div className="card w-fit flex px-4 mb-4 flex-row items-center bg-blue-600 rounded-md">
                    <img className="w-6 h-6 mr-2" src="/assets/diamond.png" alt="Diamonds" />
                    <span className="text-white flex h-full items-center py-2">{user?.gems}</span>
                  </div>
                  <div className="card w-fit flex px-4 mb-4 flex-row items-center bg-blue-600 rounded-md" style={{marginTop:"20px"}}>
                    <img className="w-6 h-6 mr-2" src="/assets/keys.png" alt="Keys" />
                    <span className="text-white flex h-full items-center py-2">{user?.t_keys}</span>
                  </div>
                  <div className="card w-fit px-4 py-1 flex flex-col items-center bg-blue-600 rounded-md" style={{marginTop:"20px"}}>
                    <div className="flex flex-row items-center">
                      <img className="w-6 h-6 mr-2" src="/assets/zap.png" alt="Spins" />
                      <span className="text-white w-full py-2">{getAvailableSpinCounts(user?.spin_count)}/3</span>
                    </div>

             
                    {/* Spin Reset Timer Component 
                    <SpinResetTimer 
  lastSpinTime={user?.last_spin} 
  resetInterval={resetInterval}
  format={timerFormat}
  spinCount={user?.spin_count} 
/>
*/}
                  </div>
                            
                <div className="card w-fit flex px-4 mb-4 flex-row items-center bg-blue-600 rounded-md" style={{marginTop:"20px"}}>
                    
                    <span className="text-white flex h-full items-center py-2">{user?.tms_points} TMS</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom section with spinner right above nav */}
            <div className="flex flex-col justify-end items-center w-full pb-4">
              <div className="pl-11 w-full flex justify-center">
                <SpinWheel />
              </div>
            </div>
          </main>

        </ResponsivePadding>
      </HomeLayout>
    </>
  );
};

export default MainPage;