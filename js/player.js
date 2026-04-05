// =============================================
// player.js — Music player bar logic
// =============================================

let playing = false;
let currentBeatIndex = 0;
let currentSeconds = 0;
const previewLength = 30;

const playBtn = document.getElementById('playBtn');
const progressFill = document.getElementById('progressFill');
const currentTime = document.getElementById('currentTime');
const playerTrack = document.querySelector('.player-track');
const playerArtist = document.querySelector('.player-artist');
const playerThumb = document.querySelector('.player-thumb');
const controlButtons = document.querySelectorAll('.ctrl-btn');

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateProgressUI() {
  const ratio = Math.min(1, currentSeconds / previewLength);
  progressFill.style.width = `${ratio * 100}%`;
  currentTime.textContent = formatTime(currentSeconds);
}

function loadBeat(index) {
  if (!BEATS_DATA.length) return;
  const safeIndex = (index + BEATS_DATA.length) % BEATS_DATA.length;
  const beat = BEATS_DATA[safeIndex];
  currentBeatIndex = safeIndex;
  currentSeconds = 0;

  playerTrack.textContent = beat.name;
  playerArtist.textContent = `Kentbeats · ${beat.genre}`;
  playerThumb.textContent = beat.emoji;
  updateProgressUI();
}

function setPlaying(nextState) {
  playing = nextState;
  playBtn.textContent = playing ? '⏸' : '▶';
}

playBtn.addEventListener('click', () => {
  setPlaying(!playing);
});

if (controlButtons.length >= 2) {
  controlButtons[0].addEventListener('click', () => {
    loadBeat(currentBeatIndex - 1);
    setPlaying(true);
  });

  controlButtons[1].addEventListener('click', () => {
    loadBeat(currentBeatIndex + 1);
    setPlaying(true);
  });
}

document.addEventListener('beat:selected', event => {
  const selected = event.detail;
  const nextIndex = BEATS_DATA.findIndex(item => item.name === selected.name);
  if (nextIndex >= 0) {
    loadBeat(nextIndex);
    setPlaying(true);
  }
});

document.addEventListener('beats:data-updated', () => {
  currentBeatIndex = 0;
  loadBeat(0);
  setPlaying(false);
});

setInterval(() => {
  if (!playing) return;

  currentSeconds += 1;
  updateProgressUI();

  if (currentSeconds >= previewLength) {
    setPlaying(false);
  }
}, 1000);

loadBeat(0);
