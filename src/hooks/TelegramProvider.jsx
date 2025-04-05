
import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserProvider";
// Create Telegram context
const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const [initData, setInitData] = useState('');
  const [userId, setUserId] = useState('');
  const [initError, setInitError] = useState(null);
  const [initProgress, setInitProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { user, fetchUser, createUser, checkUserExists, updateUser } = useUser();

  useEffect(() => {
    const initWebApp = async () => {
      try {
        // Start progress at 10%
        setInitProgress(10);
        
        // Check if we're in the Telegram Web App environment
        if (typeof window !== 'undefined') {
          setInitProgress(20);
          
          // Try to import the Telegram Web App SDK
          try {
            setInitProgress(30);
            const WebApp = (await import('@twa-dev/sdk')).default;
            WebApp.ready();
            
            setInitProgress(40);
            console.log("Init Data:", WebApp.initData);
            setInitData(WebApp.initData);
            
            setInitProgress(50);
            if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
              const telegramUserId = WebApp.initDataUnsafe.user.id.toString();
              setUserId(telegramUserId);
              console.log("User ID from Telegram:", telegramUserId);
              
              setInitProgress(60);
              const userData = {
                name: WebApp.initDataUnsafe.user.first_name,
                user_name: WebApp.initDataUnsafe.user.username || `user_${telegramUserId}`, // Fallback if username is not availablle
                profile_image: "",
                telegram_id: telegramUserId,
              };
              
              setInitProgress(70);
              // Check if user exists in your database
              const userExists = await checkUserExists(telegramUserId);
              
              setInitProgress(80);
              if (userExists) {
                // User exists, fetch their data
                console.log("User exists, fetching data...");
                await fetchUser(userData.user_name, telegramUserId);
             
              } else {
                // User doesn't exist, create new user
                console.log("User doesn't exist, creating new user...");
              const user_code = await createUser(userData);
              if (user_code) {
                const userReferralCode = `REF-${user_code}`;
                await updateUser(telegramUserId, { 
                  referral_code: userReferralCode 
                });
              }
                await fetchUser(userData.user_name, telegramUserId);
              }
              setInitProgress(100);
            } else {
              console.warn("No user data in initDataUnsafe");
              await handleNonTelegramUser();
              setInitProgress(100);
            }
          } catch (error) {
            // Not in Telegram environment or SDK failed to load
            console.log("Not in Telegram environment or SDK failed:", error);
            await handleNonTelegramUser();
            setInitProgress(100);
          }
        } else {
          // Not in browser environment
          console.log("Not in browser environment");
          await handleNonTelegramUser();
          setInitProgress(100);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        setInitError(error.message);
        await handleNonTelegramUser();
        setInitProgress(100);
      } finally {
        setIsInitializing(false);
      }
    };

    initWebApp();
  }, []);

  // Helper function to handle users in non-Telegram environment
  const handleNonTelegramUser = async () => {
    // Get telegram ID from localStorage if possible
    const localUserId = 123456;
    const user_name = "Guest";
    
    
    // Check if this user exists
    const userExists = await checkUserExists(localUserId);
    
    if (userExists) {
      // User exists, fetch their data
      await fetchUser(user_name, localUserId);
     
   
    } else {
      // Create a new user
      const defaultUserData = {
        name: "Guest User",
        user_name: "Guest",
        referral_code: generateReferralCode(),
        profile_image: "/assets/default-profile.png",
        telegram_id: localUserId,
      };
      
      await createUser(defaultUserData);
      await fetchUser(user_name, localUserId);
    }
  };

  const generateReferralCode = () => { 
    const randomNum = Math.floor(100 + Math.random() * 900); // Generates a 3-digit random number (100-999)
    return `REF-${randomNum}`;
};
  // Log updated user data when it changes
  useEffect(() => {
    if (user) {
      console.log("Updated User Data:", user);
    }
  }, [user]);

  const value = {
    initData,
    userId,
    initError,
    initProgress,
    isInitializing,
    user
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

// Hook to use the Telegram context
export function useTelegramWebApp() {
  const context = useContext(TelegramContext);
  if (context === null) {
    throw new Error("useTelegramWebApp must be used within a TelegramProvider");
  }
  return context;
}