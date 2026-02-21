import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [studyMode, setStudyMode] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({ websites: {}, idleTime: 0, roastCount: 0 });
  
  const [duration, setDuration] = useState(25); 
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); 

  useEffect(() => {
    chrome.storage.local.get(['studyMode', 'gameMode', 'endTime', 'analytics'], (result) => {
      const isLocked = !!result.endTime && result.endTime > Date.now();
      setStudyMode(isLocked ? true : !!result.studyMode);
      setGameMode(isLocked ? false : !!result.gameMode);
      setEndTime(isLocked ? result.endTime : null);
      if (result.analytics) setStats(result.analytics);
    });
  }, []);

  useEffect(() => {
    let interval;
    if (endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const difference = Math.floor((endTime - now) / 1000);
        if (difference <= 0) {
          setTimeLeft(0);
          setEndTime(null);
          clearInterval(interval);
        } else {
          setTimeLeft(difference);
        }
      }, 1000);
    } else {
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [endTime]);

  const adjustTime = (amount) => {
    if (endTime) return; 
    setDuration((prev) => Math.max(1, Math.min(120, prev + amount))); 
  };

  const startDeepWork = () => {
    const targetEndTime = Date.now() + duration * 60 * 1000;
    setStudyMode(true);
    setGameMode(false);
    setEndTime(targetEndTime);
    chrome.storage.local.set({ studyMode: true, gameMode: false, endTime: targetEndTime });
    chrome.alarms.create("deepWorkTimer", { delayInMinutes: duration });
  };

  const formatTime = (seconds) => {
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const h = Math.floor(m / 60);
    if (h === 0) return `${m}m ${secs % 60}s`;
    return `${h}h ${m % 60}m`;
  };

  const isLocked = !!endTime;

  // Analytics Helpers
  const formatHours = (secs) => (secs / 3600).toFixed(1) + 'h';
  const topSites = Object.entries(stats.websites)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Get top 3 sites

  return (
    <div className="w-72 p-4 bg-zinc-950 text-white font-sans border border-zinc-800 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black text-red-500 tracking-tight">CTRL</h1>
        <div className="flex items-center gap-3">
          {isLocked && <span className="text-xs text-red-500 font-bold animate-pulse">LOCKED</span>}
          <button onClick={() => setShowStats(!showStats)} className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
            {showStats ? 'Controls' : 'Data'}
          </button>
        </div>
      </div>
      
      {showStats ? (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl mb-4 text-center">
             <h3 className="text-xs text-red-400 uppercase tracking-widest mb-1 font-bold">Distractions Blocked</h3>
             <p className="text-4xl font-black text-red-500">{stats.roastCount}</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-4 flex justify-between items-center">
             <span className="text-sm text-zinc-400 font-medium">Idle Time (AFK)</span>
             <span className="text-lg font-mono text-zinc-200">{formatHours(stats.idleTime)}</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-bold">Screen Time</h3>
            {topSites.map(([site, time]) => (
              <div key={site} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate w-32 text-zinc-300">{site}</span>
                  <span className="text-zinc-500 font-mono">{formatHours(time)}</span>
                </div>
                <div className="w-full bg-black rounded-full h-1.5 overflow-hidden">
                  <div className="bg-zinc-600 h-1.5 rounded-full" style={{ width: `${Math.min((time / 14400) * 100, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {/* Deep Work Timer Dashboard */}
          <div className={`p-4 rounded-xl border mb-6 transition-colors ${isLocked ? 'bg-red-950/30 border-red-900/50' : 'bg-black/50 border-zinc-800'}`}>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 text-center font-bold">Deep Work Timer</p>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => adjustTime(-5)} disabled={isLocked} className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full hover:bg-zinc-700 disabled:opacity-30 font-bold">-5</button>
              <div className="text-4xl font-light font-mono tracking-wider">{isLocked ? formatTime(timeLeft) : `${duration}:00`}</div>
              <button onClick={() => adjustTime(5)} disabled={isLocked} className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full hover:bg-zinc-700 disabled:opacity-30 font-bold">+5</button>
            </div>
            <button 
              onClick={startDeepWork} disabled={isLocked}
              className={`w-full py-3 rounded text-sm font-bold uppercase tracking-wider transition-all ${isLocked ? 'bg-red-900/50 text-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50'}`}
            >
              {isLocked ? 'Session Active' : 'Lock In'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={() => !isLocked && chrome.storage.local.set({ studyMode: !studyMode, gameMode: false })} disabled={isLocked}
              className={`py-3 rounded shadow-md text-sm font-semibold transition-all ${studyMode ? 'bg-red-600/90 hover:bg-red-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'} ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {studyMode && !isLocked ? 'Study Mode: ON' : 'Study Mode'}
            </button>
            <button onClick={() => !isLocked && chrome.storage.local.set({ gameMode: !gameMode, studyMode: false })} disabled={isLocked}
              className={`py-3 rounded shadow-md text-sm font-semibold transition-all ${gameMode ? 'bg-blue-600/90 hover:bg-blue-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'} ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {gameMode ? 'Game Mode: ON' : 'Game Mode'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;