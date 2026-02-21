// src/hijack.js

const originalNotification = window.Notification;

window.Notification = function(title, options) {
  // Steal the message and shout it into the void so our React app can hear it
  window.postMessage({ 
    type: 'CTRL_NOTIFICATION', 
    title: title, 
    body: options?.body || '' 
  }, '*');
  
  return {}; // Block the native popup
};

window.Notification.permission = originalNotification.permission;
window.Notification.requestPermission = originalNotification.requestPermission;