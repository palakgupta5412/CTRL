import React from 'react';
import ReactDOM from 'react-dom/client';
import Roast from './components/Roast';
import './index.css';

const rootElement = document.createElement('div');
rootElement.id = 'ctrl-extension-root';
document.body.appendChild(rootElement);
const root = ReactDOM.createRoot(rootElement);

let checkInterval = null;
let currentVideoTitle = ""; // Keeps track so we don't spam the API

const showOverlay = () => {
  root.render(<React.StrictMode><Roast /></React.StrictMode>);
};

const hideOverlay = () => {
  root.render(null);
};

const runSmartBlocker = () => {
  chrome.storage.local.get(['studyMode'], (result) => {
    if (!result.studyMode) {
      // Study mode is OFF. Clear intervals and hide overlay.
      if (checkInterval) clearInterval(checkInterval);
      checkInterval = null;
      hideOverlay();
      return;
    }

    // Study mode is ON. Check the page every second.
    if (!checkInterval) {
      checkInterval = setInterval(() => {
        const url = window.location.href;

        // 1. Instant blocks (Shorts & Homepage)
        if (url.includes('/shorts/') ||  url === 'https://www.youtube.com/?') {
          showOverlay();
          currentVideoTitle = ""; // Reset title
          return;
        }

        // 2. Video Pages (Ask AI)
        if (url.includes('/watch')) {
          const titleElement = document.querySelector('h1.ytd-watch-metadata');
          
          if (titleElement && titleElement.innerText) {
            const newTitle = titleElement.innerText;
            
            // Only ask AI if we navigated to a NEW video
            if (newTitle !== currentVideoTitle) {
              currentVideoTitle = newTitle;
              console.log("Asking AI about:", currentVideoTitle);
              
              // Send title to background.js
              chrome.runtime.sendMessage(
                { action: "checkVideo", title: currentVideoTitle }, 
                (response) => {
                  if (response && response.isEducational) {
                    hideOverlay(); // It's a study video, let them watch!
                  } else {
                    showOverlay(); // Distraction! Slam the roast.
                  }
                }
              );
            }
          }
        }
      }, 1000);
    }
  });
};

// Start the loop
runSmartBlocker();

// Listen for the popup toggle
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.studyMode) {
    runSmartBlocker();
  }
});