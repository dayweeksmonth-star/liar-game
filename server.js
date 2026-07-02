const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const rooms = new Map();

const WORD_PACKS = {
  easy: {
    name: '쉬움',
    words: [
      '사과', '바나나', '피자', '라면', '치킨', '커피', '우산', '자동차', '자전거', '강아지',
      '고양이', '학교', '병원', '편의점', '영화관', '바다', '산', '비행기', '핸드폰', '컴퓨터'
    ]
  },
  office: {
    name: '직장/공공기관',
    words: [
      '회의', '출장', '연가', '공문', '민원', '보고서', '결재', '예산', '감사', '부서',
      '전화번호부', '엑셀', '공지사항', '보도자료', '청렴', '교육', '협조문', '자료제출', '업무분장', '전산실'
    ]
  },
  hard: {
    name: '어려움',
    words: [
      '블록체인', '메타버스', '양자컴퓨터', '기후변화', '인공지능', '자동매매', '데이터베이스', '클라우드', '보안', '알고리즘',
      '증강현실', '가상화폐', '우주정거장', '사물인터넷', '자율주행', '딥러닝', '서버리스', '렌더링', '네트워크', '암호화'
    ]
  }
};

function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function sanitizeText(value, max = 80) {
  return String(value || '').trim().slice(0, max);
}

function createRoom(hostId, hostName, requestedCode) {
  let code = sanitizeText(requestedCode, 12).toUpperCase() || makeRoomCode();
  while (rooms.has(code)) code = makeRoomCode();

  const room = {
    code,
    hostId,
    players: [],
    state: 'lobby',
    packKey: 'easy',
    round: 0,
    word: '',
    liarId: null,
    turnIndex: 0,
    hints: [],
    votes: {},
    finalGuess: '',
    scores: {},
    timer: null,
    timerEndsAt: null,
    phaseSeconds: 60
  };
  rooms.set(code, room);
  addPlayer(room, hostId, hostName);
  return room;
}

function addPlayer(room, id, name) {
  if (!room.players.some(p => p.id === id)) {
    const player = {
      id,
      name: sanitizeText(name, 16) || '익명',
      connected: true
    };
    room.players.push(player);
    if (!room.scores[id]) room.scores[id] = 0;
  }
}

function getPublicRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    state: room.state,
    packKey: room.packKey,
    packName: WORD_PACKS[room.packKey]?.name || '쉬움',
    round: room.round,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      connected: p.connected,
      score: room.scores[p.id] || 0
    })),
    turnPlayerId: room.players[room.turnIndex]?.id || null,
    hints: room.hints,
    votesCount: Object.keys(room.votes).length,
    totalPlayers: room.players.length,
    timerEndsAt: room.timerEndsAt,
    finalGuess: room.finalGuess
  };
}

function emitRoom(room) {
  io.to(room.code).emit('room:update', getPublicRoom(room));
  emitSecrets(room);
}

function emitSecrets(room) {
  for (const p of room.players) {
    const role = room.state === 'lobby' ? null : (p.id === room.liarId ? 'liar' : 'citizen');
    const secretWord = role === 'citizen' ? room.word : '';
    io.to(p.id).emit('player:secret', {
      role,
      word: secretWord,
      isYourTurn: room.players[room.turnIndex]?.id === p.id,
      canVote: room.state === 'vote',
      canFinalGuess: room.state === 'finalGuess' && p.id === room.liarId
    });
  }
}

function clearRoomTimer(room) {
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
  room.timerEndsAt = null;
}

function setPhaseTimer(room, seconds, onEnd) {
  clearRoomTimer(room);
  room.phaseSeconds = seconds;
  room.timerEndsAt = Date.now() + seconds * 1000;
  room.timer = setTimeout(() => {
    try { onEnd(); } catch (err) { console.error(err); }
  }, seconds * 1000);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function startGame(room, packKey = 'easy') {
  if (room.players.length < 3) {
    io.to(room.hostId).emit('toast', '최소 3명이 필요합니다.');
    return;
  }
  room.packKey = WORD_PACKS[packKey] ? packKey : 'easy';
  room.round += 1;
  room.state = 'hint';
  room.word = randomItem(WORD_PACKS[room.packKey].words);
  room.liarId = randomItem(room.players).id;
  room.turnIndex = 0;
  room.hints = [];
  room.votes = {};
  room.finalGuess = '';
  setPhaseTimer(room, 90, () => openVote(room));
  emitRoom(room);
}

function nextTurnOrVote(room) {
  if (room.hints.length >= room.players.length) {
    openVote(room);
    return;
  }
  let tries = 0;
  do {
    room.turnIndex = (room.turnIndex + 1) % room.players.length;
    tries += 1;
  } while (room.hints.some(h => h.playerId === room.players[room.turnIndex]?.id) && tries < room.players.length + 2);
  emitRoom(room);
}

function submitHint(room, playerId, hint) {
  if (room.state !== 'hint') return;
  const current = room.players[room.turnIndex];
  if (!current || current.id !== playerId) return;
  if (room.hints.some(h => h.playerId === playerId)) return;
  const player = room.players.find(p => p.id === playerId);
  room.hints.push({
    playerId,
    playerName: player?.name || '익명',
    text: sanitizeText(hint, 80) || '패스',
    at: Date.now()
  });
  nextTurnOrVote(room);
}

function openVote(room) {
  if (!room || room.state !== 'hint') return;
  room.state = 'vote';
  room.votes = {};
  setPhaseTimer(room, 45, () => finishVote(room));
  emitRoom(room);
}

function submitVote(room, voterId, targetId) {
  if (room.state !== 'vote') return;
  if (!room.players.some(p => p.id === voterId)) return;
  if (!room.players.some(p => p.id === targetId)) return;
  room.votes[voterId] = targetId;
  if (Object.keys(room.votes).length >= room.players.length) {
    finishVote(room);
  } else {
    emitRoom(room);
  }
}

function tallyVotes(room) {
  const tally = {};
  for (const targetId of Object.values(room.votes)) {
    tally[targetId] = (tally[targetId] || 0) + 1;
  }
  let max = -1;
  let suspects = [];
  for (const p of room.players) {
    const count = tally[p.id] || 0;
    if (count > max) {
      max = count;
      suspects = [p.id];
    } else if (count === max) {
      suspects.push(p.id);
    }
  }
  return { tally, suspects, selectedId: randomItem(suspects) };
}

function finishVote(room) {
  if (!room || room.state !== 'vote') return;
  clearRoomTimer(room);
  const result = tallyVotes(room);
  const caught = result.selectedId === room.liarId;
  room.voteResult = result;
  if (caught) {
    room.state = 'finalGuess';
    setPhaseTimer(room, 30, () => finishRound(room, false, '라이어가 잡혔고, 최종 단어 맞히기에 실패했습니다.'));
  } else {
    finishRound(room, true, '투표로 라이어를 찾지 못했습니다.');
    return;
  }
  emitRoom(room);
}

function finishRound(room, liarWin, reason) {
  clearRoomTimer(room);
  room.state = 'result';
  const liar = room.players.find(p => p.id === room.liarId);
  const citizens = room.players.filter(p => p.id !== room.liarId);
  if (liarWin) {
    room.scores[room.liarId] = (room.scores[room.liarId] || 0) + 10;
  } else {
    for (const c of citizens) room.scores[c.id] = (room.scores[c.id] || 0) + 5;
  }
  io.to(room.code).emit('round:result', {
    liarWin,
    reason,
    word: room.word,
    liarId: room.liarId,
    liarName: liar?.name || '알 수 없음',
    voteResult: room.voteResult || { tally: {}, suspects: [] }
  });
  emitRoom(room);
}

function submitFinalGuess(room, playerId, guess) {
  if (room.state !== 'finalGuess' || playerId !== room.liarId) return;
  room.finalGuess = sanitizeText(guess, 40);
  const normalizedGuess = room.finalGuess.replace(/\s/g, '').toLowerCase();
  const normalizedWord = room.word.replace(/\s/g, '').toLowerCase();
  if (normalizedGuess === normalizedWord) {
    finishRound(room, true, '라이어가 마지막 기회에서 단어를 맞혔습니다.');
  } else {
    finishRound(room, false, '라이어가 마지막 기회에서 단어를 맞히지 못했습니다.');
  }
}

function resetToLobby(room) {
  clearRoomTimer(room);
  room.state = 'lobby';
  room.word = '';
  room.liarId = null;
  room.turnIndex = 0;
  room.hints = [];
  room.votes = {};
  room.finalGuess = '';
  emitRoom(room);
}

io.on('connection', (socket) => {
  socket.on('room:create', ({ name, code } = {}) => {
    const room = createRoom(socket.id, name, code);
    socket.join(room.code);
    socket.emit('room:joined', { code: room.code, playerId: socket.id });
    emitRoom(room);
  });

  socket.on('room:join', ({ name, code } = {}) => {
    const roomCode = sanitizeText(code, 12).toUpperCase();
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('toast', '존재하지 않는 방 코드입니다.');
      return;
    }
    if (room.state !== 'lobby') {
      socket.emit('toast', '이미 게임이 진행 중입니다. 다음 라운드에 참여하세요.');
      return;
    }
    addPlayer(room, socket.id, name);
    socket.join(room.code);
    socket.emit('room:joined', { code: room.code, playerId: socket.id });
    emitRoom(room);
  });

  socket.on('game:start', ({ code, packKey } = {}) => {
    const room = rooms.get(sanitizeText(code, 12).toUpperCase());
    if (!room || room.hostId !== socket.id) return;
    startGame(room, packKey);
  });

  socket.on('hint:submit', ({ code, hint } = {}) => {
    const room = rooms.get(sanitizeText(code, 12).toUpperCase());
    if (!room) return;
    submitHint(room, socket.id, hint);
  });

  socket.on('vote:submit', ({ code, targetId } = {}) => {
    const room = rooms.get(sanitizeText(code, 12).toUpperCase());
    if (!room) return;
    submitVote(room, socket.id, targetId);
  });

  socket.on('guess:submit', ({ code, guess } = {}) => {
    const room = rooms.get(sanitizeText(code, 12).toUpperCase());
    if (!room) return;
    submitFinalGuess(room, socket.id, guess);
  });

  socket.on('game:reset', ({ code } = {}) => {
    const room = rooms.get(sanitizeText(code, 12).toUpperCase());
    if (!room || room.hostId !== socket.id) return;
    resetToLobby(room);
  });

  socket.on('disconnect', () => {
    for (const room of rooms.values()) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.connected = false;
        if (room.state === 'lobby') {
          room.players = room.players.filter(p => p.id !== socket.id);
          delete room.scores[socket.id];
          if (room.hostId === socket.id && room.players.length > 0) room.hostId = room.players[0].id;
        }
        if (room.players.length === 0) {
          clearRoomTimer(room);
          rooms.delete(room.code);
        } else {
          emitRoom(room);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Liar Game AI server running on http://localhost:${PORT}`);
});
