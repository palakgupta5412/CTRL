# 🛑 CTRL: Context-Aware AI Productivity Engine

![CTRL Demo](./demo.gif)

CTRL is a custom Manifest V3 Chrome Extension engineered for students. Instead of relying on hardcoded URL blacklists, CTRL dynamically scrapes DOM content and utilizes a live LLM (Groq LLaMA-3.1) to classify webpage context in milliseconds. 

If you try to read gaming news while you should be studying Data Structures & Algorithms, the AI Bouncer intercepts the page and violently forces you back to reality.

## 🚀 Technical Architecture
* **Frontend:** React, Tailwind CSS, Framer Motion (Emulated via CSS Keyframes for isolated DOM injection)
* **Backend Engine:** Chrome Extension API (Manifest V3), Chrome Scripting API, Chrome Alarms API
* **AI Integration:** Groq API (LLaMA-3.1-8b-instant) for real-time natural language classification.

## 🧠 Engineering Highlights
* **Stateless Telemetry:** Bypassed Chrome Manifest V3's aggressive 30-second service worker suspension by architecting a custom heartbeat engine using `chrome.alarms` to accurately track user idle time.
* **Context-Aware DOM Hijacking:** Injects custom JavaScript directly into `<all_urls>` to scrape `document.body.innerText`, classifying the user's current environment asynchronously without breaking browser performance.

## 💻 How to Install & Test Locally (Developer Mode)
Since this extension requires broad DOM permissions to scrape and classify text, it is not hosted on the public Chrome Web Store. You can install it directly from this source code:

1. Download or clone this repository: `git clone https://github.com/palakgupta5412/CTRL.git`
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Toggle **Developer mode** ON in the top right corner.
4. Click **Load unpacked** and select the `dist` folder from the cloned repository.
5. Create a `.env` file in the root directory and add your own Groq API key: `VITE_GROQ_API_KEY="your_key"`
6. Run `npm run build` to compile the final extension.

Turn on Study Mode and try to open Spotify. I dare you.