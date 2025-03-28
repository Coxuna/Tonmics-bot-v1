import { createContext, useContext, useState } from "react";

// Create User Context
const UserContext = createContext(null);

// Custom Hook to use User Context
export const useUser = () => useContext(UserContext);

// Provider Component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to Fetch User Data
    const fetchUser = async (user_name, telegram_id) => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/getUser?user_name=${user_name}&telegram_id=${telegram_id}`);
            const data = await response.json();
            
            if (response.ok) {
                setUser({
                    id: data.id,
                    t_keys: data.t_keys,
                    gems: data.gems,
                    tms_points: data.tms_points,
                    referral_code: data.referral_code,
                    name: data.name,
                    user_name: data.user_name,
                    telegram_id: data.telegram_id,
                    profile_image: data.profile_image,
                    spin_count: data.spin_count,
                    hint_count: data.hint_count,
                    shuffle_count: data.shuffle_count,
                    last_hint: data.last_hint,
                    last_shuffle: data.last_shuffle,
                    last_spin: data.last_spin,
                    last_claim: data.last_claim,
                    first_time: data.is_first_time,
                    farming_stage: data.farming_stage,
                    farming_start_time: data.farming_start_time ,
                    farming_time_remaining : data.farming_time_remaining,
                    accumulated_amount: data.accumulated_amount ,
                    last_farming_update: data.last_farming_update,
                    stateVariable: 1 // Added for tour state tracking
                });
            } else {
                console.error("User not found:", data.message);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to Create User
    const createUser = async (userData) => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/createUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            console.log("Create User Response:", data);

            if (response.ok) {
                setUser({
                    id: data.id,
                    t_keys: data.t_keys,
                    gems: data.gems,
                    tms_points: data.tms_points,
                    referral_code: data.referral_code,
                    name: data.name,
                    user_name: data.user_name,
                    telegram_id: data.telegram_id,
                    profile_image: data.profile_image,
                    spin_count: data.spin_count,
                    hint_count: data.hint_count,
                    shuffle_count: data.shuffle_count,
                    last_hint: data.last_hint,
                    last_shuffle: data.last_shuffle,
                    last_spin: data.last_spin,
                    last_claim: data.last_claim,
                    first_time: data.is_first_time,
                    farming_stage: data.farming_stage,
                 farming_start_time: data.farming_start_time ,
                   farming_time_remaining : data.farming_time_remaining,
                   accumulated_amount: data.accumulated_amount ,
                   last_farming_update: data.last_farming_update,
                    stateVariable: 1 // Added for tour state tracking
                })
            } else {
                console.error("Error creating user:", data.message);
            }
        } catch (error) {
            console.error("Error creating user:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to Check if User Exists
    const checkUserExists = async (telegram_id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-exists?telegram_id=${telegram_id}`);
            const data = await response.json();
            console.log(data.exists);
            return data.exists; // Returns true or false
        } catch (error) {
            console.error("Error checking user existence:", error);
            return false;
        }
    };

    // Function to Update User Data
    const updateUser = async (telegram_id, updatedData) => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/updateUser/${telegram_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();
           
            if (response.ok) {
                setUser(data.user);
            } else {
                console.error("Error updating user:", data.message);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setLoading(false);
        }
    };

    // Tour functions migrated from UserStoreProvider
    const workWithTour = () => {
        if (!user) return;
        
        setUser((prevUser) => ({
            ...prevUser,
            stateVariable: prevUser.stateVariable + 1
        }));
    };

    const setFirstTime = (value) => {
        if (!user) return;
        
        // Update local state
        setUser((prevUser) => ({
            ...prevUser,
            first_time: value
        }));
        
        // Update database
        if (user.telegram_id) {
            updateUser(user.telegram_id, { is_first_time: value ? 1 : 0 });
        }
    };

    // Spin function migrated from UserStoreProvider
    const useSpin = () => {
        if (!user || user.spin_count <= 0) return false;
        
        const now = new Date().toISOString();
        
        // Update local state
        setUser((prevUser) => ({
            ...prevUser,
            spin_count: prevUser.spin_count - 1,
            last_spin: now
        }));
        
        // Update database
        if (user.telegram_id) {
            updateUser(user.telegram_id, { 
                spin_count: user.spin_count - 1,
                last_spin: now
            });
        }
        
        return true;
    };

    // Check and reset daily spins
    const checkDailySpins = () => {
        if (!user || !user.last_spin) return;
        
        const now = new Date();
        const lastSpin = new Date(user.last_spin);
        
        // Check if it's a new day
        if (
            now.getDate() !== lastSpin.getDate() ||
            now.getMonth() !== lastSpin.getMonth() ||
            now.getFullYear() !== lastSpin.getFullYear()
        ) {
            // Reset spins to 15
            setUser((prevUser) => ({
                ...prevUser,
                spin_count: 15
            }));
            
            // Update database
            if (user.telegram_id) {
                updateUser(user.telegram_id, { spin_count: 15 });
            }
        }
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            createUser, 
            checkUserExists, 
            fetchUser, 
            loading, 
            updateUser,
            // New tour and spin functions
            workWithTour,
            setFirstTime,
            useSpin,
            checkDailySpins
        }}>
            {children}
        </UserContext.Provider>
    );
};