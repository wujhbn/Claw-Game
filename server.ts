/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  // Game State
  const players: Record<string, any> = {};
  let playerCount = 0;
  let activePlayer: string | null = null;
  let isStartingGame = false;
  let turnEndTime = 0;
  let prizes: any[] = [];
  
  const colorValues: Record<string, number> = {
    '#FBBC04': 50, // Yellow
    '#EA4335': 40, // Medium red
    '#34A853': 30, // Medium green
    '#E37400': 20, // Orange
    '#9AA0A6': 10  // Gray (lowest points)
  };
  
  const typeMultipliers: Record<string, number> = {
    'dodecahedron': 3,
    'sphere': 2,
    'box': 1
  };
  
  const colors = Object.keys(colorValues);
  const types = Object.keys(typeMultipliers);

  const DISALLOW_LIST = new Set([
    'ASS', 'CUM', 'FAG', 'FUK', 'FUQ', 'GAY', 'JEW', 'JIZ', 'KKK', 'SEX', 'TIT', 'VAG', 'WAP', 'WTF', 'WTG', 'DIK', 'COK', 'FUC', 'FUX', 'NIG', 'NGR', 'BCH', 'BIT', 'HOE', 'SLT', 'CUN', 'KYS'
  ]);
  
  const ALL_TOY_TYPES = ['shima_enaga', 'bear', 'bunny', 'cat', 'duck'];
  let currentActiveToyList: string[] = [...ALL_TOY_TYPES];

  function initPrizes(selectedToys: string[] = currentActiveToyList) {
    prizes = [];
    const validToys = (Array.isArray(selectedToys) && selectedToys.length > 0) ? selectedToys : ALL_TOY_TYPES;
    currentActiveToyList = validToys;

    const totalPrizes = Math.floor(Math.random() * 40) + 20; // Random amount between 20 and 59
    for(let i=0; i<totalPrizes; i++) {
      let x = (Math.random()-0.5)*7;
      let z = (Math.random()-0.5)*7;
      // Avoid chute area (x: -5 to -2, z: 2 to 5)
      if (x < -2 && z > 2) {
        x += 3;
      }
      
      const type = types[Math.floor(Math.random() * types.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const toyType = validToys[Math.floor(Math.random() * validToys.length)];
      
      // Much more varied sizes
      const scale = 0.5 + Math.random() * 1.5; // From 0.5 to 2.0
      const value = Math.floor(colorValues[color] * typeMultipliers[type] * scale);

      prizes.push({
        id: `prize_${uuidv4()}`,
        type,
        toyType,
        color,
        value,
        scale,
        position: [x, Math.random()*4 + 1, z],
        rotation: [0,0,0,1]
      });
    }
    
    // Add 3 giant golden Shima Enaga (Long-tailed tit) plushies or other variants
    for(let i=0; i<3; i++) {
      let x = (Math.random()-0.5)*7;
      let z = (Math.random()-0.5)*7;
      if (x < -2 && z > 2) x += 3;
      
      const toyType = validToys[Math.floor(Math.random() * validToys.length)];
      prizes.push({
        id: `prize_giant_${uuidv4()}`,
        type: 'bugdroid',
        toyType,
        color: '#FBBC04', // Rich Golden Yellow
        value: 150,
        scale: 2.2, // Giant size
        position: [x, Math.random()*2 + 5, z],
        rotation: [0,0,0,1]
      });
    }
  }
  initPrizes();

  let clawState = { x: 0, y: 8, z: 0, state: 'idle', prongsClosed: false, grabbedPrizeId: null };

  function startGame(playerId: string, durationSeconds: number = 60, selectedToys?: string[]) {
    activePlayer = playerId;
    turnEndTime = Date.now() + (durationSeconds * 1000);
    clawState = { x: 0, y: 8, z: 0, state: 'idle', prongsClosed: false, grabbedPrizeId: null };
    if (players[playerId]) {
      players[playerId].currentScore = 0; // Reset current score for new game
      io.emit('players_update', players);
    }
    initPrizes(selectedToys); // Reset prizes for the new game
    io.emit('prizes_reset', prizes);
    io.emit('turn_start', { activePlayer, turnEndTime, clawState, queue: [] });
  }

  function endGame() {
    if (activePlayer !== null && players[activePlayer]) {
      const p = players[activePlayer];
      if (p.currentScore > p.score) {
        p.score = p.currentScore;
      }
      
      const winner = { ...p };
      const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
      io.emit('game_over', { winner, players: sortedPlayers });
      
      io.emit('players_update', players); // Send updated players with new high scores if any
    }
    activePlayer = null;
    io.emit('turn_start', { activePlayer: null, queue: [] });
  }

  setInterval(() => {
    if (activePlayer && Date.now() > turnEndTime) {
      endGame();
    }
  }, 1000);

  io.on('connection', (socket) => {
    socket.emit('init_state', {
      players, queue: [], activePlayer, turnEndTime, prizes, clawState
    });

    socket.on('join', (name: string) => {
      let finalName = name.slice(0, 15);
      if (finalName.length < 1 || DISALLOW_LIST.has(finalName.toUpperCase())) {
        playerCount++;
        finalName = `P${playerCount}`; // Fallback
      }
      
      const existing = players[socket.id];
      if (existing) {
        existing.name = finalName;
      } else {
        players[socket.id] = {
          id: socket.id,
          name: finalName,
          score: 0,
          currentScore: 0,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      }
      io.emit('players_update', players);
    });

    socket.on('join_queue', (customDuration?: number, selectedToys?: string[]) => {
      if (!players[socket.id]) return;
      if (!activePlayer && !isStartingGame) {
        isStartingGame = true;
        const duration = (typeof customDuration === 'number' && customDuration >= 10 && customDuration <= 300) ? customDuration : 60;
        startGame(socket.id, duration, selectedToys);
        isStartingGame = false;
      }
    });

    socket.on('claw_update', (data) => {
      if (socket.id === activePlayer) {
        clawState = { ...clawState, ...data };
        socket.broadcast.emit('claw_sync', clawState);
      }
    });

    socket.on('prizes_update', (data) => {
      const playerIds = Object.keys(players);
      if (socket.id === activePlayer || (!activePlayer && playerIds[0] === socket.id)) {
        data.forEach((update: any) => {
          const p = prizes.find(p => p.id === update.id);
          if (p) {
            p.position = update.position;
            p.rotation = update.rotation;
          }
        });
        socket.broadcast.emit('prizes_sync', data);
      }
    });

    socket.on('prize_captured', (prizeId, isValidWin = true) => {
      const playerIds = Object.keys(players);
      const isPhysicsHost = socket.id === activePlayer || 
                            (!activePlayer && playerIds[0] === socket.id);
      
      if (isPhysicsHost) {
        const index = prizes.findIndex(p => p.id === prizeId);
        if (index !== -1) {
          const prize = prizes[index];
          
          const targetPlayer = activePlayer;
          
          if (targetPlayer && players[targetPlayer]) {
            if (isValidWin) {
              players[targetPlayer].currentScore = (players[targetPlayer].currentScore || 0) + prize.value;
              if (players[targetPlayer].currentScore > players[targetPlayer].score) {
                players[targetPlayer].score = players[targetPlayer].currentScore;
              }
              io.emit('prize_removed', { prizeId, playerId: targetPlayer, score: players[targetPlayer].currentScore });
            } else {
              io.emit('prize_removed', { prizeId, playerId: null, score: null });
            }
          } else {
            io.emit('prize_removed', { prizeId, playerId: null, score: null });
          }
          
          prizes.splice(index, 1);
          
          if (prizes.length < 10) {
            initPrizes();
            io.emit('prizes_reset', prizes);
          }
        }
      }
    });

    socket.on('turn_end', () => {
      // No longer used for single player
    });

    socket.on('disconnect', () => {
      if (activePlayer === socket.id) {
        endGame();
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
