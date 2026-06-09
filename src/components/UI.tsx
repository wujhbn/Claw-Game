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
  const [gameDuration, setGameDuration] = useState(60);

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
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFEAF0] to-[#FFF9E6] z-50 p-6 text-[#FF5D8F] select-none text-center">
        <div className="text-7xl animate-bounce mb-3">🪄</div>
        <div className="text-2xl font-black tracking-wider animate-pulse flex items-center gap-2">
          <span>萌萌選物機</span>
        </div>
        <div className="text-sm text-pink-500 font-bold mt-3 bg-white/70 border border-pink-200 rounded-full px-5 py-2 shadow-sm">
          🌟 努力連線中，請等一下下喔...
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFEAF0] to-[#FFF9E6] z-50 p-6 text-[#FF5D8F] select-none text-center">
        <div className="text-7xl animate-spin mb-3" style={{ animationDuration: '4s' }}>🍬</div>
        <div className="text-2xl font-black tracking-wider animate-pulse">載入夢幻選物機世界中</div>
        <div className="text-sm text-pink-500 font-bold mt-3 bg-white/70 border border-pink-200 rounded-full px-5 py-2 shadow-sm">
          🐾 馬上就要開始囉！好期待呀...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ============================================== */}
      {/* A. UNIVERSAL RESPONSIVE LAYOUT (ALL DEVICES)   */}
      {/* ============================================== */}
      <div className="absolute inset-0 pointer-events-none p-3 xs:p-4 sm:p-6 flex flex-col justify-between font-sans z-10">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <div className="bg-[#FFFDF6]/95 backdrop-blur-md shadow-[0_3px_0_0_#F5ECC6] border-2 border-[#FFE5A3] rounded-full px-4 sm:px-5 h-10 sm:h-[46px] pointer-events-auto flex items-center gap-3 font-sans">
            <span className="font-black text-[#FF5D8F] text-sm sm:text-base flex items-center gap-1.5">
              選物機
            </span>
            <div className="flex items-center gap-1.5 flex-1 justify-end">
               <span className="text-[10px] sm:text-[11px] text-[#FF8A9A] font-extrabold uppercase">
                 分數
               </span>
               <span className="font-black text-[#FF5D8F] text-[15px] sm:text-[18px] leading-tight">
                 {isActive ? (me.currentScore || 0) : me.score}
               </span>
            </div>
          </div>

          {/* Right Panel (Consolidated & Collapsible) */}
          {isCollapsed ? (
            <div className="flex items-center gap-1.5 xs:gap-2 pointer-events-auto origin-top-right">
              {activePlayer && (
                <div 
                  className="bg-[#FFFDF6]/95 backdrop-blur-md border border-[#FFCCD5] shadow-[0_3px_0_0_#FFE5E9] rounded-full px-3 sm:px-4 h-10 sm:h-[46px] flex items-center gap-1 sm:gap-1.5 font-sans font-black text-[#FF5D8F] text-xs sm:text-sm"
                  title="剩餘時間"
                >
                  <span>{timeLeft} 秒</span>
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(false)}
                className="bg-[#FFFDF6]/95 backdrop-blur-md shadow-[0_3px_0_0_#F5ECC6] border-2 border-[#FFE5A3] rounded-full px-4 sm:px-5 h-10 sm:h-[46px] flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 text-amber-900 font-bold text-xs sm:text-sm"
                title="開啟控制與排行榜"
              >
                <span className="font-black text-[#B09980] tracking-wide">展開</span>
                <Maximize2 size={12} className="text-[#FF8A9A] ml-0.5 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-[#FFFDF6]/95 backdrop-blur-md shadow-lg rounded-[28px] p-3 sm:p-5 w-[155px] xs:w-[172px] sm:w-80 pointer-events-auto border-4 border-[#F7DBA7] flex flex-col max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] relative">
              {/* Collapse toggle button */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 text-amber-600 hover:text-amber-800 p-1.5 hover:bg-[#FAF3E5] rounded-full cursor-pointer transition-colors"
                title="收合面板"
              >
                <Minimize2 size={14} className="sm:w-4 sm:h-4" />
              </button>
              
              {/* Tabs & Settings */}
              <div className="flex gap-1 mb-3 bg-[#FAF3E5] p-1 rounded-2xl mr-6 sm:mr-7 border border-[#EED7B5]">
                <button 
                  onClick={() => { audio.playClickSFX(); setActiveTab('play'); }}
                  className={`flex-1 py-1.5 text-[10px] sm:text-sm font-black rounded-xl transition-all flex items-center justify-center ${activeTab === 'play' ? 'bg-[#FF8A9A] text-white shadow-md' : 'text-[#B09980] hover:bg-white/40'}`}
                  title="遊戲主頁 Play"
                >
                  <Play size={12} className="sm:w-3.5 sm:h-3.5" fill="currentColor" />
                </button>
                <button 
                  onClick={() => { audio.playClickSFX(); setActiveTab('leaderboard'); }}
                  className={`flex-1 py-1.5 text-[10px] sm:text-sm font-black rounded-xl transition-all flex items-center justify-center ${activeTab === 'leaderboard' ? 'bg-[#FFE5A3] text-amber-950 shadow-md border border-[#F1D487]' : 'text-[#B09980] hover:bg-white/40'}`}
                  title="排行榜 Leaderboard"
                >
                  <Trophy size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <button 
                  onClick={() => { audio.playClickSFX(); setActiveTab('legend'); }}
                  className={`flex-1 py-1.5 text-[10px] sm:text-sm font-black rounded-xl transition-all flex items-center justify-center ${activeTab === 'legend' ? 'bg-[#C5E8B4] text-emerald-950 shadow-md border border-[#A6D592]' : 'text-[#B09980] hover:bg-white/40'}`}
                  title="遊戲玩法 Info"
                >
                  <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <button 
                  onClick={() => { audio.playClickSFX(); setShowSettings(true); }}
                  className="flex-1 py-1.5 text-[10px] sm:text-sm font-black rounded-xl transition-all flex items-center justify-center text-[#B09980] hover:bg-white/40"
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
                      <div key={p.id} className="flex justify-between items-center text-[11px] sm:text-sm">
                        <span className="font-bold flex items-center gap-1 sm:gap-2 truncate mr-1" style={{ color: p.color }}>
                          <span className="text-pink-300 text-[10px] sm:text-xs w-3 sm:w-4 shrink-0 font-black">{i+1}.</span> 
                          <span className="truncate font-black">{p.name}</span>
                          {p.id === myId && <span className="text-[8px] sm:text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full shrink-0 font-bold ml-1">YOU</span>}
                        </span>
                        <span className="font-black text-rose-600 shrink-0">{p.score} 分</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'play' && (
                  <div className="flex flex-col h-full">
                    {activePlayer ? (
                      <div className="mb-2 sm:mb-4 p-2 sm:p-4 bg-rose-55/60 rounded-[18px] border-2 border-pink-200 flex-1 flex flex-col items-center justify-center">
                        <div className="text-[10px] sm:text-xs text-rose-500 mb-1 lg:mb-2 font-black tracking-wider whitespace-nowrap">挑戰進行中</div>
                        <div className="font-black text-3xl sm:text-5xl text-[#FF497C] mb-1 sm:mb-2 animate-pulse">{timeLeft} 秒</div>
                        <div className="text-[10px] sm:text-sm font-bold text-rose-400 mb-2 sm:mb-4 text-center leading-tight">盡可能抓起更多可愛的鳥雀吧！</div>
                        <div className="bg-[#FFFDF6] px-2.5 py-1 text-[8px] sm:text-xs font-black text-amber-800 border border-amber-200 rounded-lg text-center leading-tight">
                          WASD 鍵盤移動 • 空白鍵下爪
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 text-center">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[#FFF2F5] border border-pink-200 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                          <Clock size={20} className="text-[#FF5D8F] sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="text-xs sm:text-lg font-black text-rose-600 mb-1 sm:mb-2">準備好開始挑戰了嗎？</h3>
                        <p className="text-[10px] sm:text-sm text-rose-400 mb-3 sm:mb-6 font-bold leading-tight">你將有 {gameDuration} 秒可以夾取心儀的驚喜禮品哦！</p>
                        <button 
                          onClick={() => { audio.playClickSFX(); joinQueue(gameDuration, selectedPlushies); }}
                          className="w-full bg-[#FF6B8B] hover:bg-[#FF5579] text-white font-black py-2.5 sm:py-4 rounded-2xl shadow-md border-b-4 border-[#C93B58] hover:shadow-lg transition-all active:translate-y-1 active:border-b-0 flex items-center justify-center gap-1.5 text-[11px] sm:text-lg cursor-pointer select-none"
                        >
                          <Play size={14} className="sm:w-5 sm:h-5 text-pink-100" fill="currentColor" /> 開始挑戰
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'legend' && (
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <h2 className="text-[10px] sm:text-xs font-black text-rose-500 uppercase tracking-wider mb-2">🎀 娃娃款式與倍率加成</h2>
                      <div className="space-y-1 text-[11px] sm:text-xs font-bold text-amber-900/85">
                        <div className="text-amber-500 font-bold flex items-center gap-1">
                          👑 <strong>巨型黃金款</strong>: <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 border border-amber-200 text-[9px] font-black ml-1">100 分</span>
                        </div>
                        <div className="flex items-center gap-1">
                          🎀 <strong>圍巾配戴款</strong>: <span className="text-[#FF5D8F] font-black ml-1">x3 積分倍率</span>
                        </div>
                        <div className="flex items-center gap-1">
                          🎧 <strong>護耳防寒款</strong>: <span className="text-blue-500 font-black ml-1">x2 積分倍率</span>
                        </div>
                        <div className="flex items-center gap-1">
                          🍞 <strong>基礎普通款</strong>: <span className="text-gray-500 font-black ml-1">x1 積分倍率</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-[10px] sm:text-xs font-black text-[#5C8E58] uppercase tracking-wider mb-2">🎨 底座等級分數 (Color Points)</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-[11px] sm:text-xs font-semibold text-amber-900/85">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FBBC04] shrink-0 border border-amber-400"></div> 黃金底: 50 分</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#EA4335] shrink-0 border border-red-400"></div> 紅寶石: 40 分</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#34A853] shrink-0 border border-emerald-400"></div> 翡翠底: 30 分</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#E37400] shrink-0 border border-orange-400"></div> 琥珀底: 20 分</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#9AA0A6] shrink-0 border border-slate-400"></div> 岩石底: 10 分</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================== */}
      {/* GLOBAL TOUCH CONTROLLER OVERLAY (ANCHORED AT BOTTOM) */}
      {/* ============================================== */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none p-3 xs:p-4 sm:p-6 flex flex-col justify-end z-30 font-sans">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 mt-auto">
          {/* Left Side: Empty block */}
          <div className="hidden sm:block"></div>

          {/* Center/Right Hand Side: Touch controls for mobile/tablet/desktop player */}
          {isActive ? (
            <div className="w-full flex justify-between items-end px-2 sm:px-6 lg:px-12 pointer-events-none">
              
              {/* Elegant D-pad for sliding crane (Left Side) */}
              <div className="bg-[#FFFDF6]/95 backdrop-blur-md shadow-[0_6px_0_0_#F7DBA7] p-3 xs:p-4 sm:p-5 rounded-3xl border-4 border-[#F7DBA7] flex items-center justify-center pointer-events-auto select-none scale-90 xs:scale-95 sm:scale-100 origin-bottom-left">
                <div className="grid grid-cols-3 gap-1 w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32">
                  <div></div>
                  <button
                    onMouseDown={() => handleStartMove('w')}
                    onMouseUp={() => handleEndMove('w')}
                    onMouseLeave={() => handleEndMove('w')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('w'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('w'); }}
                    className={`w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all border shadow-xs cursor-pointer ${pressedDirs.w ? 'bg-[#FF8A9A] text-white border-[#FF8A9A] scale-95 shadow-[0_0_12px_rgba(255,138,154,0.5)]' : 'bg-[#FFFDF4] text-rose-500 border-2 border-[#FCE6BD] shadow-[0_3px_0_0_#F7DBA7]'}`}
                  >
                    <ArrowUp size={14} className={`sm:w-4.5 sm:h-4.5 font-black ${pressedDirs.w ? 'animate-pulse' : ''}`} />
                  </button>
                  <div></div>

                  <button
                    onMouseDown={() => handleStartMove('a')}
                    onMouseUp={() => handleEndMove('a')}
                    onMouseLeave={() => handleEndMove('a')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('a'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('a'); }}
                    className={`w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all border shadow-xs cursor-pointer ${pressedDirs.a ? 'bg-[#FF8A9A] text-white border-[#FF8A9A] scale-95 shadow-[0_0_12px_rgba(255,138,154,0.5)]' : 'bg-[#FFFDF4] text-rose-500 border-2 border-[#FCE6BD] shadow-[0_3px_0_0_#F7DBA7]'}`}
                  >
                    <ArrowLeft size={14} className={`sm:w-4.5 sm:h-4.5 font-black ${pressedDirs.a ? 'animate-pulse' : ''}`} />
                  </button>
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 xs:w-3 xs:h-3 rounded-full bg-rose-200"></div>
                  </div>
                  <button
                    onMouseDown={() => handleStartMove('d')}
                    onMouseUp={() => handleEndMove('d')}
                    onMouseLeave={() => handleEndMove('d')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('d'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('d'); }}
                    className={`w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all border shadow-xs cursor-pointer ${pressedDirs.d ? 'bg-[#FF8A9A] text-white border-[#FF8A9A] scale-95 shadow-[0_0_12px_rgba(255,138,154,0.5)]' : 'bg-[#FFFDF4] text-rose-500 border-2 border-[#FCE6BD] shadow-[0_3px_0_0_#F7DBA7]'}`}
                  >
                    <ArrowRight size={14} className={`sm:w-4.5 sm:h-4.5 font-black ${pressedDirs.d ? 'animate-pulse' : ''}`} />
                  </button>

                  <div></div>
                  <button
                    onMouseDown={() => handleStartMove('s')}
                    onMouseUp={() => handleEndMove('s')}
                    onMouseLeave={() => handleEndMove('s')}
                    onTouchStart={(e) => { e.preventDefault(); handleStartMove('s'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleEndMove('s'); }}
                    className={`w-6.5 h-6.5 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all border shadow-xs cursor-pointer ${pressedDirs.s ? 'bg-[#FF8A9A] text-white border-[#FF8A9A] scale-95 shadow-[0_0_12px_rgba(255,138,154,0.5)]' : 'bg-[#FFFDF4] text-rose-500 border-2 border-[#FCE6BD] shadow-[0_3px_0_0_#F7DBA7]'}`}
                  >
                    <ArrowDown size={14} className={`sm:w-4.5 sm:h-4.5 font-black ${pressedDirs.s ? 'animate-pulse' : ''}`} />
                  </button>
                  <div></div>
                </div>
              </div>

              {/* Arcade Style tactile DROP button (Right Side) */}
              <div className="bg-[#FFFDF6]/95 backdrop-blur-md shadow-[0_6px_0_0_#F7DBA7] p-3 xs:p-4 sm:p-5 rounded-3xl border-4 border-[#F7DBA7] flex flex-col items-center justify-center pointer-events-auto select-none scale-90 xs:scale-95 sm:scale-100 origin-bottom-right">
                <button
                  onClick={handleDrop}
                  className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 bg-[#FF4D6D] text-white rounded-full font-black text-lg sm:text-2xl flex flex-col items-center justify-center shadow-[0_6px_0_0_#C91A3D] active:translate-y-1 active:shadow-none hover:bg-[#FF2E55] transition-all cursor-pointer select-none border-t border-white/20"
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-white rounded-full"></div>
                </button>
              </div>
            </div>
          ) : activePlayer ? (
            <div className="bg-[#FFFDF6]/95 backdrop-blur-md shadow-md p-3 rounded-full border-2 border-[#FFA6B9] pointer-events-auto flex items-center gap-2 scale-90 sm:scale-100 origin-bottom-right">
              <span className="w-2 h-2 rounded-full bg-[#FF8A9A] animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-black text-rose-500">
                正在旁觀刺激的線上夾取挑戰進行中...
              </span>
            </div>
          ) : null}
        </div>
      </div>







      {/* Game Over Modal */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="bg-[#FFFDF6] p-8 rounded-[32px] shadow-2xl max-w-md w-full text-center border-4 border-[#FFA6B9] mx-4 animate-scaleUp">
            <h2 className="text-4xl sm:text-5xl font-black mb-3 text-rose-600 tracking-tight">
              挑戰結束囉！
            </h2>
            <p className="text-xl text-amber-955 mb-6 font-black">
              恭喜你夾取了 <span className="font-extrabold text-rose-500 text-3xl px-1">{gameOver.winner?.currentScore || 0}</span> 分！🌟
            </p>

            {/* Retro Arcade Initials Name Input Option */}
            <div className="bg-rose-50 border-2 border-[#FFA6B9] rounded-[24px] p-5 mb-5 text-left">
              <label className="block text-sm font-black text-rose-600 tracking-wide mb-2 flex items-center gap-2">
                <span>✍️</span> 登錄大名排行榜
              </label>
              <input
                type="text"
                maxLength={15}
                value={gameOverName}
                onChange={(e) => {
                  setGameOverName(e.target.value);
                }}
                placeholder="輸入玩家名字"
                className="w-full px-4 py-3 bg-white text-rose-600 border-2 border-[#FFF0D4] rounded-xl text-center font-black text-xl focus:outline-none focus:border-[#FF5D8F] placeholder-rose-200"
              />
              <p className="text-[11px] text-[#B09980] mt-2.5 font-bold leading-normal">
                提示：可以直接保留目前名字，或填入新暱稱並按下下方按鈕確認。
              </p>
            </div>
            
            <div className="space-y-2 mb-6 text-left bg-[#FAF3E5]/50 p-5 rounded-[24px] border-2 border-[#FCE6BD]">
              <div className="text-[11px] font-black text-rose-500 tracking-wide mb-1.5">🏆 本局積分榜</div>
              {gameOver.players.slice(0, 5).map((p: any, i: number) => (
                <div key={p.id} className="flex justify-between items-center p-2 rounded-xl bg-white/70 border border-transparent hover:border-[#FFA6B9] transition-all">
                  <span className="font-black flex items-center gap-3" style={{ color: p.color }}>
                    <span className="text-amber-500 text-base">{i === 0 ? '👑' : i + 1}</span> 
                    {p.name} {p.id === myId ? <span className="text-[10px] font-black bg-rose-200 px-2 py-0.5 rounded-full text-rose-600 ml-1">你</span> : ''}
                  </span>
                  <span className="text-rose-600 font-extrabold">{p.score} 分</span>
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
              className="w-full bg-[#FF6B8B] hover:bg-[#FF5579] text-white font-black py-4 rounded-2xl shadow-md border-b-4 border-[#C93B58] transition-all active:translate-y-1 active:border-b-0 cursor-pointer select-none"
            >
              確認並繼續挑戰 🍭
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (Simplified & completely in Chinese) */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="bg-[#FFFDF6] p-6 rounded-[32px] shadow-2xl max-w-sm w-full border-4 border-[#FFA6B9] flex flex-col mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-rose-600 flex items-center gap-2 font-sans">
                ⚙️ 遊戲控制設定
              </h3>
              <button 
                onClick={() => { audio.playClickSFX(); setShowSettings(false); }}
                className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                關閉
              </button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-6 pr-1 custom-scrollbar">
              {/* BGM Toggle */}
              <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border-2 border-[#FCE6BD]">
                <div className="flex items-center gap-2">
                  {bgmOn ? <Volume2 size={18} className="text-[#FF5D8F]" /> : <VolumeX size={18} className="text-rose-300" />}
                  <span className="text-sm font-black text-rose-550">背景音樂 (BGM)</span>
                </div>
                <button
                  onClick={handleToggleBgm}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${bgmOn ? 'bg-[#FF8A9A]' : 'bg-rose-200'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all ${bgmOn ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* SFX Toggle */}
              <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border-2 border-[#FCE6BD]">
                <div className="flex items-center gap-2">
                  {sfxOn ? <Volume2 size={18} className="text-[#FF5D8F]" /> : <VolumeX size={18} className="text-rose-300" />}
                  <span className="text-sm font-black text-rose-550">遊戲音效 (SFX)</span>
                </div>
                <button
                  onClick={handleToggleSfx}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${sfxOn ? 'bg-[#FF8A9A]' : 'bg-rose-200'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all ${sfxOn ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Game Duration Selector */}
              <div className="bg-white p-4 rounded-2xl border-2 border-[#FCE6BD] flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#FF5D8F]" />
                  <span className="text-xs font-black text-rose-500 uppercase tracking-wider">設定遊戲秒數</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 120].map((secs) => (
                    <button
                      key={secs}
                      onClick={() => handleChangeDuration(secs)}
                      className={`py-2 text-xs font-black rounded-xl transition-all border cursor-pointer ${gameDuration === secs ? 'bg-[#FF8A9A] border-[#FF8A9A] text-white shadow-xs' : 'bg-rose-50 border-[#FFF0D4] text-rose-400 hover:bg-rose-100/50'}`}
                    >
                      {secs}秒
                    </button>
                  ))}
                </div>
              </div>

              {/* Plushie Customization Selector */}
              <div className="bg-white p-4 rounded-2xl border-2 border-[#FCE6BD] flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#FF5D8F]" />
                  <span className="text-xs font-black text-rose-500 uppercase tracking-wider">自訂娃娃款式</span>
                </div>
                <div className="space-y-2">
                  {PLUSHIE_TYPES.map((toy) => {
                    const isChecked = selectedPlushies.includes(toy.id);
                    return (
                      <div key={toy.id} className="flex justify-between items-center bg-rose-50/40 p-2.5 rounded-xl border border-[#FAECD5] shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{toy.emoji}</span>
                          <span className="text-sm font-black text-rose-550">{toy.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePlushie(toy.id, true)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-wide border transition-all ${isChecked && selectedPlushies.length === 1 && selectedPlushies[0] === toy.id ? 'bg-[#FF8A9A] text-white border-[#FF8A9A]' : 'bg-white text-rose-400 border-rose-100 hover:bg-rose-50 cursor-pointer'}`}
                          >
                            單選
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePlushie(toy.id, false)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${isChecked ? 'bg-[#FF8A9A] text-white border-[#FF8A9A]' : 'bg-white text-transparent border-rose-200 hover:border-pink-300'}`}
                          >
                            {isChecked ? <Check size={14} className="stroke-[3]" /> : <span className="text-transparent">✓</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] text-rose-400 font-extrabold leading-normal bg-[#FFFDF6] p-2.5 rounded-xl border border-solid border-[#FCE6BD]">
                  💡 說明：點「單選」可快速指定單一娃娃，此處能依個人洗好任意混合在爪機中唷！
                </div>
              </div>
            </div>

            <button 
              onClick={() => { audio.playClickSFX(); setShowSettings(false); }}
              className="w-full bg-[#FF6B8B] hover:bg-[#FF5579] text-white font-black py-3.5 rounded-2xl shadow-md border-b-4 border-[#C93B58] transition-all active:translate-y-1 active:border-b-0 cursor-pointer select-none"
            >
              確認設定完成 🍭
            </button>
          </div>
        </div>
      )}
    </>
  );
};
