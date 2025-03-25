import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import App from './App';
import './index.scss';
import './index.css';
import { BrowserRouter } from "react-router-dom"; // Ensure correct import
import { TelegramProvider } from './hooks/TelegramProvider';
import { UserProvider } from './hooks/UserProvider';
import { UserStoreProvider } from './hooks/UserStoreProvider';

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
