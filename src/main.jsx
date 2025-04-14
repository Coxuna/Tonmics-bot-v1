import './polyfills'
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import App from './App';
import './index.scss';
import './index.css';
import { BrowserRouter } from "react-router-dom"; // Ensure correct import
import { TelegramProvider } from './hooks/TelegramProvider';
import { UserProvider } from './hooks/UserProvider';
import { UserStoreProvider } from './hooks/UserStoreProvider';
import TelegramAnalytics from "@telegram-apps/analytics";


TelegramAnalytics.init({
  token: "eyJhcHBfbmFtZSI6IlRvbm1pY3NfTWluaWFwcCIsImFwcF91cmwiOiJodHRwczovL3QubWUvdG9ubWljc2JvdC90b25taWNzYXBwIiwiYXBwX2RvbWFpbiI6Imh0dHBzOi8vdG9ubWljcy5uZXRsaWZ5LmFwcCJ9!TO3WZIbb7H5NmR3+u0d/BLxewZPjU2AhQD6WQwM0OOA=", 
  appName: "Tonmics_Miniapp", 
});


// Get the root element
const rootElement = document.getElementById('root');

// Create a root and render the app
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      
            <BrowserRouter>
                <UserProvider>
                    <TelegramProvider>
                        <UserStoreProvider>
                            <App />
                        </UserStoreProvider>
                    </TelegramProvider>
                </UserProvider>
            </BrowserRouter>
      
    );
}
