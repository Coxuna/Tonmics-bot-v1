import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import App from './App';
import './index.scss';
import './index.css';
import { BrowserRouter } from "react-router";
import { TelegramProvider } from './hooks/TelegramProvider';
import { UserProvider } from './hooks/UserProvider';
import { UserStoreProvider } from './hooks/UserStoreProvider';

render(
  <BrowserRouter>
    <UserProvider>
      <TelegramProvider>
        <UserStoreProvider>
          <App />
        </UserStoreProvider>
      </TelegramProvider>
    </UserProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
