const socket = io();

const $ = (id) => document.getElementById(id);

const els = {
  multiTab: $('multiTab'),
  soloTab: $('soloTab'),
  multiMode: $('multiMode'),
  soloMode: $('soloMode'),
  nicknameInput: $('nicknameInput'),
  roomCodeInput: $('roomCodeInput'),
  createRoomBtn: $('createRoomBtn'),
  joinRoomBtn: $('joinRoomBtn'),
  joinCard: $('joinCard'),
  roomCard: $('roomCard'),
  roomCodeTitle: $('roomCodeTitle'),
  copyCodeBtn: $('copyCodeBtn'),
  gameStatus: $('gameStatus'),
  roundText: $('roundText'),
  timerText: $('timerText'),
  secretPanel: $('secretPanel'),
  secretTitle: $('secretTitle'),
  secretDesc: $('secretDesc'),
  hostControls: $('hostControls'),
  packSelect: $('packSelect'),
  startGameBtn: $('startGameBtn'),
  resetGameBtn: $('resetGameBtn'),
  multiGameArea: $('multiGameArea'),
  playerCount: $('playerCount'),
  playerList: $('playerList'),
  turnBadge: $('turnBadge'),
  hintInputBox: $('hintInputBox'),
  hintInput: $('hintInput'),
  submitHintBtn: $('submitHintBtn'),
  voteBox: $('voteBox'),
  voteButtons: $('voteButtons'),
  finalGuessBox: $('finalGuessBox'),
  finalGuessInput: $('finalGuessInput'),
  submitGuessBtn: $('submitGuessBtn'),
  resultBox: $('resultBox'),
  hintLogCard: $('hintLogCard'),
  hintLog: $('hintLog'),
  toast: $('toast'),

  soloNameInput: $('soloNameInput'),
  soloPackSelect: $('soloPackSelect'),
  startSoloBtn: $('startSoloBtn'),
  soloPhaseBadge: $('soloPhaseBadge'),
  soloSecretPanel: $('soloSecretPanel'),
  soloSecretTitle: $('soloSecretTitle'),
  soloSecretDesc: $('soloSecretDesc'),
  soloUserHintBox: $('soloUserHintBox'),
  soloHintInput: $('soloHintInput'),
  soloSubmitHintBtn: $('soloSubmitHintBtn'),
  soloVoteBox: $('soloVoteBox'),
  soloVoteButtons: $('soloVoteButtons'),
  soloFinalGuessBox: $('soloFinalGuessBox'),
  soloFinalGuessInput: $('soloFinalGuessInput'),
  soloSubmitGuessBtn: $('soloSubmitGuessBtn'),
  soloResultBox: $('soloResultBox'),
  soloLogCard: $('soloLogCard'),
  soloLog: $('soloLog')
};

const wordPacks = {
  easy: {
    name: '쉬움',
    words: ['사과', '바나나', '피자', '라면', '치킨', '커피', '우산', '자동차', '자전거', '강아지', '고양이', '학교', '병원', '편의점', '영화관', '바다', '산', '비행기', '핸드폰', '컴퓨터']
  },
  office: {
    name: '직장/공공기관',
    words: ['회의', '출장', '연가', '공문', '민원', '보고서', '결재', '예산', '감사', '부서', '전화번호부', '엑셀', '공지사항', '보도자료', '청렴', '교육', '협조문', '자료제출', '업무분장', '전산실']
  },
  hard: {
    name: '어려움',
    words: ['블록체인', '메타버스', '양자컴퓨터', '기후변화', '인공지능', '자동매매', '데이터베이스', '클라우드', '보안', '알고리즘', '증강현실', '가상화폐', '우주정거장', '사물인터넷', '자율주행', '딥러닝', '서버리스', '렌더링', '네트워크', '암호화']
  }
};

const hintBank = {
  사과: ['빨간색이 떠올라요', '과일입니다', '아침에 먹기 좋아요', '상큼한 느낌입니다'],
  바나나: ['노란색이 떠올라요', '껍질을 벗겨요', '간식으로 좋아요', '원숭이가 생각나요'],
  피자: ['둥글게 나눠 먹어요', '치즈가 중요해요', '배달 음식입니다', '토핑이 많아요'],
  라면: ['국물이 있습니다', '빨리 만들 수 있어요', '야식 느낌입니다', '면이 들어갑니다'],
  치킨: ['배달 음식입니다', '바삭한 느낌입니다', '맥주랑 자주 나와요', '닭과 관련 있습니다'],
  커피: ['잠을 깨워줘요', '카페에서 자주 봐요', '쓴맛이 있어요', '아침에 많이 마셔요'],
  우산: ['비 오는 날 필요해요', '펴서 씁니다', '가방에 넣기도 해요', '젖는 걸 막아줘요'],
  자동차: ['바퀴가 있어요', '이동할 때 씁니다', '운전이 필요해요', '도로와 관련 있습니다'],
  자전거: ['페달을 밟아요', '두 바퀴입니다', '운동도 됩니다', '헬멧이 생각나요'],
  강아지: ['귀여운 동물입니다', '산책을 좋아해요', '꼬리를 흔들어요', '멍멍 소리가 납니다'],
  고양이: ['조용한 동물입니다', '집사라는 말이 떠올라요', '야옹 합니다', '높은 곳을 좋아해요'],
  학교: ['공부하는 곳입니다', '교실이 있어요', '학생들이 갑니다', '시험이 떠올라요'],
  병원: ['아플 때 가요', '의사가 있습니다', '진료를 봅니다', '주사가 떠오릅니다'],
  편의점: ['24시간이 떠올라요', '간단히 사기 좋아요', '도시락이 있습니다', '집 근처에 많아요'],
  영화관: ['큰 화면이 있어요', '팝콘이 떠올라요', '좌석이 많아요', '조용히 봐야 해요'],
  바다: ['파도가 있어요', '여름이 떠올라요', '짠 냄새가 납니다', '수평선이 보여요'],
  산: ['올라가야 해요', '등산이 떠올라요', '공기가 좋습니다', '나무가 많아요'],
  비행기: ['하늘을 납니다', '공항과 관련 있어요', '여행이 떠올라요', '좌석벨트를 맵니다'],
  핸드폰: ['매일 들고 다녀요', '연락할 때 씁니다', '충전이 필요해요', '화면이 있습니다'],
  컴퓨터: ['키보드가 떠올라요', '일할 때 씁니다', '프로그램과 관련 있어요', '모니터가 필요해요'],

  회의: ['여러 명이 모입니다', '의견을 나눠요', '자료가 필요해요', '시간이 길어질 수 있어요'],
  출장: ['다른 장소로 갑니다', '보고가 필요할 수 있어요', '교통비가 떠올라요', '업무 목적입니다'],
  연가: ['쉬는 날입니다', '신청해야 해요', '개인 일정과 관련 있어요', '직장인이 좋아합니다'],
  공문: ['문서 형식입니다', '기관끼리 주고받아요', '제목과 본문이 있어요', '결재가 필요할 수 있어요'],
  민원: ['주민 요청입니다', '답변이 중요해요', '처리 기한이 있어요', '전화가 올 수 있어요'],
  보고서: ['정리해서 제출합니다', '표와 문장이 들어가요', '상급자가 볼 수 있어요', '작성 시간이 걸려요'],
  결재: ['승인이 필요해요', '위로 올라갑니다', '문서와 관련 있어요', '전결이 떠오릅니다'],
  예산: ['돈과 관련 있어요', '편성이 중요합니다', '집행이 필요해요', '숫자가 많습니다'],
  감사: ['점검 느낌입니다', '자료 제출이 떠올라요', '긴장되는 업무입니다', '근거가 중요해요'],
  부서: ['조직 단위입니다', '사람들이 나뉘어 있어요', '업무가 다릅니다', '사무실이 떠올라요'],
  전화번호부: ['연락처가 모여 있어요', '부서별로 정리합니다', '엑셀과 잘 어울려요', '찾기 기능이 중요해요'],
  엑셀: ['표 계산이 됩니다', '셀을 사용합니다', '자동화와 잘 맞아요', '파일 정리에 씁니다'],
  공지사항: ['알리는 글입니다', '홈페이지에 올라갑니다', '많은 사람이 봐요', '제목이 중요해요'],
  보도자료: ['언론과 관련 있어요', '홍보 느낌입니다', '문장을 잘 써야 해요', '사진이 들어갈 수 있어요'],
  청렴: ['공직 가치입니다', '부패와 반대됩니다', '교육에서 자주 나와요', '깨끗한 이미지입니다'],
  교육: ['배우는 시간입니다', '강사가 있을 수 있어요', '이수 여부가 중요해요', '자료가 배포됩니다'],
  협조문: ['도움을 요청합니다', '다른 부서와 관련 있어요', '문서로 보냅니다', '기한이 있을 수 있어요'],
  자료제출: ['파일을 보내야 해요', '기한이 중요합니다', '정리가 필요해요', '요청받는 경우가 많아요'],
  업무분장: ['누가 무엇을 하는지 정합니다', '담당자가 중요해요', '조직표와 비슷해요', '변경될 수 있어요'],
  전산실: ['컴퓨터 장비가 있어요', '서버와 관련 있어요', '시원한 곳이 떠올라요', '정보통신과 느낌입니다'],

  블록체인: ['분산 저장이 떠올라요', '코인과 관련 있어요', '장부 느낌입니다', '위변조가 어렵다고 해요'],
  메타버스: ['가상 공간입니다', '아바타가 떠올라요', '온라인에서 만납니다', '게임 느낌도 있어요'],
  양자컴퓨터: ['미래 기술입니다', '큐비트가 떠올라요', '엄청 빠를 수 있어요', '어렵습니다'],
  기후변화: ['지구와 관련 있어요', '온도가 떠올라요', '환경 문제입니다', '장기적인 변화입니다'],
  인공지능: ['요즘 많이 씁니다', '학습한다는 느낌입니다', '자동화와 관련 있어요', '챗봇이 떠오릅니다'],
  자동매매: ['규칙대로 거래합니다', 'API가 필요할 수 있어요', '차트를 봅니다', '리스크 관리가 중요합니다'],
  데이터베이스: ['저장 공간입니다', '테이블이 있어요', '검색이 중요합니다', '서버와 연결됩니다'],
  클라우드: ['인터넷 서버입니다', '배포와 관련 있어요', '저장도 가능합니다', '확장이 쉬워요'],
  보안: ['막아야 합니다', '비밀번호가 떠올라요', '권한이 중요해요', '침해 사고와 관련 있어요'],
  알고리즘: ['절차입니다', '문제를 푸는 방법입니다', '코딩에서 중요해요', '효율을 따집니다'],
  증강현실: ['현실 위에 겹쳐 보여요', '카메라가 떠올라요', 'AR이라고 합니다', '가상과 현실이 섞입니다'],
  가상화폐: ['거래소가 떠올라요', '가격 변동이 큽니다', '지갑이 필요할 수 있어요', '블록체인과 관련 있어요'],
  우주정거장: ['지구 밖에 있어요', '우주인이 떠올라요', '떠다니는 느낌입니다', '연구 시설입니다'],
  사물인터넷: ['기기들이 연결됩니다', '센서가 떠올라요', '스마트홈과 관련 있어요', '데이터를 주고받아요'],
  자율주행: ['운전자가 덜 필요해요', '센서가 중요합니다', '차와 관련 있어요', '미래 교통입니다'],
  딥러닝: ['AI 기술입니다', '신경망이 떠올라요', '데이터가 많이 필요해요', '학습과 관련 있어요'],
  서버리스: ['서버 관리를 덜 합니다', '클라우드와 관련 있어요', '함수 단위가 떠올라요', '배포 방식입니다'],
  렌더링: ['화면을 그립니다', '그래픽과 관련 있어요', '브라우저에서도 합니다', '결과물을 보여줘요'],
  네트워크: ['연결입니다', 'IP가 떠올라요', '인터넷과 관련 있어요', '통신이 중요합니다'],
  암호화: ['내용을 숨깁니다', '키가 필요해요', '보안과 관련 있어요', '복호화가 짝입니다']
};

const vagueHints = [
  '일상에서 볼 수 있어요', '사람마다 다르게 생각할 수 있어요', '중요한 것 같아요', '상황에 따라 필요합니다',
  '어디선가 많이 들어봤어요', '생각보다 자주 나와요', '설명하기 애매하네요', '관련된 게 많습니다', '느낌은 알 것 같아요'
];

let currentRoom = null;
let currentPlayerId = null;
let currentRoomState = null;
let currentSecret = { role: null, word: '', isYourTurn: false };
let tickTimer = null;
let lastRoundResult = null;
let voted = false;
let guessed = false;

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.add('hidden'), 2400);
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(value) {
  return String(value || '').replace(/\s/g, '').toLowerCase();
}

function switchMode(mode) {
  const multi = mode === 'multi';
  els.multiMode.classList.toggle('active', multi);
  els.soloMode.classList.toggle('active', !multi);
  els.multiTab.classList.toggle('active', multi);
  els.soloTab.classList.toggle('active', !multi);
}

els.multiTab.addEventListener('click', () => switchMode('multi'));
els.soloTab.addEventListener('click', () => switchMode('solo'));

function getNickname() {
  return els.nicknameInput.value.trim() || '익명';
}

els.createRoomBtn.addEventListener('click', () => {
  socket.emit('room:create', {
    name: getNickname(),
    code: els.roomCodeInput.value.trim()
  });
});

els.joinRoomBtn.addEventListener('click', () => {
  const code = els.roomCodeInput.value.trim();
  if (!code) return showToast('입장할 방 코드를 입력하세요.');
  socket.emit('room:join', { name: getNickname(), code });
});

els.copyCodeBtn.addEventListener('click', async () => {
  if (!currentRoom) return;
  try {
    await navigator.clipboard.writeText(currentRoom.code);
    showToast('방 코드를 복사했습니다.');
  } catch {
    showToast(`방 코드: ${currentRoom.code}`);
  }
});

els.startGameBtn.addEventListener('click', () => {
  if (!currentRoom) return;
  socket.emit('game:start', { code: currentRoom.code, packKey: els.packSelect.value });
});

els.resetGameBtn.addEventListener('click', () => {
  if (!currentRoom) return;
  socket.emit('game:reset', { code: currentRoom.code });
});

els.submitHintBtn.addEventListener('click', submitMultiHint);
els.hintInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitMultiHint();
});

function submitMultiHint() {
  if (!currentRoom) return;
  const hint = els.hintInput.value.trim();
  socket.emit('hint:submit', { code: currentRoom.code, hint });
  els.hintInput.value = '';
}

els.submitGuessBtn.addEventListener('click', submitFinalGuess);
els.finalGuessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitFinalGuess();
});

function submitFinalGuess() {
  if (!currentRoom || guessed) return;
  guessed = true;
  socket.emit('guess:submit', { code: currentRoom.code, guess: els.finalGuessInput.value.trim() });
}

socket.on('toast', showToast);

socket.on('room:joined', ({ code, playerId }) => {
  currentPlayerId = playerId;
  els.joinCard.classList.add('hidden');
  els.roomCard.classList.remove('hidden');
  els.multiGameArea.classList.remove('hidden');
  els.hintLogCard.classList.remove('hidden');
  showToast(`${code} 방에 입장했습니다.`);
});

socket.on('room:update', (room) => {
  const prevState = currentRoomState;
  currentRoom = room;
  currentRoomState = room.state;
  if (room.state !== prevState) {
    voted = false;
    guessed = false;
    els.resultBox.classList.add('hidden');
  }
  renderRoom(room);
});

socket.on('player:secret', (secret) => {
  currentSecret = secret;
  renderSecret();
  renderActions();
});

socket.on('round:result', (result) => {
  lastRoundResult = result;
  renderResult(result);
});

function statusText(state) {
  return {
    lobby: '대기실',
    hint: '힌트 작성 중',
    vote: '라이어 투표 중',
    finalGuess: '라이어 최종 추측',
    result: '결과 발표'
  }[state] || state;
}

function renderRoom(room) {
  els.roomCodeTitle.textContent = room.code;
  els.gameStatus.textContent = statusText(room.state);
  els.roundText.textContent = `${room.round}`;
  els.playerCount.textContent = `${room.players.length}명`;
  els.hostControls.classList.toggle('hidden', room.hostId !== currentPlayerId);
  els.packSelect.value = room.packKey || 'easy';
  els.startGameBtn.disabled = room.state !== 'lobby' || room.players.length < 3;
  els.resetGameBtn.disabled = room.state === 'lobby';

  renderPlayers(room);
  renderHintLog(room.hints || []);
  renderTurn(room);
  renderActions();
  startTimer(room.timerEndsAt);
}

function renderPlayers(room) {
  els.playerList.innerHTML = room.players.map((p) => {
    const isTurn = p.id === room.turnPlayerId && room.state === 'hint';
    return `
      <div class="player-card">
        <div>
          <div class="player-name">${safe(p.name)}</div>
          <div class="player-meta">
            <span>${p.score || 0}점</span>
            ${p.id === room.hostId ? '<span class="badge host">방장</span>' : ''}
            ${isTurn ? '<span class="badge turn">현재 차례</span>' : ''}
            ${!p.connected ? '<span class="badge offline">오프라인</span>' : ''}
          </div>
        </div>
        <span class="pill">${p.id === currentPlayerId ? '나' : '참가자'}</span>
      </div>
    `;
  }).join('');
}

function renderHintLog(hints) {
  if (!hints.length) {
    els.hintLog.innerHTML = '<p class="muted">아직 제출된 힌트가 없습니다.</p>';
    return;
  }
  els.hintLog.innerHTML = hints.map((h, index) => `
    <div class="hint-item">
      <strong>${index + 1}. ${safe(h.playerName)}</strong>
      <p>${safe(h.text)}</p>
    </div>
  `).join('');
}

function renderTurn(room) {
  const turnPlayer = room.players.find(p => p.id === room.turnPlayerId);
  if (room.state === 'hint' && turnPlayer) {
    els.turnBadge.textContent = `${turnPlayer.name} 차례`;
  } else if (room.state === 'vote') {
    els.turnBadge.textContent = `투표 ${room.votesCount}/${room.totalPlayers}`;
  } else {
    els.turnBadge.textContent = statusText(room.state);
  }
}

function renderSecret() {
  if (!currentRoom || currentRoom.state === 'lobby') {
    els.secretTitle.textContent = '대기 중';
    els.secretDesc.textContent = '게임이 시작되면 내 역할과 단어가 표시됩니다.';
    return;
  }
  if (currentSecret.role === 'liar') {
    els.secretTitle.textContent = '당신은 라이어입니다';
    els.secretDesc.textContent = '단어를 모릅니다. 다른 사람들의 힌트를 보고 자연스럽게 속여보세요.';
  } else if (currentSecret.role === 'citizen') {
    els.secretTitle.textContent = `단어: ${currentSecret.word}`;
    els.secretDesc.textContent = '당신은 시민입니다. 단어를 직접 말하지 말고 라이어를 헷갈리게 하는 힌트를 주세요.';
  } else {
    els.secretTitle.textContent = '대기 중';
    els.secretDesc.textContent = '게임이 시작되면 내 역할과 단어가 표시됩니다.';
  }
}

function renderActions() {
  if (!currentRoom) return;
  els.hintInputBox.classList.toggle('hidden', !(currentRoom.state === 'hint' && currentSecret.isYourTurn));
  els.voteBox.classList.toggle('hidden', currentRoom.state !== 'vote' || voted);
  els.finalGuessBox.classList.toggle('hidden', !(currentRoom.state === 'finalGuess' && currentSecret.canFinalGuess && !guessed));

  if (currentRoom.state === 'vote' && !voted) {
    els.voteButtons.innerHTML = currentRoom.players.map(p => `
      <button type="button" data-vote-id="${safe(p.id)}">${safe(p.name)}</button>
    `).join('');
    els.voteButtons.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        voted = true;
        socket.emit('vote:submit', { code: currentRoom.code, targetId: btn.dataset.voteId });
        renderActions();
      });
    });
  }
}

function renderResult(result) {
  const winClass = result.liarWin ? 'lose' : '';
  const title = result.liarWin ? '라이어 승리' : '시민 승리';
  els.resultBox.className = `result-box ${winClass}`;
  els.resultBox.innerHTML = `
    <h3>${title}</h3>
    <p><strong>정답 단어:</strong> ${safe(result.word)}</p>
    <p><strong>라이어:</strong> ${safe(result.liarName)}</p>
    <p>${safe(result.reason)}</p>
  `;
  els.resultBox.classList.remove('hidden');
}

function startTimer(endsAt) {
  clearInterval(tickTimer);
  if (!endsAt) {
    els.timerText.textContent = '-';
    return;
  }
  function update() {
    const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    els.timerText.textContent = `${left}초`;
  }
  update();
  tickTimer = setInterval(update, 500);
}

// Solo AI mode
let solo = null;

function createSoloGame() {
  const userName = els.soloNameInput.value.trim() || '나';
  const packKey = els.soloPackSelect.value;
  const word = randomItem(wordPacks[packKey].words);
  const players = [
    { id: 'user', name: userName, ai: false, score: 0 },
    { id: 'ai1', name: 'AI 민지', ai: true, personality: 'calm', score: 0 },
    { id: 'ai2', name: 'AI 준호', ai: true, personality: 'bold', score: 0 },
    { id: 'ai3', name: 'AI 서연', ai: true, personality: 'logic', score: 0 }
  ];
  const liar = randomItem(players).id;
  solo = {
    packKey,
    word,
    players,
    liar,
    phase: 'hint',
    hints: [],
    votes: {},
    userVoted: false,
    finalGuessUsed: false,
    aiSuspicion: {}
  };
  renderSolo();
  runAiHintsBeforeUser();
}

els.startSoloBtn.addEventListener('click', createSoloGame);
els.soloSubmitHintBtn.addEventListener('click', submitSoloUserHint);
els.soloHintInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitSoloUserHint();
});
els.soloSubmitGuessBtn.addEventListener('click', submitSoloFinalGuess);
els.soloFinalGuessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitSoloFinalGuess();
});

function renderSolo() {
  if (!solo) return;
  els.soloPhaseBadge.textContent = {
    hint: '힌트 작성',
    vote: '투표',
    finalGuess: '최종 추측',
    result: '결과'
  }[solo.phase] || '진행 중';

  const userIsLiar = solo.liar === 'user';
  if (userIsLiar) {
    els.soloSecretTitle.textContent = '당신은 라이어입니다';
    els.soloSecretDesc.textContent = '단어를 모릅니다. AI들의 힌트를 보고 최대한 자연스럽게 속이세요.';
  } else {
    els.soloSecretTitle.textContent = `단어: ${solo.word}`;
    els.soloSecretDesc.textContent = '당신은 시민입니다. AI 중 숨어 있는 라이어를 찾아야 합니다.';
  }

  els.soloUserHintBox.classList.toggle('hidden', solo.phase !== 'hint' || solo.hints.some(h => h.playerId === 'user'));
  els.soloVoteBox.classList.toggle('hidden', solo.phase !== 'vote' || solo.userVoted);
  els.soloFinalGuessBox.classList.toggle('hidden', !(solo.phase === 'finalGuess' && solo.liar === 'user' && !solo.finalGuessUsed));
  els.soloResultBox.classList.toggle('hidden', solo.phase !== 'result');
  els.soloLogCard.classList.remove('hidden');
  renderSoloLog();
  renderSoloVoteButtons();
}

function runAiHintsBeforeUser() {
  if (!solo) return;
  const aiPlayers = solo.players.filter(p => p.ai);
  aiPlayers.forEach((p, idx) => {
    setTimeout(() => {
      if (!solo || solo.phase !== 'hint') return;
      solo.hints.push({ playerId: p.id, playerName: p.name, text: makeAiHint(p), ai: true });
      renderSolo();
    }, 600 + idx * 500);
  });
}

function submitSoloUserHint() {
  if (!solo || solo.phase !== 'hint') return;
  const text = els.soloHintInput.value.trim() || '패스';
  solo.hints.push({ playerId: 'user', playerName: solo.players[0].name, text, ai: false });
  els.soloHintInput.value = '';
  solo.phase = 'vote';
  runAiVoting();
  renderSolo();
}

function makeAiHint(player) {
  const isLiar = player.id === solo.liar;
  if (isLiar) {
    const observed = solo.hints.map(h => h.text).join(' ');
    const guessedKeyword = inferKeywordFromHints(observed, solo.packKey);
    if (guessedKeyword && Math.random() > 0.45) {
      return randomItem(hintBank[guessedKeyword] || vagueHints);
    }
    return randomItem(vagueHints);
  }
  const hints = hintBank[solo.word] || [`${solo.word.length}글자입니다`, '주제와 관련이 있습니다'];
  let hint = randomItem(hints);
  if (player.personality === 'bold' && Math.random() > 0.5) hint = `${hint} 확실합니다`;
  if (player.personality === 'logic' && Math.random() > 0.5) hint = `${hint} / 범주는 ${wordPacks[solo.packKey].name}`;
  return hint;
}

function inferKeywordFromHints(text, packKey) {
  const words = wordPacks[packKey].words;
  const allHints = Object.entries(hintBank);
  let best = null;
  let bestScore = 0;
  for (const word of words) {
    const hints = (hintBank[word] || []).join(' ');
    const tokens = hints.split(/[\s/]+/).filter(t => t.length >= 2);
    const score = tokens.reduce((sum, token) => sum + (text.includes(token) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = word;
    }
  }
  if (bestScore > 0) return best;
  return allHints.find(([word]) => words.includes(word))?.[0] || null;
}

function runAiVoting() {
  if (!solo) return;
  const suspicions = calculateSuspicion();
  solo.aiSuspicion = suspicions;
  for (const ai of solo.players.filter(p => p.ai)) {
    const candidates = solo.players.filter(p => p.id !== ai.id);
    candidates.sort((a, b) => (suspicions[b.id] || 0) - (suspicions[a.id] || 0));
    let target = candidates[0];
    if (Math.random() < 0.18) target = randomItem(candidates);
    solo.votes[ai.id] = target.id;
  }
}

function calculateSuspicion() {
  const scores = {};
  for (const p of solo.players) scores[p.id] = 0;
  const concreteTokens = (hintBank[solo.word] || []).join(' ').split(/[\s/]+/).filter(t => t.length >= 2);
  for (const hint of solo.hints) {
    const text = hint.text;
    const overlap = concreteTokens.reduce((sum, token) => sum + (text.includes(token) ? 1 : 0), 0);
    if (overlap === 0) scores[hint.playerId] += 3;
    if (text.length < 5) scores[hint.playerId] += 2;
    if (vagueHints.some(v => text.includes(v.slice(0, 4)))) scores[hint.playerId] += 2;
    if (text.includes(solo.word)) scores[hint.playerId] += 4;
    if (hint.playerId === solo.liar) scores[hint.playerId] += 1.2;
  }
  return scores;
}

function renderSoloLog() {
  if (!solo) {
    els.soloLog.innerHTML = '<p class="muted">아직 게임이 없습니다.</p>';
    return;
  }
  const hintsHtml = solo.hints.map((h, index) => `
    <div class="hint-item">
      <strong>${index + 1}. ${safe(h.playerName)} ${h.ai ? '<span class="badge">AI</span>' : '<span class="badge turn">나</span>'}</strong>
      <p>${safe(h.text)}</p>
    </div>
  `).join('');

  const votesHtml = solo.phase === 'vote' || solo.phase === 'finalGuess' || solo.phase === 'result'
    ? `<div class="hint-item"><strong>AI 투표 완료</strong><p>${solo.players.filter(p => p.ai).map(ai => `${ai.name} → ${getSoloPlayerName(solo.votes[ai.id])}`).join('<br>')}</p></div>`
    : '';

  els.soloLog.innerHTML = hintsHtml + votesHtml || '<p class="muted">AI가 힌트를 작성 중입니다.</p>';
}

function renderSoloVoteButtons() {
  if (!solo || solo.phase !== 'vote' || solo.userVoted) return;
  els.soloVoteButtons.innerHTML = solo.players
    .filter(p => p.id !== 'user')
    .map(p => `<button type="button" data-solo-vote="${p.id}">${safe(p.name)}</button>`)
    .join('');
  els.soloVoteButtons.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      solo.userVoted = true;
      solo.votes.user = btn.dataset.soloVote;
      finishSoloVote();
    });
  });
}

function getSoloPlayerName(id) {
  return solo?.players.find(p => p.id === id)?.name || '-';
}

function finishSoloVote() {
  const result = tallySoloVotes();
  const caught = result.selectedId === solo.liar;
  solo.voteResult = result;
  if (caught && solo.liar === 'user') {
    solo.phase = 'finalGuess';
    renderSolo();
    return;
  }
  if (caught && solo.liar !== 'user') {
    // AI liar gets a final guess too. It infers from hints with a chance of success.
    const aiGuess = inferKeywordFromHints(solo.hints.map(h => h.text).join(' '), solo.packKey);
    const aiCorrect = normalize(aiGuess) === normalize(solo.word) && Math.random() > 0.25;
    if (aiCorrect) {
      finishSoloRound(true, `${getSoloPlayerName(solo.liar)}가 마지막 기회에서 단어를 맞혔습니다. AI 추측: ${aiGuess}`);
    } else {
      finishSoloRound(false, `라이어를 찾았습니다. AI 최종 추측 실패: ${aiGuess || '모름'}`);
    }
    return;
  }
  finishSoloRound(true, '투표로 라이어를 찾지 못했습니다.');
}

function tallySoloVotes() {
  const tally = {};
  for (const targetId of Object.values(solo.votes)) tally[targetId] = (tally[targetId] || 0) + 1;
  let max = -1;
  let suspects = [];
  for (const p of solo.players) {
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

function submitSoloFinalGuess() {
  if (!solo || solo.phase !== 'finalGuess') return;
  solo.finalGuessUsed = true;
  const guess = els.soloFinalGuessInput.value.trim();
  if (normalize(guess) === normalize(solo.word)) {
    finishSoloRound(true, `당신이 마지막 기회에서 단어를 맞혔습니다. 추측: ${guess}`);
  } else {
    finishSoloRound(false, `당신이 마지막 기회에서 단어를 맞히지 못했습니다. 추측: ${guess || '없음'}`);
  }
}

function finishSoloRound(liarWin, reason) {
  solo.phase = 'result';
  const title = liarWin ? '라이어 승리' : '시민 승리';
  const className = liarWin ? 'result-box lose' : 'result-box';
  const voteLines = Object.entries(solo.votes).map(([voter, target]) => `${getSoloPlayerName(voter)} → ${getSoloPlayerName(target)}`).join('<br>');
  els.soloResultBox.className = className;
  els.soloResultBox.innerHTML = `
    <h3>${title}</h3>
    <p><strong>정답 단어:</strong> ${safe(solo.word)}</p>
    <p><strong>라이어:</strong> ${safe(getSoloPlayerName(solo.liar))}</p>
    <p>${safe(reason)}</p>
    <p><strong>투표 결과</strong><br>${voteLines}</p>
  `;
  renderSolo();
}
