/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { audio } from './utils/audio';

interface GameState {
  socket: Socket | null;
  connected: boolean;
  players: Record<string, any>;
  queue: string[];
  activePlayer: string | null;
  turnEndTime: number;
  prizes: any[];
  clawState: any;
  myId: string | null;
  gameOver: { winner: any, players: any[] } | null;
  
  connect: () => void;
  join: (name: string) => void;
  joinQueue: (durationSeconds?: number, selectedPlushies?: string[]) => void;
  updateClaw: (data: any) => void;
  updatePrizes: (data: any) => void;
  capturePrize: (prizeId: string, isValidWin?: boolean) => void;
  endTurn: () => void;
}

export const prizeRefs: Record<string, any> = {};

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  connected: false,
  players: {},
  queue: [],
  activePlayer: null,
  turnEndTime: 0,
  prizes: [],
  clawState: { x: 0, y: 8, z: 0, state: 'idle', prongsClosed: false, grabbedPrizeId: null },
  myId: null,
  gameOver: null,

  connect: () => {
    if (get().socket) return;
    
    // Connect to the current domain automatically. Using websocket first prevents some mobile/iframe polling issues.
    const socket = io("/", {
      transports: ['websocket', 'polling'], // prefer websocket
      timeout: 5000,
    });

    let connectionTimeout = setTimeout(() => {
      if (!get().connected) {
         console.warn("Socket connection failed. Switching to offline mode.");
         // Fallback to offline mode
         const myId = "local_player";
         set({ 
           connected: true, 
           myId,
           players: { [myId]: { id: myId, name: 'Offline Player', score: 0, currentScore: 0, color: '#4285F4' } },
         });
      }
    }, 4000);

    socket.on('connect', () => {
      clearTimeout(connectionTimeout);
      set({ connected: true, myId: socket.id });
    });

    socket.on('connect_error', () => {
      if (!get().connected) {
         console.warn("Socket connect_error. Waiting for timeout to switch to offline mode...");
      }
    });

    socket.on('init_state', (state) => {
      set({ ...state });
    });

    socket.on('players_update', (players) => set({ players }));
    socket.on('queue_update', (queue) => set({ queue }));
    socket.on('turn_start', (data) => set((state) => ({ 
      ...data, 
      gameOver: data.activePlayer ? null : state.gameOver 
    })));
    socket.on('game_over', (data) => set({ gameOver: data }));
    
    socket.on('claw_sync', (clawState) => {
      if (get().activePlayer !== get().myId) {
        set({ clawState });
      }
    });

    socket.on('prizes_sync', (updates) => {
      const playerIds = Object.keys(get().players);
      const isPhysicsHost = get().activePlayer === get().myId || (!get().activePlayer && playerIds[0] === get().myId);
      if (!isPhysicsHost) {
        set((state) => {
          const newPrizes = [...state.prizes];
          updates.forEach((u: any) => {
            const p = newPrizes.find(p => p.id === u.id);
            if (p) {
              p.position = u.position;
              p.rotation = u.rotation;
            }
          });
          return { prizes: newPrizes };
        });
      }
    });

    socket.on('prize_removed', ({ prizeId, playerId, score }) => {
      if (playerId === get().myId) {
        audio.playWinSFX();
      }
      set((state) => {
        const newPlayers = { ...state.players };
        if (newPlayers[playerId]) {
          newPlayers[playerId].currentScore = score;
          if (score > newPlayers[playerId].score) {
            newPlayers[playerId].score = score;
          }
        }
        return {
          prizes: state.prizes.filter(p => p.id !== prizeId),
          players: newPlayers
        };
      });
    });

    socket.on('prizes_reset', (prizes) => set({ prizes }));

    socket.on('force_drop', () => {
      if (get().activePlayer === get().myId) {
        window.dispatchEvent(new CustomEvent('force_drop'));
      }
    });

    set({ socket });
  },

  join: (name) => {
    if (get().socket?.connected) {
      get().socket?.emit('join', name);
    } else {
      const myId = get().myId || 'local_player';
      set((state) => ({ players: { ...state.players, [myId]: { id: myId, name, score: 0, currentScore: 0, color: '#4285F4' } } }));
    }
  },
  joinQueue: (durationSeconds, selectedPlushies) => {
    if (get().socket?.connected) {
      get().socket?.emit('join_queue', durationSeconds, selectedPlushies);
    } else {
      // Local offline mode
      const duration = durationSeconds || 60;
      const myId = get().myId!;
      set({ 
        activePlayer: myId, 
        turnEndTime: Date.now() + duration * 1000,
        clawState: { x: 0, y: 8, z: 0, state: 'idle', prongsClosed: false, grabbedPrizeId: null },
      });
      // Generate some dummy prizes locally
      const validToys = selectedPlushies || ['shima_enaga', 'bear', 'bunny', 'cat', 'duck'];
      const localPrizes = [];
      const types = ['dodecahedron', 'sphere', 'box'];
      const colors = ['#FBBC04', '#EA4335', '#34A853', '#E37400', '#9AA0A6'];
      const totalPrizes = Math.floor(Math.random() * 40) + 20; // 20 to 59
      const runId = Math.floor(Math.random() * 1000000);
      for(let i=0; i<totalPrizes; i++) {
        const scale = 0.5 + Math.random() * 1.5;
        localPrizes.push({
          id: `local_prize_${runId}_${i}`,
          type: types[Math.floor(Math.random() * types.length)],
          toyType: validToys[Math.floor(Math.random() * validToys.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          value: Math.floor(30 * scale),
          scale: scale,
          position: [(Math.random()-0.5)*7, Math.random()*2 + 1, (Math.random()-0.5)*7],
          rotation: [0,0,0,1]
        });
      }
       set({ prizes: localPrizes });

      // Local game timeout
      setTimeout(() => {
         set({ activePlayer: null, gameOver: { winner: get().players[myId], players: [get().players[myId]] } });
      }, duration * 1000);
    }
  },
  updateClaw: (data) => {
    set((state) => ({ clawState: { ...state.clawState, ...data } }));
    if (get().socket?.connected) {
      get().socket?.emit('claw_update', data);
    }
  },
  updatePrizes: (data) => {
    if (get().socket?.connected) {
      get().socket?.emit('prizes_update', data);
    }
  },
  capturePrize: (prizeId, isValidWin = true) => {
    if (get().socket?.connected) {
      get().socket?.emit('prize_captured', prizeId, isValidWin);
    } else { // Offline physics logic
      const state = get();
      const prize = state.prizes.find(p => p.id === prizeId);
      if (prize) {
        if (isValidWin) audio.playWinSFX();
        const myId = state.myId!;
        const player = state.players[myId];
        const currentScore = isValidWin ? (player.currentScore || 0) + prize.value : (player.currentScore || 0);
        const newScore = isValidWin ? Math.max(player.score || 0, currentScore) : player.score;
        
        set((s) => ({
          prizes: s.prizes.filter(p => p.id !== prizeId),
          players: { ...s.players, [myId]: { ...player, currentScore, score: newScore } }
        }));
      }
    }
  },
  endTurn: () => get().socket?.emit('turn_end')
}));
