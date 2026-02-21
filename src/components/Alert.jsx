import React from 'react';
import {motion} from 'framer-motion';

const Alert = ({ message, close }) => {
  return (
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-red-950/95 backdrop-blur-md font-sans text-white">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.6, duration: 0.6 }}
        className="max-w-2xl text-center p-8 border border-red-500 bg-red-900/50 rounded-2xl shadow-2xl shadow-red-600/50">
          <motion.h1 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-5xl font-black text-white mb-4 uppercase tracking-widest animate-pulse">
            URGENT MESSAGE
          </motion.h1>
          <p className="text-2xl text-red-200 mb-8 font-medium">
            "{message}"
          </p>
          <button 
            onClick={close} 
            className="px-8 py-4 bg-white text-red-900 font-bold rounded hover:bg-zinc-200 transition-colors"
          >
            Acknowledge & Close
          </button>
      </motion.div>
    </div>
  );
};

export default Alert;