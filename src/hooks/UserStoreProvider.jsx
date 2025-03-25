
import React, { createContext, useContext, useState, useEffect } from "react";

// Create UserStore Context
export const UserStoreContext = createContext(null);

// UserStore Provider
export const UserStoreProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: "Fortune",
    id: 1000000,
    keys: 0,
    diamonds: 0,
    coins: 0,
    claimLevel: 1,
    spinsToday: 15,
    lastSpinnedTime: "",
    jestersToday: 3,
    firstTime: true,
    stateVariable: 1,
    auth_token: "",
    referralCode: "",
  });

  // Check and reset daily spins
  useEffect(() => {
    const checkDailySpins = () => {
      const now = new Date();
      const lastSpinned = new Date(userData.lastSpinnedTime);

      if (
        now.getDate() !== lastSpinned.getDate() ||
        now.getMonth() !== lastSpinned.getMonth() ||
        now.getFullYear() !== lastSpinned.getFullYear()
      ) {
        setUserData((prev) => ({
          ...prev,
          spinsToday: 15,
        }));
      }
    };

    checkDailySpins();
    const interval = setInterval(checkDailySpins, 3600000);

    return () => clearInterval(interval);
  }, [userData.lastSpinnedTime]);

  // Progress through tour stages
  const workWithTour = () => {
    setUserData((prev) => ({
      ...prev,
      stateVariable: prev.stateVariable + 1,
    }));
  };

  // End the tour
  const setFirstTime = (value) => {
    setUserData((prev) => ({
      ...prev,
      firstTime: value,
    }));
  };

  // Update user properties
  const updateUser = (key, value) => {
    setUserData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Decrement spin count and update last spin time
  const useSpin = () => {
    if (userData.spinsToday <= 0) return false;

    setUserData((prev) => ({
      ...prev,
      spinsToday: prev.spinsToday - 1,
      lastSpinnedTime: new Date().toISOString(),
    }));

    return true;
  };

  // Value object to be provided to consumers
  const value = {
    userData,
    workWithTour,
    setFirstTime,
    updateUser,
    useSpin,
  };

  return (
    <UserStoreContext.Provider value={value}>
      {children}
    </UserStoreContext.Provider>
  );
};

// Hook to use the store
export const useUserStore = () => {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error("useUserStore must be used within a UserStoreProvider");
  }
  return context;
};
