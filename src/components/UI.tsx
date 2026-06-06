/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { Users, Trophy, Play, Clock, Info, ListOrdered, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minimize2, Maximize2, Settings, Volume2, VolumeX, Check, Sparkles } from 'lucide-react';
import { audio } from '../utils/audio';

// Supported plushie types
const PLUSHIE_TYPES = [
  { id: 'shima_enaga', name: '長尾山雀', emoji: '🐦' },
  { id: 'bear', name: '溫柔小熊', emoji: '🧸' },
  { id: 'bunny', name: '乖乖兔子', emoji: '🐰' },
  { id: 'cat', name: '傲驕橘貓', emoji: '🐱' },
  { id: 'duck', name: '呆萌小鴨', emoji: '🐤' },
];

export const UI = () => {
  const { connected, players, queue, activePlayer, turnEndTime, myId, join, joinQueue, gameOver } = useGameStore();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const [showSettings, setShowSettings] = useState(false);
  const [bgmOn, setBgmOn] = useState(audio.bgmEnabled);
  const [sfxOn, setSfxOn] = useState(audio.sfxEnabled);
  const [gameDuration, setGameDuration] = useState(() => {
    try {
      const savedSecs = localStorage.getItem('shima_game_duration');
      if (savedSecs) return parseInt(savedSecs, 10);
    } catch (e) {}
    return 60; // default 60s
  });

  const [selectedPlushies, setSelectedPlushies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shima_selected_plushies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return ['shima_enaga', 'bear', 'bunny', 'cat', 'duck'];
  });

  const handleTogglePlushie = (id: string, isSingle: boolean) => {
    let next: string[];
    if (isSingle) {
      next = [id];
    } else {
      if (selectedPlushies.includes(id)) {
        if (selectedPlushies.length > 1) {
          next = selectedPlushies.filter(x => x !== id);
        } else {
          next = [id]; // Keep at least one
        }
      } else {
        next = [...selectedPlushies, id];
      }
    }
    setSelectedPlushies(next);
    localStorage.setItem('shima_selected_plushies', JSON.stringify(next));
    audio.playClickSFX();
  };

  const handleToggleBgm = () => {
    const nextVal = !bgmOn;
    setBgmOn(nextVal);
    audio.setBgm(nextVal);
    audio.playClickSFX();
  };

  const handleToggleSfx = () => {
    const nextVal = !sfxOn;
    setSfxOn(nextVal);
    audio.setSfx(nextVal);
    audio.playClickSFX();
  };

  const handleChangeDuration = (seconds: number) => {
    setGameDuration(seconds);
    localStorage.setItem('shima_game_duration', String(seconds));
    audio.playClickSFX();
  };

  // Auto play BGM when connected
  useEffect(() => {
    if (connected) {
      audio.startBGM();
    }
    return () => {
      audio.stopBGM();
    };
  }, [connected]);

  const DISALLOW_LIST = new Set([
    'ASS', 'CUM', 'FAG', 'FUK', 'FUQ', 'GAY', 'JEW', 'JIZ', 'KKK', 'SEX', 'TIT', 'VAG', 'WAP', 'WTF', 'WTG', 'DIK', 'COK', 'FUC', 'FUX', 'NIG', 'NGR', 'BCH', 'BIT', 'HOE', 'SLT', 'CUN', 'KYS'
  ]);

  // Generate a friendly, cute random name on connect automatically (supports case sensitive letters up to 15 chars)
  useEffect(() => {
    if (connected && myId && !players[myId]) {
      const prefixes = ['Cuddly', 'Happy', 'Gentle', 'Silky', 'Ducky', 'Naughty', 'Lively', 'Cozy', 'Sunny', 'Fluffy', 'Sleepy', 'Tiny', 'Shiny', 'Dandy'];
      const suffixes = ['Bird', 'Bear', 'Bunny', 'Cat', 'Duck', 'Panda', 'Pup', 'Kitten', 'Deer', 'Fox', 'Koala', 'Owl', 'Chick', 'Swan'];
      let autoName = '';
      do {
        const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
        autoName = pre + suf;
        // Trim if somehow extremely long, but max is ~12-13 chars
        if (autoName.length > 15) {
          autoName = autoName.slice(0, 15);
        }
      } while (DISALLOW_LIST.has(autoName.toUpperCase()));
      join(autoName);
    }
  }, [connected, myId, players, join]);

  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard' | 'legend' | 'settings'>('play');
  const [pressedDirs, setPressedDirs] = useState({ w: false, a: false, s: false, d: false });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const me = players[myId || ''];
  const isActive = activePlayer === myId && myId !== null;

  const [gameOverName, setGameOverName] = useState('');

  useEffect(() => {
    if (gameOver && me) {
      setGameOverName(me.name || '');
    }
  }, [gameOver, me]);

  const handleStartMove = (dir: 'w' | 's' | 'a' | 'd') => {
    setPressedDirs(prev => ({ ...prev, [dir]: true }));
    window.dispatchEvent(new CustomEvent('claw_move_start', { detail: dir }));
  };

  const handleEndMove = (dir: 'w' | 's' | 'a' | 'd') => {
    setPressedDirs(prev => ({ ...prev, [dir]: false }));
    window.dispatchEvent(new CustomEvent('claw_move_end', { detail: dir }));
  };

  const handleDrop = () => {
    window.dispatchEvent(new CustomEvent('force_drop'));
  };

  useEffect(() => {
    if (!isActive) return;
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleDrop();
      }
      if (key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        setPressedDirs(prev => ({ ...prev, w: true }));
      }
      if (key === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        setPressedDirs(prev => ({ ...prev, s: true }));
      }
      if (key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setPressedDirs(prev => ({ ...prev, a: true }));
      }
      if (key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault();
        setPressedDirs(prev => ({ ...prev, d: true }));
      }
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') setPressedDirs(prev => ({ ...prev, w: false }));
      if (key === 's' || e.key === 'ArrowDown') setPressedDirs(prev => ({ ...prev, s: false }));
      if (key === 'a' || e.key === 'ArrowLeft') setPressedDirs(prev => ({ ...prev, a: false }));
      if (key === 'd' || e.key === 'ArrowRight') setPressedDirs(prev => ({ ...prev, d: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [isActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activePlayer && turnEndTime) {
        setTimeLeft(Math.max(0, Math.ceil((turnEndTime - Date.now()) / 1000)));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activePlayer, turnEndTime]);

  if (!connected) {
    return <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white font-mono">Connecting to Arcade...</div>;
  }

  if (!me) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 text-white font-sans font-black text-xl tracking-wider">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-white animate-spin"></div>
          <div>進入夾夾樂世界中...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ============================================== */}
      {/* A. MOBILE / PORTRAIT / PHONE LAYOUT (PRESERVED) */}
      {/* ============================================== */}
      <div className="md:hidden sm:landscape:hidden absolute inset-0 pointer-events-none p-3 xs:p-4 sm:p-6 flex flex-col justify-between font-sans">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl sm:rounded-3xl p-3 sm:p-5 pointer-events-auto w-auto max-w-[155px] xs:max-w-[170px] sm:max-w-none sm:w-80 border border-gray-100 flex flex-col justify-center">
            <div className="flex justify-between items-center gap-2">
              <div>
                <h1 className="text-sm xs:text-base sm:text-xl font-black text-[#4285F4] tracking-tight leading-tight">夾夾樂</h1>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-bold">
                  {isActive ? <><span className="hidden xs:inline">Current </span>Score</> : <><span className="hidden xs:inline">High </span>Score</>}
                </div>
                <div className="text-base xs:text-lg sm:text-2xl font-black text-[#34A853] leading-none">{isActive ? (me.currentScore || 0) : me.score}</div>
              </div>
            </div>
          </div>

          {/* Right Panel (Consolidated & Collapsible) */}
          {isCollapsed ? (
            <div className="flex items-center gap-1.5 xs:gap-2 pointer-events-auto scale-90 sm:scale-100 origin-top-right">
              {activePlayer && (
                <div 
                  className="bg-white/95 backdrop-blur-md shadow-md border border-red-100 rounded-full px-3 py-2 sm:px-4 sm:py-3.5 flex items-center gap-1 sm:gap-1.5 font-sans font-black text-[#EA4335] text-xs sm:text-sm"
                  title="剩餘時間"
                >
                  <Clock size={14} className="text-[#EA4335] animate-spin sm:w-4 sm:h-4" style={{ animationDuration: '6s' }} />
                  <span>{timeLeft}s</span>
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(false)}
                className="bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl border border-gray-200/60 rounded-full px-4 py-2 sm:px-5 sm:py-3.5 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 text-gray-700 font-bold text-xs sm:text-sm"
                title="開啟控制與排行榜"
              >
                <Trophy size={16} className="text-[#FBBC04] sm:w-4.5 sm:h-4.5" />
                <span className="hidden xs:inline">開啟控制面板</span>
                <span className="xs:hidden">開啟</span>
                <Maximize2 size={12} className="text-gray-400 ml-0.5 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl sm:rounded-3xl p-3 sm:p-5 w-[155px] xs:w-[172px] sm:w-80 pointer-events-auto border border-gray-100 flex flex-col max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] relative">
              {/* Collapse toggle button */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                title="收合面板"
              >
                <Minimize2 size={14} className="sm:w-4 sm:h-4" />
              </button>
              
              {/* Tabs & Settings */}
              <div className="flex gap-1 mb-3 bg-gray-100/50 p-0.5 sm:p-1 rounded-xl mr-6 sm:mr-7">
                <button 
                  onClick={() => setActiveTab('play')}
                  className={`flex-1 py-1 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center ${activeTab === 'play' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  title="遊戲主頁 Play"
                >
                  <Play size={12} className={`sm:w-3.5 sm:h-3.5 ${activeTab === 'play' ? 'text-[#4285F4]' : ''}`} />
                </button>
                <button 
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex-1 py-1 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center ${activeTab === 'leaderboard' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  title="排行榜 Leaderboard"
                >
                  <Trophy size={12} className={`sm:w-3.5 sm:h-3.5 ${activeTab === 'leaderboard' ? 'text-[#FBBC04]' : ''}`} />
                </button>
                <button 
                  onClick={() => setActiveTab('legend')}
                  className={`flex-1 py-1 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center ${activeTab === 'legend' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  title="遊戲玩法 Info"
                >
                  <Info size={12} className={`sm:w-3.5 sm:h-3.5 ${activeTab === 'legend' ? 'text-[#34A853]' : ''}`} />
                </button>
                <button 
                  onClick={() => { audio.playClickSFX(); setShowSettings(true); }}
                  className="flex-1 py-1 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center text-gray-400 hover:text-gray-650 hover:bg-white/40"
                  title="遊戲設定 Settings"
                >
                  <Settings size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto min-h-[140px] sm:min-h-[200px]">
                {activeTab === 'leaderboard' && (
                  <div className="space-y-1.5 sm:space-y-3">
                    {Object.values(players).sort((a: any, b: any) => b.score - a.score).slice(0, 10).map((p: any, i) => (
                      <div key={p.id} className="flex justify-between items-center text-[10px] sm:text-sm">
                        <span className="font-bold flex items-center gap-1 sm:gap-2 truncate mr-1" style={{ color: p.color }}>
                          <span className="text-gray-400 text-[9px] sm:text-xs w-3 sm:w-4 shrink-0">{i+1}.</span> 
                          <span className="truncate">{p.name}</span>
                          {p.id === myId && <span className="text-[8px] sm:text-[10px] bg-gray-105 text-gray-500 px-1 sm:px-2 py-0.5 rounded-full shrink-0">YOU</span>}
                        </span>
                        <span className="font-bold text-gray-900 shrink-0">{p.score}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'play' && (
                  <div className="flex flex-col h-full">
                    {activePlayer ? (
                      <div className="mb-2 sm:mb-4 p-2 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex-1 flex flex-col items-center justify-center">
                        <div className="text-[9px] sm:text-xs text-gray-400 sm:text-gray-500 mb-1 sm:mb-2 font-bold uppercase tracking-widest whitespace-nowrap">Game in Progress</div>
                        <div className="font-black text-3xl sm:text-5xl text-[#4285F4] mb-1 sm:mb-2">{timeLeft}s</div>
                        <div className="text-[10px] sm:text-sm font-medium text-gray-500 sm:text-gray-600 mb-2 sm:mb-4 text-center leading-tight">Grab as many birds as you can!</div>
                        <div className="bg-white/80 px-2 py-1 select-none text-[8px] sm:text-xs font-bold text-gray-400 sm:text-gray-500 border border-blue-100 rounded-lg text-center leading-tight">
                          WASD to move • SPACE to drop
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 text-center">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                          <Clock size={20} className="text-gray-400 sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="text-xs sm:text-lg font-black text-gray-900 mb-1 sm:mb-2">Ready to Play?</h3>
                        <p className="text-[10px] sm:text-sm text-gray-500 mb-3 sm:mb-6 font-medium leading-tight">You have {gameDuration} seconds to grab as many prizes as possible.</p>
                        <button 
                          onClick={() => { audio.playClickSFX(); joinQueue(gameDuration, selectedPlushies); }}
                          className="w-full bg-[#4285F4] text-white font-bold py-2 sm:py-4 rounded-lg sm:rounded-xl hover:bg-[#3367D6] hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-base cursor-pointer"
                        >
                          <Play size={12} className="sm:w-5 sm:h-5" fill="currentColor" /> Start Game
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'legend' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">娃娃款式 (Plushie Perks)</h2>
                      <div className="space-y-1.5 text-[10px] sm:text-xs font-medium text-gray-700">
                        <div className="text-amber-500 font-bold flex items-center gap-1 sm:gap-2">
                          👑 <strong>Giant King</strong>: <span className="bg-amber-50 px-1 py-0.5 rounded text-gray-900 border border-amber-200 ml-0.5 text-[8px] sm:text-[10px]">100 pts</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          🎀 <strong>Scarf</strong>: <span className="text-gray-900 font-bold ml-0.5">x3 Multiplier</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          🎧 <strong>Earmuffs</strong>: <span className="text-gray-900 font-bold ml-0.5">x2 Multiplier</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          🍞 <strong>Chubby</strong>: <span className="text-gray-900 font-bold ml-0.5">x1 Multiplier</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">配件基礎分 (Color Points)</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 sm:gap-y-2 gap-x-1 text-[10px] sm:text-xs font-medium text-gray-700">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FBBC04] shadow-sm shrink-0"></div> Gold: 50</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#EA4335] shadow-sm shrink-0"></div> Ruby: 40</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#34A853] shadow-sm shrink-0"></div> Emerald: 30</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E37400] shadow-sm shrink-0"></div> Amber: 20</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#9AA0A6] shadow-sm shrink-0"></div> Slate: 10</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Touch Controller Overlay (Anchored at the bottom) */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-end pointer-events-none gap-4 mt-auto">
          {/* Left Side: Empty block */}
          <div className="hidden sm:block"></div>

          {/* Center/Right Hand Side: Touch controls for mobile player */}
          {isActive ? (
            <div className="mx-auto sm:mx-0 bg-white/95 backdrop-blur-md shadow-2xl p-2.5 xs:p-3 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 flex items-center justify-between gap-4 xs:gap-6 sm:gap-10 pointer-events-auto select-none w-full sm:w-auto max-w-[280px] xs:max-w-[310px] sm:max-w-md scale-95 sm:scale-100 origin-bottom">
              {/* Elegant D-pad for sliding crane */}
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial">
                <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">CLAW MOVEMENT</span>
                <div className="grid grid-cols-3 gap-1 w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32">
                  <div></div>
                  <button
                    onMouseDown={() => handleStartMove('w')}
                    onMouseUp={() => handleEndMove('w')}
                    onMouseLeave={() => handleEndMove('w')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('w'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('w'); }}
                    className={`w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all border border-gray-200/80 shadow-xs cursor-pointer ${pressedDirs.w ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100/80 active:bg-gray-100'}`}
                  >
                    <ArrowUp size={14} className={`sm:w-4.5 sm:h-4.5 ${pressedDirs.w ? 'animate-pulse' : ''}`} />
                  </button>
                  <div></div>

                  <button
                    onMouseDown={() => handleStartMove('a')}
                    onMouseUp={() => handleEndMove('a')}
                    onMouseLeave={() => handleEndMove('a')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('a'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('a'); }}
                    className={`w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all border border-gray-200/80 shadow-xs cursor-pointer ${pressedDirs.a ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100/80 active:bg-gray-100'}`}
                  >
                    <ArrowLeft size={14} className={`sm:w-4.5 sm:h-4.5 ${pressedDirs.a ? 'animate-pulse' : ''}`} />
                  </button>
                  <div className="w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100/60 flex items-center justify-center text-gray-400 text-[8px] xs:text-[10px] font-bold select-none">🕹️</div>
                  <button
                    onMouseDown={() => handleStartMove('d')}
                    onMouseUp={() => handleEndMove('d')}
                    onMouseLeave={() => handleEndMove('d')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('d'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('d'); }}
                    className={`w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all border border-gray-200/80 shadow-xs cursor-pointer ${pressedDirs.d ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100/80 active:bg-gray-100'}`}
                  >
                    <ArrowRight size={14} className={`sm:w-4.5 sm:h-4.5 ${pressedDirs.d ? 'animate-pulse' : ''}`} />
                  </button>

                  <div></div>
                  <button
                    onMouseDown={() => handleStartMove('s')}
                    onMouseUp={() => handleEndMove('s')}
                    onMouseLeave={() => handleEndMove('s')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('s'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('s'); }}
                    className={`w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all border border-gray-200/80 shadow-xs cursor-pointer ${pressedDirs.s ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100/80 active:bg-gray-100'}`}
                  >
                    <ArrowDown size={14} className={`sm:w-4.5 sm:h-4.5 ${pressedDirs.s ? 'animate-pulse' : ''}`} />
                  </button>
                  <div></div>
                </div>
              </div>

              {/* Arcade Style tactile DROP button */}
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 font-sans">
                <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">LAUNCH CLAW</span>
                <button
                  onClick={handleDrop}
                  className="w-15 h-15 xs:w-18 xs:h-18 sm:w-24 sm:h-24 bg-[#EA4335] text-white rounded-full font-black text-xs sm:text-base flex flex-col items-center justify-center shadow-[0_4px_0_0_#b31412] sm:shadow-[0_8px_0_0_#b31412] active:translate-y-0.5 sm:active:translate-y-1 active:shadow-[0_2px_0_0_#b31412] sm:active:shadow-[0_3px_0_0_#b31412] hover:bg-[#ff4f3d] transition-all cursor-pointer select-none"
                >
                  <div className="text-white text-xs xs:text-sm sm:text-lg font-black tracking-widest drop-shadow-sm">DROP</div>
                  <div className="text-[7px] xs:text-[8px] sm:text-[9px] font-bold text-red-100 tracking-wider">TAP</div>
                </button>
              </div>
            </div>
          ) : activePlayer ? (
            <div className="bg-white/95 backdrop-blur-md shadow-lg p-3 rounded-2xl border border-gray-100 pointer-events-auto flex items-center gap-2 scale-90 sm:scale-100 origin-bottom-right">
              <div className="w-2 h-2 rounded-full bg-[#FBBC04] animate-pulse"></div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
                👀 Spectating live game
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* ======================================================= */}
      {/* B. COMPUTER (DESKTOP) & TABLET LANDSCAPE VIEWPORT COCKPIT */}
      {/* ======================================================= */}
      {/* 1. LEFT-SIDE IMMERSIVE FLIGHT HUDS OVERLAY */}
      <div className="hidden md:flex sm:landscape:flex absolute left-6 top-6 bottom-6 right-[380px] lg:right-[430px] pointer-events-none flex-col justify-between z-10">
        {/* Upper Grid Layer */}
        <div className="flex justify-between items-start w-full">
          {/* Main Pilot HUD Plate */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-2xl p-4 pointer-events-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#34A853] flex items-center justify-center text-xl shadow-inner shadow-white/50 select-none animate-bounce" style={{ animationDuration: '3s' }}>🐦</div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-widest flex items-center gap-2 font-sans">
                夾夾樂
              </h1>
            </div>
          </div>


        </div>

        {/* Lower Grid Layer: Controller Manuals & spectator badges */}
        <div className="w-full flex justify-between items-end">
          {activePlayer && !isActive && (
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 font-bold text-xs text-slate-600 pointer-events-auto flex items-center gap-2.5 shadow-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FBBC04] animate-pulse"></div>
              <span>👀 正在旁觀對手 <strong className="text-orange-500 font-black">{players[activePlayer]?.name || '---'}</strong> 施展抓取特技！</span>
            </div>
          )}

          {/* Buffer alignment child */}
          <div></div>
        </div>
      </div>

      {/* 2. DOCKED PREMIUM SIDEBAR CONSOLE OVERLAY */}
      <div className="hidden md:flex sm:landscape:flex absolute right-0 top-0 bottom-0 w-[360px] lg:w-[410px] bg-slate-50/95 border-l border-white/60 shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex-col justify-between pointer-events-auto text-slate-800 p-5 font-sans overflow-hidden select-none z-10 backdrop-blur-lg">
        {/* Terminal Header */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-black text-[#4285F4] tracking-widest bg-[#4285F4]/10 px-2.5 py-1 rounded-full border border-[#4285F4]/20">
              遊戲控制台
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-400 tracking-wider">主機已連線</span>
            </div>
          </div>

          {/* Simple User Card */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg bg-blue-50 text-[#4285F4] border border-blue-200 shrink-0 uppercase">
                {me.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-[10px] text-slate-500 font-extrabold tracking-wide">玩家名稱</p>
                <p className="text-sm font-black text-slate-800 truncate mt-0.5">{me.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-extrabold tracking-wide">當前排名</p>
              <p className="text-sm font-bold text-orange-500 mt-0.5">
                #{Object.values(players).sort((a: any, b: any) => b.score - a.score).findIndex(p => p.id === myId) + 1} / {Object.keys(players).length}
              </p>
            </div>
          </div>

          {/* Quick tab controllers */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/50 rounded-xl border border-slate-200">
            {[
              { id: 'play', label: '大廳', icon: Play },
              { id: 'leaderboard', label: '排行', icon: Trophy },
              { id: 'legend', label: '圖鑑', icon: Sparkles },
              { id: 'settings', label: '設定', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    audio.playClickSFX();
                    setActiveTab(tab.id as any);
                  }}
                  className={`py-3 rounded-lg text-xs font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${isSelected ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Icon size={18} className={isSelected ? 'text-[#4285F4]' : ''} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Content Scroller */}
        <div className="flex-1 my-4 overflow-y-auto pr-1 flex flex-col justify-between custom-scrollbar min-h-0">
          
          {/* A. Play Tab View */}
          {activeTab === 'play' && (
            <div className="flex flex-col flex-1 justify-center gap-4 w-full h-full">
              {activePlayer ? (
                /* Active Mode HUD inside sidebar */
                <div className="flex flex-col items-center bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex-1 justify-center gap-3">
                  <div className="text-[9px] text-red-500 font-black tracking-widest uppercase animate-pulse">⏰ GAME COUNTDOWN TIME</div>
                  
                  {/* Countdown Progress */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200 mt-1">
                    <div 
                      className="bg-gradient-to-r from-red-500 via-amber-500 to-[#34A853] h-full transition-all" 
                      style={{ width: `${Math.min(100, (timeLeft / gameDuration) * 100)}%` }}
                    />
                  </div>
                  
                  <div className="text-4xl font-extrabold text-slate-800 font-mono tracking-wider">{timeLeft} <span className="text-xs font-bold text-slate-400">SECONDS LEFT</span></div>

                  {/* Interactive Status message */}
                  <div className="space-y-1 text-center font-bold text-[10px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-normal">
                    <p>🕹️ • 抓取階段：使用下方虛擬控制器控盤，</p>
                    <p className="mt-1">或者在鍵盤上進行靈活操作！</p>
                  </div>
                </div>
              ) : (
                /* Idle Play/Coin-Op Trigger Room */
                <div className="flex flex-col flex-1 justify-center items-center p-3 text-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-3xl shadow-sm animate-pulse">
                    🪙
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">準備開始</h3>
                  </div>

                  {/* Quick seconds picker inside Sidebar */}
                  <div className="w-full space-y-2 text-left mt-1">
                    <span className="text-[10px] text-[#4285F4] font-black uppercase tracking-widest pl-1 block">⏱️ 遊戲時間</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[30, 60, 90, 120].map((secs) => (
                        <button
                          key={secs}
                          onClick={() => handleChangeDuration(secs)}
                          className={`py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${gameDuration === secs ? 'bg-[#4285F4] border-[#4285F4] text-white shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                        >
                          {secs}秒
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => { audio.playClickSFX(); joinQueue(gameDuration, selectedPlushies); }}
                    className="w-full bg-[#34A853] hover:bg-[#2c8d45] text-white font-mono font-black py-4 rounded-2xl shadow-lg shadow-[#34A853]/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer border-t border-white/10 pointer-events-auto mt-2"
                  >
                    <Play size={16} fill="currentColor" /> 開始遊戲
                  </button>
                </div>
              )}
            </div>
          )}

          {/* B. Leaderboard Tab View */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-3 w-full">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">🏆 實時全服英雄榜 (TOP PLAYERS)</div>
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-0.5 custom-scrollbar">
                {Object.values(players)
                  .sort((a: any, b: any) => b.score - a.score)
                  .slice(0, 15)
                  .map((p: any, i) => {
                    const isTopThree = i < 3;
                    const rankMedal = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                    return (
                      <div 
                        key={p.id} 
                        className={`flex justify-between items-center p-2 rounded-xl transition-all border ${p.id === myId ? 'bg-[#4285F4]/10 border-[#4285F4]/30' : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900'}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs font-bold w-4 shrink-0 text-gray-500">
                            {rankMedal || `${i + 1}.`}
                          </span>
                          <span className="font-extrabold truncate" style={{ color: p.color }}>
                            {p.name}
                          </span>
                          {p.id === myId && (
                            <span className="text-[8px] font-black bg-slate-800 text-gray-300 px-1.5 py-0.5 rounded border border-slate-700 uppercase shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <span className="font-black text-sm text-gray-200 shrink-0 uppercase tracking-wide">
                          {p.score} <span className="text-[9px] text-gray-400 font-bold">pts</span>
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* C. Legend / Multipliers Tab View */}
          {activeTab === 'legend' && (
            <div className="space-y-4 w-full text-left">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">🎁 珍藏娃娃與款式加成</span>
                <div className="space-y-2.5 bg-slate-900/50 p-3 rounded-2xl border border-slate-850">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-black">
                    <span className="flex items-center gap-2">👑 巨型黃金款 (Giant King)</span>
                    <span className="bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 text-[10px]">100 Pts</span>
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div className="space-y-1.5 text-xs text-slate-300 font-medium">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">🎀 圍巾配戴款 (Scarf Variant)</span>
                      <span className="font-bold text-white">x3 倍率</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">🎧 護耳防寒款 (Earmuffs Variant)</span>
                      <span className="font-bold text-white">x2 倍率</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">🍞 基礎普通款 (Chubby Shape)</span>
                      <span className="font-bold text-gray-400">x1 倍率</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">🎨 底座顏色積分基礎 (Color Base Scores)</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { color: '#FBBC04', name: '黃金款', score: 50 },
                    { color: '#EA4335', name: '紅寶石款', score: 40 },
                    { color: '#34A853', name: '翡翠款', score: 30 },
                    { color: '#E37400', name: '琥珀款', score: 20 },
                    { color: '#9AA0A6', name: '岩盤款', score: 10 }
                  ].map((chip) => (
                    <div key={chip.color} className="flex items-center gap-2 bg-slate-900/40 border border-slate-850/85 p-2 rounded-xl text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: chip.color }} />
                      <div className="truncate">
                        <p className="text-[10px] text-gray-400 font-bold truncate leading-none">{chip.name}</p>
                        <p className="text-xs font-black text-white mt-1 font-mono">{chip.score} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* D. Settings Tab View */}
          {activeTab === 'settings' && (
            <div className="space-y-4 w-full text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">⚙️ 主機控制與音效 (MODULE CONFIG)</span>
              
              <div className="space-y-2.5">
                {/* BGM Selector */}
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    {bgmOn ? <Volume2 size={16} className="text-[#4285F4]" /> : <VolumeX size={16} className="text-slate-400" />}
                    <span className="text-xs font-semibold text-slate-700">背景音樂 (BGM)</span>
                  </div>
                  <button
                    onClick={handleToggleBgm}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${bgmOn ? 'bg-[#34A853]' : 'bg-slate-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-all ${bgmOn ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* SFX Selector */}
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    {sfxOn ? <Volume2 size={16} className="text-[#4285F4]" /> : <VolumeX size={16} className="text-slate-400" />}
                    <span className="text-xs font-semibold text-slate-700">遊戲音效 (SFX)</span>
                  </div>
                  <button
                    onClick={handleToggleSfx}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${sfxOn ? 'bg-[#34A853]' : 'bg-slate-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-all ${sfxOn ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Plushie Customizer selector inside the side settings view! */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-2">🧸 自訂娃娃種類 (PLUSHIE CHOICE)</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5 custom-scrollbar">
                  {PLUSHIE_TYPES.map((toy) => {
                    const isChecked = selectedPlushies.includes(toy.id);
                    return (
                      <div key={toy.id} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{toy.emoji}</span>
                          <span className="text-xs font-bold text-slate-700">{toy.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTogglePlushie(toy.id, true)}
                            className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide border transition-all ${isChecked && selectedPlushies.length === 1 && selectedPlushies[0] === toy.id ? 'bg-[#4285F4]/10 border-[#4285F4]/30 text-[#4285F4]' : 'bg-slate-50 border-slate-200 text-slate-500 cursor-pointer hover:bg-slate-100'}`}
                          >
                            單選
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePlushie(toy.id, false)}
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${isChecked ? 'bg-[#34A853] text-white border-[#34A853]' : 'bg-slate-50 text-transparent border-slate-200 hover:border-slate-300'}`}
                          >
                            {isChecked ? <Check size={12} className="stroke-[3]" /> : ''}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Arcade Deck Footer Controls */}
        <div className="border-t border-slate-200/80 pt-4 flex flex-col gap-3">
          {isActive ? (
            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center block font-mono">TACTILE CONTROLLER INTEGRATION</span>
              
              <div className="flex items-center justify-between gap-4">
                {/* Embedded Joystick D-Pad */}
                <div className="grid grid-cols-3 gap-1 h-32 w-32 shrink-0">
                  <div />
                  <button
                    onMouseDown={() => handleStartMove('w')}
                    onMouseUp={() => handleEndMove('w')}
                    onMouseLeave={() => handleEndMove('w')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('w'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('w'); }}
                    className={`rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${pressedDirs.w ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                  >
                    <ArrowUp size={16} />
                    <span className="text-[7px] font-black text-slate-500 font-mono">W / UP</span>
                  </button>
                  <div />

                  <button
                    onMouseDown={() => handleStartMove('a')}
                    onMouseUp={() => handleEndMove('a')}
                    onMouseLeave={() => handleEndMove('a')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('a'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('a'); }}
                    className={`rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${pressedDirs.a ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                  >
                    <ArrowLeft size={16} />
                    <span className="text-[7px] font-black text-slate-500 font-mono">A / L</span>
                  </button>
                  <div className="rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-200 select-none shadow-inner">🕹️</div>
                  <button
                    onMouseDown={() => handleStartMove('d')}
                    onMouseUp={() => handleEndMove('d')}
                    onMouseLeave={() => handleEndMove('d')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('d'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('d'); }}
                    className={`rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${pressedDirs.d ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                  >
                    <ArrowRight size={16} />
                    <span className="text-[7px] font-black text-slate-500 font-mono">D / R</span>
                  </button>

                  <div />
                  <button
                    onMouseDown={() => handleStartMove('s')}
                    onMouseUp={() => handleEndMove('s')}
                    onMouseLeave={() => handleEndMove('s')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('s'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('s'); }}
                    className={`rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${pressedDirs.s ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                  >
                    <ArrowDown size={16} />
                    <span className="text-[7px] font-black text-slate-500 font-mono">S / DN</span>
                  </button>
                  <div />
                </div>

                {/* Massive launch trigger button */}
                <div className="flex-1 flex flex-col items-center justify-center py-2 gap-1.5 font-sans">
                  <button
                    onClick={handleDrop}
                    className="w-24 h-24 bg-[#EA4335] text-white rounded-full font-black text-base flex flex-col items-center justify-center shadow-[0_6px_0_0_#b31412] active:translate-y-1 active:shadow-[0_2px_0_0_#b31412] hover:bg-[#ff4f3d] transition-all cursor-pointer select-none border-t border-white/20"
                  >
                    <span className="text-lg font-black tracking-widest font-sans drop-shadow">DROP</span>
                    <span className="text-[8px] text-red-100 font-extrabold tracking-wider font-mono">SPACE BAR</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Spectator details footer */
            <div className="bg-slate-100/50 p-3 rounded-xl border border-slate-200/80 flex justify-between items-center text-[10px] text-slate-500 font-mono select-none shadow-sm">
              <span>🖥️ 鍵盤控制已綁定，隨時適用</span>
              <span>SYSTEM: ONLINE (v2.4)</span>
            </div>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center border border-gray-100 mx-4">
            <h2 className="text-5xl font-black mb-1 text-gray-900 tracking-tight">
              TIME'S UP!
            </h2>
            <p className="text-lg text-gray-600 mb-5 font-medium">
              You scored <span className="font-bold text-[#34A853]">{gameOver.winner?.currentScore || 0}</span> points!
            </p>

            {/* Retro Arcade Initials Name Input Option */}
            <div className="bg-[#4285F4]/5 border border-[#4285F4]/10 rounded-2xl p-4 mb-5 text-left">
              <label className="block text-xs font-black text-[#4285F4] uppercase tracking-wider mb-2 font-sans flex items-center gap-1.5">
                <span>✍️</span> 登錄排行榜大名 (NAME CHANGER)
              </label>
              <input
                type="text"
                maxLength={15}
                value={gameOverName}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z]/g, '');
                  setGameOverName(val);
                }}
                placeholder="輸入英文姓名 (如: Abigail)"
                className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-[#4285F4]/20 rounded-xl font-mono text-center font-black text-xl focus:outline-none focus:border-[#4285F4] tracking-wider placeholder-gray-300"
              />
              <p className="text-[10px] text-gray-400 mt-2 font-medium leading-normal">
                提示：姓名可輸入 1 至 15 碼大小寫英文字母。可以直接保留、修改或留空並按下下方按鈕繼續。
              </p>
            </div>
            
            <div className="space-y-2 mb-6 text-left bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">當局排行 (Session Leaderboard)</div>
              {gameOver.players.slice(0, 5).map((p: any, i: number) => (
                <div key={p.id} className="flex justify-between items-center p-2 rounded-xl hover:bg-white transition-colors">
                  <span className="font-bold flex items-center gap-3" style={{ color: p.color }}>
                    <span className="text-gray-400 text-sm">{i + 1}.</span> 
                    {p.name} {p.id === myId ? <span className="text-[10px] uppercase font-bold bg-gray-200 px-2 py-0.5 rounded-full text-gray-600 ml-1">You</span> : ''}
                  </span>
                  <span className="text-gray-900 font-black">{p.score}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => {
                audio.playClickSFX();
                if (gameOverName.trim().length >= 1 && gameOverName.trim().length <= 15) {
                  join(gameOverName.trim());
                }
                useGameStore.setState({ gameOver: null });
              }}
              className="w-full py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all active:scale-[0.98] cursor-pointer"
            >
              Close & Keep Playing
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl max-w-sm w-full border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 font-sans">
                <Settings className="text-[#4285F4]" /> 遊戲設定
              </h3>
              <button 
                onClick={() => { audio.playClickSFX(); setShowSettings(false); }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer"
              >
                關閉
              </button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-6 pr-1 custom-scrollbar">
              {/* BGM Toggle */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100/80">
                <div className="flex items-center gap-2">
                  {bgmOn ? <Volume2 size={18} className="text-[#4285F4]" /> : <VolumeX size={18} className="text-gray-400" />}
                  <span className="text-sm font-bold text-gray-700">背景音樂 (BGM)</span>
                </div>
                <button
                  onClick={handleToggleBgm}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${bgmOn ? 'bg-[#34A853]' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all ${bgmOn ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* SFX Toggle */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100/80">
                <div className="flex items-center gap-2">
                  {sfxOn ? <Volume2 size={18} className="text-[#4285F4]" /> : <VolumeX size={18} className="text-gray-400" />}
                  <span className="text-sm font-bold text-gray-700">遊戲音效 (SFX)</span>
                </div>
                <button
                  onClick={handleToggleSfx}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${sfxOn ? 'bg-[#34A853]' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all ${sfxOn ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Game Duration Selector */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/80 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#EA4335]" />
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">設定遊戲秒數 (Duration)</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 120].map((secs) => (
                    <button
                      key={secs}
                      onClick={() => handleChangeDuration(secs)}
                      className={`py-2 text-xs font-extrabold rounded-xl transition-all border cursor-pointer ${gameDuration === secs ? 'bg-[#4285F4] border-[#4285F4] text-white font-sans font-black' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 font-sans font-black'}`}
                    >
                      {secs}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Plushie Customization Selector */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/80 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#FBBC04]" />
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">選擇娃娃種類 (Plushie Choice)</span>
                </div>
                <div className="space-y-2">
                  {PLUSHIE_TYPES.map((toy) => {
                    const isChecked = selectedPlushies.includes(toy.id);
                    return (
                      <div key={toy.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100/80 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{toy.emoji}</span>
                          <span className="text-sm font-semibold text-gray-700">{toy.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePlushie(toy.id, true)}
                            className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wide border transition-all ${isChecked && selectedPlushies.length === 1 && selectedPlushies[0] === toy.id ? 'bg-[#4285F4] text-white border-[#4285F4]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100 cursor-pointer'}`}
                          >
                            單選
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePlushie(toy.id, false)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all cursor-pointer ${isChecked ? 'bg-[#34A853] text-white border-[#34A853]' : 'bg-white text-transparent border-gray-200 hover:border-gray-300'}`}
                          >
                            {isChecked ? <Check size={14} className="stroke-[3]" /> : <span className="text-transparent">✓</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] text-gray-400 font-medium leading-normal bg-white p-2.5 rounded-xl border border-solid border-gray-100">
                  💡 說明：點「單選」可快速只夾一款；勾選（複選）多款時將會隨機混合在爪機中。
                </div>
              </div>
            </div>

            <button 
              onClick={() => { audio.playClickSFX(); setShowSettings(false); }}
              className="w-full bg-[#4285F4] text-white font-bold py-3.5 rounded-full hover:bg-[#3367D6] transition-all text-sm shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              確認設定
            </button>
          </div>
        </div>
      )}
    </>
  );
};
