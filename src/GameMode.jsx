// src/gameMode.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Alert from './components/Alert';
import './index.css';

// 1. SET UP THE REACT CONTAINER
const rootElement = document.createElement('div');
rootElement.id = 'ctrl-game-mode-root';
document.body.appendChild(rootElement);
const root = ReactDOM.createRoot(rootElement);

const showAlert = (message) => {
  root.render(
    <React.StrictMode>
      <Alert message={message} close={() => root.render(null)} />
    </React.StrictMode>
  );
};

// 2. LISTEN FOR STOLEN MESSAGES FROM HIJACK.JS
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CTRL_NOTIFICATION') {
    
    chrome.storage.local.get(['gameMode'], (result) => {
      if (result.gameMode) {
        
        const fullMessageText = `${event.data.title}: ${event.data.body}`;
        console.log("🎮 Intercepted Notification:", fullMessageText);
        
        // Ask the Groq AI Brain if it is urgent
        chrome.runtime.sendMessage(
          { action: "checkNotification", message: fullMessageText }, 
          (response) => {
            if (response && response.isUrgent) {
              showAlert(fullMessageText); 
            } else {
              console.log("🎮 AI ignored non-urgent message.");
            }
          }
        );
      }
    });
  }
});