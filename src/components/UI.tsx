/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { Users, Trophy, Play, Clock, Info, ListOrdered, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minimize2, Maximize2 } from 'lucide-react';

export const UI = () => {
  const { connected, players, queue, activePlayer, turnEndTime, myId, join, joinQueue, gameOver } = useGameStore();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const DISALLOW_LIST = new Set([
    'ASS', 'CUM', 'FAG', 'FUK', 'FUQ', 'GAY', 'JEW', 'JIZ', 'KKK', 'SEX', 'TIT', 'VAG', 'WAP', 'WTF', 'WTG', 'DIK', 'COK', 'FUC', 'FUX', 'NIG', 'NGR', 'BCH', 'BIT', 'HOE', 'SLT', 'CUN', 'KYS'
  ]);

  // Generate a friendly, cute random 3-letter name on connect automatically
  useEffect(() => {
    if (connected && myId && !players[myId]) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let autoName = '';
      do {
        autoName = '';
        for (let i = 0; i < 3; i++) {
          autoName += letters.charAt(Math.floor(Math.random() * letters.length));
        }
      } while (DISALLOW_LIST.has(autoName));
      join(autoName);
    }
  }, [connected, myId, players, join]);

  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard' | 'legend'>('play');
  const [pressedDirs, setPressedDirs] = useState({ w: false, a: false, s: false, d: false });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const me = players[myId || ''];
  const isActive = activePlayer === myId && myId !== null;

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
      if (key === 'w' || e.key === 'ArrowUp') setPressedDirs(prev => ({ ...prev, w: true }));
      if (key === 's' || e.key === 'ArrowDown') setPressedDirs(prev => ({ ...prev, s: true }));
      if (key === 'a' || e.key === 'ArrowLeft') setPressedDirs(prev => ({ ...prev, a: true }));
      if (key === 'd' || e.key === 'ArrowRight') setPressedDirs(prev => ({ ...prev, d: true }));
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
          <div>進入長尾山雀夾公仔機世界中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between font-sans">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-3xl p-5 pointer-events-auto w-80 border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-[#4285F4] tracking-tight mb-1">長尾山雀夾夾樂</h1>
            <div className="flex items-center gap-2 text-gray-700 text-xs font-medium bg-gray-100/80 px-2 py-1 rounded-lg w-fit">
              <Users size={12} className="text-[#4285F4]" /> {Object.keys(players).length} Online
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">{isActive ? 'Current Score' : 'High Score'}</div>
            <div className="text-3xl font-black text-[#34A853] leading-none">{isActive ? (me.currentScore || 0) : me.score}</div>
          </div>
        </div>

        {/* Right Panel (Consolidated & Collapsible) */}
        {isCollapsed ? (
          <div className="flex items-center gap-2 pointer-events-auto">
            {activePlayer && (
              <div 
                className="bg-white/95 backdrop-blur-md shadow-md border border-red-100 rounded-full px-4 py-3.5 flex items-center gap-1.5 font-sans font-black text-[#EA4335] text-sm"
                title="剩餘時間"
              >
                <Clock size={16} className="text-[#EA4335] animate-spin" style={{ animationDuration: '6s' }} />
                <span>{timeLeft}s</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(false)}
              className="bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl border border-gray-200/60 rounded-full px-5 py-3.5 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 text-gray-700 font-bold text-sm"
              title="開啟控制與排行榜"
            >
              <Trophy size={18} className="text-[#FBBC04]" />
              <span>開啟控制面板</span>
              <Maximize2 size={14} className="text-gray-400 ml-1" />
            </button>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-3xl p-5 w-80 pointer-events-auto border border-gray-100 flex flex-col max-h-[calc(100vh-48px)] relative">
            {/* Collapse toggle button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              title="收合面板"
            >
              <Minimize2 size={16} />
            </button>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4 bg-gray-100/50 p-1 rounded-xl mr-7">
            <button 
              onClick={() => setActiveTab('play')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'play' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Play size={14} className={activeTab === 'play' ? 'text-[#4285F4]' : ''} /> Play
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'leaderboard' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Trophy size={14} className={activeTab === 'leaderboard' ? 'text-[#FBBC04]' : ''} /> Top
            </button>
            <button 
              onClick={() => setActiveTab('legend')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'legend' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Info size={14} className={activeTab === 'legend' ? 'text-[#34A853]' : ''} /> Info
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto min-h-[200px]">
            {activeTab === 'leaderboard' && (
              <div className="space-y-3">
                {Object.values(players).sort((a: any, b: any) => b.score - a.score).slice(0, 10).map((p: any, i) => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className="font-bold flex items-center gap-2" style={{ color: p.color }}>
                      <span className="text-gray-400 text-xs w-4">{i+1}.</span> {p.name} {p.id === myId && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-1">YOU</span>}
                    </span>
                    <span className="font-bold text-gray-900">{p.score}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'play' && (
              <div className="flex flex-col h-full">
                {activePlayer ? (
                  <div className="mb-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex-1 flex flex-col items-center justify-center">
                    <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-widest">Game in Progress</div>
                    <div className="font-black text-5xl text-[#4285F4] mb-2">{timeLeft}s</div>
                    <div className="text-sm font-medium text-gray-600 mb-4">Grab as many points as you can!</div>
                    <div className="bg-white/80 px-4 py-2 rounded-lg text-xs font-bold text-gray-500 border border-blue-100">
                      WASD to move • SPACE to drop
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Clock size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">Ready to Play?</h3>
                    <p className="text-sm text-gray-500 mb-6 font-medium">You have 60 seconds to grab as many prizes as possible.</p>
                    <button 
                      onClick={joinQueue}
                      className="w-full bg-[#4285F4] text-white font-bold py-4 rounded-xl hover:bg-[#3367D6] hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                    >
                      <Play size={20} fill="currentColor" /> Start Game
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'legend' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">長尾山雀款式 (Plushie Multipliers)</h2>
                  <div className="space-y-2 text-xs font-medium text-gray-700">
                    <div className="text-amber-500 font-bold flex items-center gap-2">
                      👑 <strong>皇冠金之王 (Giant King)</strong>: <span className="bg-amber-50 px-1 py-0.5 rounded text-gray-900 border border-amber-200 ml-1">100 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      🎀 <strong>領巾款 (Scarf Style - Dodecahedron)</strong>: <span className="text-gray-900 font-bold ml-1">x3 點數加成</span>
                    </div>
                    <div className="flex items-center gap-2">
                      🎧 <strong>耳罩款 (Earmuffs Style - Sphere)</strong>: <span className="text-gray-900 font-bold ml-1">x2 點數加成</span>
                    </div>
                    <div className="flex items-center gap-2">
                      🍞 <strong>方形款 (Chubby Cube Style - Box)</strong>: <span className="text-gray-900 font-bold ml-1">x1 點數加成</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">配件顏色基礎分 (Accessory Colors)</h2>
                  <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-gray-700">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#FBBC04] shadow-sm"></div> 金黃 (Gold): 50</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#EA4335] shadow-sm"></div> 鮮紅 (Ruby): 40</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#34A853] shadow-sm"></div> 粉綠 (Emerald): 30</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#E37400] shadow-sm"></div> 亮橘 (Amber): 20</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#9AA0A6] shadow-sm"></div> 霧灰 (Slate): 10</div>
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
        {/* Left Side: Handy info on desktop or small helper */}
        <div className="hidden sm:flex flex-col gap-1.5 p-4 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl pointer-events-auto shadow-lg max-w-xs scale-90 md:scale-100 origin-bottom-left">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keyboard Shortcuts</div>
          <div className="text-xs text-gray-600 font-medium leading-relaxed">
            • <strong className="text-[#4285F4]">W, A, S, D</strong> or arrows to move<br/>
            • <strong className="text-[#EA4335]">SPACE</strong> to drop claw
          </div>
        </div>

        {/* Center/Right Hand Side: Touch controls for mobile player */}
        {isActive ? (
          <div className="mx-auto sm:mx-0 bg-white/95 backdrop-blur-md shadow-2xl p-4 md:p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between gap-6 md:gap-10 pointer-events-auto select-none w-full sm:w-auto max-w-sm md:max-w-md scale-95 md:scale-100 origin-bottom-right">
            {/* Elegant D-pad for sliding crane */}
            <div className="flex flex-col items-center gap-1.5 flex-1 sm:flex-initial">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">CLAW MOVEMENT</span>
              <div className="grid grid-cols-3 gap-1.5 w-28 h-28 md:w-32 md:h-32">
                <div></div>
                <button
                  onMouseDown={() => handleStartMove('w')}
                  onMouseUp={() => handleEndMove('w')}
                  onMouseLeave={() => handleEndMove('w')}
                  onTouchStart={(e) => { e.preventDefault(); handleStartMove('w'); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleEndMove('w'); }}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border border-gray-200/80 shadow-xs cursor-pointer ${pressedDirs.w ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100/80 active:bg-gray-100'}`}
                >
                  <ArrowUp size={18} className={pressedDirs.w ? 'animate-pulse' : ''} />
                </button>
                <div></div>

                <button
                  onMouseDown={() => handleStartMove('a')}
                  onMouseUp={() => handleEndMove('a')}
                  onMouseLeave={() => handleEndMove('a')}
                  onTouchStart={(e) => { e.preventDefault(); handleStartMove('a'); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleEndMove('a'); }}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border border-gray-200/80 shadow-xs cursor-pointer ${pressedDirs.a ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100/80 active:bg-gray-100'}`}
                >
                  <ArrowLeft size={18} className={pressedDirs.a ? 'animate-pulse' : ''} />
                </button>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-100/60 flex items-center justify-center text-gray-400 text-[10px] font-bold select-none">🕹️</div>
                <button
                  onMouseDown={() => handleStartMove('d')}
                  onMouseUp={() => handleEndMove('d')}
                  onMouseLeave={() => handleEndMove('d')}
                  onTouchStart={(e) => { e.preventDefault(); handleStartMove('d'); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleEndMove('d'); }}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border border-gray-200/80 shadow-xs cursor-pointer ${pressedDirs.d ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100/80 active:bg-gray-100'}`}
                >
                  <ArrowRight size={18} className={pressedDirs.d ? 'animate-pulse' : ''} />
                </button>

                <div></div>
                <button
                  onMouseDown={() => handleStartMove('s')}
                  onMouseUp={() => handleEndMove('s')}
                  onMouseLeave={() => handleEndMove('s')}
                  onTouchStart={(e) => { e.preventDefault(); handleStartMove('s'); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleEndMove('s'); }}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border border-gray-200/80 shadow-xs cursor-pointer ${pressedDirs.s ? 'bg-[#4285F4] text-white border-[#4285F4] scale-95 shadow-[0_0_12px_rgba(66,133,244,0.4)]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100/80 active:bg-gray-100'}`}
                >
                  <ArrowDown size={18} className={pressedDirs.s ? 'animate-pulse' : ''} />
                </button>
                <div></div>
              </div>
            </div>

            {/* Arcade Style tactile DROP button */}
            <div className="flex flex-col items-center gap-1.5 font-sans">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">LAUNCH CLAW</span>
              <button
                onClick={handleDrop}
                className="w-20.5 h-20.5 md:w-24 md:h-24 bg-[#EA4335] text-white rounded-full font-black text-sm md:text-base flex flex-col items-center justify-center shadow-[0_6px_0_0_#b31412] md:shadow-[0_8px_0_0_#b31412] active:translate-y-1 active:shadow-[0_3px_0_0_#b31412] hover:bg-[#ff4f3d] transition-all cursor-pointer select-none"
              >
                <div className="text-white text-base md:text-lg font-black tracking-widest drop-shadow-sm">DROP</div>
                <div className="text-[9px] font-bold text-red-100 tracking-wider">TAP</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-md shadow-lg p-4 rounded-2xl border border-gray-100 pointer-events-auto flex items-center gap-3 scale-90 md:scale-100 origin-bottom-right">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FBBC04] animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-700">
              {activePlayer ? '👀 Spectating live game' : '🕹️ Join the queue or click "Start Game" above'}
            </span>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center border border-gray-100">
            <h2 className="text-5xl font-black mb-3 text-gray-900">
              TIME'S UP!
            </h2>
            <p className="text-lg text-gray-600 mb-8 font-medium">
              You scored <span className="font-bold text-[#34A853]">{gameOver.winner?.currentScore || 0}</span> points!
            </p>
            
            <div className="space-y-2 mb-8 text-left bg-gray-50 p-5 rounded-2xl border border-gray-100">
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
              onClick={() => useGameStore.setState({ gameOver: null })}
              className="w-full py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              Close & Keep Playing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
