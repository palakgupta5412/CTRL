// src/components/RoastOverlay.jsx
import React, { useEffect } from 'react';
import { useState } from 'react';
import {motion} from 'framer-motion';

//
const ROASTS = [
  {
    title: "Are you lost?",
    body: "Scrolling YouTube won't magically solve that LeetCode Hard. Close the tab and get back to work."
  },
  {
    title: "Path Not Found",
    body: "You can't even find the shortest path to closing this tab, let alone implement a graph algorithm in an interview."
  },
  {
    title: "Placement Reality Check",
    body: "The recruiters won't care about your YouTube watch history or how many tech vloggers you follow. Shut it down."
  },
  {
    title: "UI Over Logic?",
    body: "Adding smooth CSS animations to your side project won't save you if you fail the technical round. Go practice your DSA."
  },
  {
    title: "Degree Error 404",
    body: "Your degree loading... Error: Focus not found. Shut down the entertainment and boot up your IDE."
  },
  {
    title: "Carried by Teammates?",
    body: "Your group project teammates are probably out-coding you right now. Don't be the weak link."
  },
  {
    title: "The Tutorial Mirage",
    body: "Watching another 4-hour web dev tutorial is just productive procrastination. Writing actual code is what matters. Close the tab."
  },
  {
    title: "Resume Padding",
    body: "Adding 'Hackathon Participant' to your resume doesn't excuse you from the daily grind. Get back to the terminal."
  },
  {
    title: "Algorithm Atrophy",
    body: "Every minute you spend here is a minute someone else is mastering dynamic programming. Don't get left behind."
  },
  {
    title: "Wake Up.",
    body: "No one is going to hand you a high-paying tech job just for existing. Get back to the grind."
  }
];

const Roast = () => {

  const [currentRoast, setCurrentRoast] = useState(ROASTS[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ROASTS.length);
    setCurrentRoast(ROASTS[randomIndex]);

    chrome.runtime.sendMessage({ action: "logRoast" });
  })
  return (
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md font-sans text-white">
      <motion.div 
        initial={{ y: -100, opacity: 0, scale: 0.8, rotateX: 20 }}
        animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, mass: 1.5 }}
        className="max-w-3xl text-center p-8 border border-red-900 bg-black/50 rounded-2xl shadow-2xl shadow-red-900/20">
        <h1 className="text-6xl font-black text-red-600 mb-6 tracking-tighter uppercase">
          {currentRoast.title}
        </h1>
        <p className="text-2xl text-zinc-300 mb-8 font-light leading-relaxed">
          {currentRoast.body}
        </p>
        <button 
          onClick={() => window.location.href = 'https://leetcode.com'} 
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-lg transition-colors"
        >
          Face Reality and Code
        </button>
      </motion.div>
    </div>
  );
};

export default Roast;