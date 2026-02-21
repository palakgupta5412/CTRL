// src/background.js

// 1. Create a timer that ticks every 1 minute
chrome.alarms.create("analyticsHeartbeat", { periodInMinutes: 1 });

// 2. Set Chrome's idle detection to 60 seconds
chrome.idle.setDetectionInterval(60);

// 3. Listen for the timer tick
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "timeTracker") {
    
    // Check if the user touched the mouse/keyboard in the last 60 seconds
    chrome.idle.queryState(60, (state) => {
      if (state === "active") {
        
        // They are active! Now check which tab they are looking at
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            const currentTab = tabs[0];
            
            // Check if the URL contains our target study site
            if (currentTab.url && currentTab.url.includes("leetcode.com")) {
              
              // Add 1 minute to their stats in Chrome storage
              chrome.storage.local.get(["studyMinutes"], (result) => {
                let mins = result.studyMinutes || 0;
                chrome.storage.local.set({ studyMinutes: mins + 1 });
                console.log("Productive minute logged! Total:", mins + 1);
              });
              
            }
          }
        });
      }
    });
  }
});



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkVideo") {
    // Call the AI function and send the result back to YouTube
    evaluateWithAI(request.title).then(sendResponse);
    return true; // Tells Chrome we will send the response asynchronously
  }
});

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; 
// console.log("GROQ API Key:", GROQ_API_KEY);
// --- THE GLOBAL AI CONTENT SCANNER ---

async function analyzePageContent(pageText) {
  const prompt = `
    You are an aggressive productivity enforcer for a computer science student prepping for tech placements. 
    Analyze the following extracted webpage text. 
    
    Rule 1: If the text is about programming (Java, C++), Data Structures & Algorithms (DSA), competitive programming, web development (MERN stack), UI/UX design, or legitimate college research, or anything related to studies , online study help tools , online couses platform , anything that helps in studies , even the chatGPT and such AI tools or search engines, you must reply strictly with the word "ALLOW".
    Rule 2: If the text is about entertainment, gaming, celebrity gossip, mindless social media, or anything unrelated to tech placements, you must reply strictly with the word "BLOCK".
    
    Do not explain your reasoning. Reply ONLY with "ALLOW" or "BLOCK".
    
    Webpage Text: "${pageText.substring(0, 800)}"
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });
    
    const data = await response.json();
    
    // NEW: Check if Groq threw an error (like an invalid API key)
    // NEW: Stringify the error so it prints the exact reason in plain text!
    if (!data.choices || !data.choices[0]) {
      console.error("🚨 Groq API Error Message:", data.error?.message || JSON.stringify(data));
      return "ALLOW"; 
    }

    return data.choices[0].message.content.trim().toUpperCase();
  } catch (error) {
    console.error("AI Scanner Error:", error);
    return "ALLOW"; 
  }
}

// Listen for when a webpage finishes loading
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  
  if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
    return; 
  }

  // Only scan if Study Mode is active and the page is fully loaded
  const data = await chrome.storage.local.get(["studyMode", "endTime"]);
  const isLocked = !!data.endTime && data.endTime > Date.now();
  const isActive = isLocked || data.studyMode;

  if (changeInfo.status === 'complete' && tab.active && isActive) {
    
    // Inject a script to scrape the first chunks of readable text from the DOM
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Grab headers and paragraphs
        const elements = document.querySelectorAll('h1, h2, p');
        let text = "";
        elements.forEach(el => text += el.innerText + " ");
        return text.trim();
      }
    }, async (injectionResults) => {
      if (!injectionResults || !injectionResults[0].result) return;
      
      const pageText = injectionResults[0].result;
      if (pageText.length < 50) return; // Ignore blank pages
      
      console.log("🕵️ Scanning page context...");
      const verdict = await analyzePageContent(pageText);
      console.log("🤖 AI Verdict:", verdict);
      
      if (verdict.includes("BLOCK")) {
        // The AI caught you slacking. Inject the Roast Overlay!
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["assets/roast_injector.js"] // We will create this next!
        });
      }
    });
  }
});

async function evaluateWithAI(title) {

    const prompt = `You are a strict academic and career bouncer for an IT engineering student preparing for software placements. Your job is to classify if a YouTube video title is genuinely useful for their specific coursework and career, or if it is a distraction.
    Rule 1 (ALLOW): Answer YES if the video is about computer science, university math (e.g., Linear Algebra), programming, web development, tech career guidance, placement prep, or coding journeys/vlogs , anything related to studies of college , schools , basic concepts , studies , educational roadmaps.
    Rule 2 (BLOCK): Answer NO if the video is general knowledge, wildlife documentaries, history, movies, music, or gaming, EVEN IF it is highly "informative" or "educational. Block everything else that is not educational purpose video and not related to studies .  "
    Answer EXACTLY with the word 'YES' or 'NO' and nothing else. Title: "${title}"`;

  try {
    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Using Llama 3 for fast, smart classification
        messages: [{ role: "user", content: prompt }],
        temperature: 0 // Set to 0 so it stays strictly analytical and doesn't get creative
      })
    });
    
    const data = await response.json();
    
    // Catch any API limit or authentication errors
    if (data.error) {
      console.error("Groq API Error:", data.error.message);
      return { isEducational: true }; 
    }

    // Groq's response structure is slightly different from Gemini's
    const answer = data.choices[0].message.content.trim().toUpperCase();
    console.log(`🤖 Groq AI evaluated "${title}" -> AI Said: "${answer}"`);
    
    return { isEducational: answer.includes('YES') };
    
  } catch (error) {
    console.error("Fetch Request Failed:", error);
    return { isEducational: true }; 
  }
}


// --- GAME MODE NOTIFICATION CHECKER ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkVideo") {
    evaluateWithAI(request.title).then(sendResponse);
    return true; 
  }
  
  // NEW: Listen for incoming notifications
  if (request.action === "checkNotification") {
    evaluateNotification(request.message).then(sendResponse);
    return true;
  }
});

async function evaluateNotification(messageText) {
  const prompt = `You are an AI assistant for a gamer. They are in the middle of a focused gaming session. Evaluate if this incoming text message is URGENT and needs to interrupt their game.

  Rule 1 (URGENT): Answer YES if the message is about emergencies, parents/family needing them immediately (e.g., "dinner is ready", "come downstairs", "pick up the phone"), or urgent real-world deadlines.
  Rule 2 (IGNORE): Answer NO if the message is casual chat, group chat spam, memes, general gaming talk, or non-urgent conversation.

  Answer EXACTLY with the word 'YES' or 'NO' and nothing else. Message: "${messageText}"`;

  try {
    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0 
      })
    });
    
    const data = await response.json();
    if (data.error) return { isUrgent: true }; // If API fails, let the message through just in case

    const answer = data.choices[0].message.content.trim().toUpperCase();
    console.log(`🎮 Groq AI evaluated Notification "${messageText}" -> AI Said: "${answer}"`);
    
    return { isUrgent: answer.includes('YES') };
    
  } catch (error) {
    console.error("Fetch Request Failed:", error);
    return { isUrgent: true }; 
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "analyticsHeartbeat") {
    const now = Date.now();
    const data = await chrome.storage.local.get(["analytics", "lastPingTime", "activeTabDomain"]);
    const analytics = data.analytics || { websites: {}, idleTime: 0, roastCount: 0 };
    
    let timeSinceLastPing = 60; // Default to 60s for the very first run
    
    if (data.lastPingTime) {
      // Calculate exact seconds since the last heartbeat
      timeSinceLastPing = Math.floor((now - data.lastPingTime) / 1000);
    }
    
    // Check if the user is sitting in front of the computer right now
    chrome.idle.queryState(60, async (state) => {
      // If the computer went to sleep (huge gap) OR the user walked away (state === idle)
      if (state === "idle" || state === "locked" || timeSinceLastPing > 120) {
        analytics.idleTime = (analytics.idleTime || 0) + timeSinceLastPing;
      } else {
        // User is active! Log the time to the current website
        if (data.activeTabDomain) {
           analytics.websites[data.activeTabDomain] = (analytics.websites[data.activeTabDomain] || 0) + timeSinceLastPing;
        }
      }
      
      // Save data and reset the clock for the next minute
      await chrome.storage.local.set({ 
        analytics: analytics, 
        lastPingTime: now 
      });
    });
  }
});


// --- ANALYTICS & TRACKING ENGINE ---

let activeTabDomain = "";
let tabStartTime = Date.now();
let isIdle = false;
let idleStartTime = 0;

// Save the accumulated time to the database
const updateTimeSpent = async () => {
  if (!activeTabDomain || isIdle) return;
  const timeSpent = Math.floor((Date.now() - tabStartTime) / 1000); // in seconds
  if (timeSpent <= 0) return;

  const data = await chrome.storage.local.get(["analytics"]);
  const analytics = data.analytics || { websites: {}, idleTime: 0, roastCount: 0 };
  
  // Add the time to the specific domain
  analytics.websites[activeTabDomain] = (analytics.websites[activeTabDomain] || 0) + timeSpent;
  await chrome.storage.local.set({ analytics });
  
  tabStartTime = Date.now(); // Reset the clock
};

// 1. Detect when you switch tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    try { 
      const domain = new URL(tab.url).hostname;
      await chrome.storage.local.set({ activeTabDomain: domain });
    } catch(e){}
  }
});

// Update the active domain when a page finishes loading
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    if (tab.url) {
      try { 
        const domain = new URL(tab.url).hostname;
        await chrome.storage.local.set({ activeTabDomain: domain });
      } catch(e){}
    }
  }
});

// 3. Track when you walk away from the laptop (60 seconds of no mouse/keyboard movement)
chrome.idle.setDetectionInterval(60);
chrome.idle.onStateChanged.addListener(async (newState) => {
  if (newState === "idle" || newState === "locked") {
    await updateTimeSpent(); // Save the final active seconds
    isIdle = true;
    idleStartTime = Date.now();
  } else if (newState === "active") {
    // You came back! Log the idle time.
    if (isIdle && idleStartTime > 0) {
       const idleDuration = Math.floor((Date.now() - idleStartTime) / 1000);
       const data = await chrome.storage.local.get(["analytics"]);
       const analytics = data.analytics || { websites: {}, idleTime: 0, roastCount: 0 };
       analytics.idleTime = (analytics.idleTime || 0) + idleDuration;
       await chrome.storage.local.set({ analytics });
    }
    isIdle = false;
    tabStartTime = Date.now(); 
  }
});

// Listen for the Roast Overlay telling us you got distracted
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logRoast") {
    chrome.storage.local.get(["analytics"], (data) => {
       const analytics = data.analytics || { websites: {}, idleTime: 0, roastCount: 0 };
       analytics.roastCount = (analytics.roastCount || 0) + 1;
       chrome.storage.local.set({ analytics });
    });
  }
});

// const GEMINI_API_KEY = "AIzaSyBroRAj9giBtyPUhWrubl4-RNji7e9gv20" ;
// async function evaluateWithAI(title) {
//   // const prompt = `You are a strict productivity monitor for an IT student. Their focus is Java, Data Structures and Algorithms (DSA), LeetCode, and the MERN stack. Is the following YouTube video title highly relevant to their studies or coding? Answer exactly with the word 'YES' or 'NO' and nothing else. Title: "${title}"`;

//   const prompt = `You are a strict academic and career bouncer for an IT engineering student preparing for software placements. Your job is to classify if a YouTube video title is genuinely useful for their specific coursework and career, or if it is a distraction.

//   Rule 1 (ALLOW): Answer YES if the video is about computer science, university math (e.g., Linear Algebra), programming, web development, tech career guidance, placement prep, or coding journeys/vlogs , anything related to studies of college , schools , basic concepts , studies , educational roadmaps.
//   Rule 2 (BLOCK): Answer NO if the video is general knowledge, wildlife documentaries, history, movies, music, or gaming, EVEN IF it is highly "informative" or "educational. Block everything else that is not educational purpose video and not related to studies .  "

//   Answer EXACTLY with the word 'YES' or 'NO' and nothing else. Title: "${title}"`;

//   try {
//     // Upgraded to gemini-2.5-flash for better speed and reliability
//     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }]
//       })
//     });
    
//     const data = await response.json();
    
//     // Check if Google sent back an error (like an invalid API key)
//     if (data.error){
//       console.error("Google API Error:", data.error.message);
//       return { isEducational: true }; // Let the video play if the API breaks
//     }

//     // Clean up the response, convert to uppercase, and check if it INCLUDES "YES"
//     const answer = data.candidates[0].content.parts[0].text.trim().toUpperCase();
//     console.log(`🤖 AI evaluated "${title}" -> AI Said: "${answer}"`);
    
//     return { isEducational: answer.includes('YES') };
    
//   } catch (error) {
//     console.error("Fetch Request Failed:", error);
//     return { isEducational: true }; // Let the video play if the internet drops
//   }
// }