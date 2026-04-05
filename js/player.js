// =============================================
// player.js — Music player bar logic
// =============================================

let currentBeatIndex = 0;
let isPlaying = false;

const playBtn = document.getElementById('playBtn');
const progressFill = document.getElementById('progressFill');
const currentTime = document.getElementById('currentTime');
const durationTime = document.getElementById('durationTime');
const playerTrack = document.querySelector('.player-track');
const playerArtist = document.querySelector('.player-artist');
const playerThumb = document.querySelector('.player-thumb');
const progressTrack = document.querySelector('.progress-track');
const controlButtons = document.querySelectorAll('.ctrl-btn');
const volSlider = document.querySelector('.vol-slider');

const audio = new Audio();
audio.preload = 'metadata';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function setPlayingUI(nextState) {
  isPlaying = nextState;
  playBtn.textContent = isPlaying ? '⏸' : '▶';
}

function getBeatAt(index) {
  if (!BEATS_DATA.length) return null;
  const safeIndex = (index + BEATS_DATA.length) % BEATS_DATA.length;
  return { beat: BEATS_DATA[safeIndex], safeIndex };
}

function updateProgressUI() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const progress = duration > 0 ? (audio.currentTime / duration) * 100 : 0;
  progressFill.style.width = `${progress}%`;
  currentTime.textContent = formatTime(audio.currentTime);
  durationTime.textContent = formatTime(duration);
}

async function loadBeat(index, autoplay = false) {
  const item = getBeatAt(index);
  if (!item) return;

  const { beat, safeIndex } = item;
  currentBeatIndex = safeIndex;
  playerTrack.textContent = beat.name;
  playerArtist.textContent = `Kentbeats · ${beat.genre}`;
  playerThumb.textContent = beat.emoji;
  currentTime.textContent = '0:00';
  durationTime.textContent = '0:00';
  progressFill.style.width = '0%';

  if (!beat.streamUrl) {
    audio.removeAttribute('src');
    audio.load();
    setPlayingUI(false);
    return;
  }

  if (audio.src !== beat.streamUrl) {
    audio.src = beat.streamUrl;
    audio.load();
  }

  if (autoplay) {
    try {
      await audio.play();
      setPlayingUI(true);
    } catch {
      setPlayingUI(false);
      if (typeof showToast === 'function') {
        showToast('Tap play to start audio');
      }
    }
  } else {
    setPlayingUI(false);
  }
}

playBtn.addEventListener('click', async () => {
  if (!audio.src) {
    await loadBeat(currentBeatIndex, true);
    return;
  }

  if (audio.paused) {
    try {
      await audio.play();
      setPlayingUI(true);
    } catch {
      setPlayingUI(false);
    }
  } else {
    audio.pause();
    setPlayingUI(false);
  }
});

if (controlButtons.length >= 2) {
  controlButtons[0].addEventListener('click', () => {
    loadBeat(currentBeatIndex - 1, true);
  });

  controlButtons[1].addEventListener('click', () => {
    loadBeat(currentBeatIndex + 1, true);
  });
}

progressTrack?.addEventListener('click', event => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

  const rect = progressTrack.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  audio.currentTime = ratio * audio.duration;
  updateProgressUI();
});

volSlider?.addEventListener('input', () => {
  audio.volume = Number(volSlider.value) / 100;
});

document.addEventListener('beat:selected', event => {
  const selected = event.detail;
  const nextIndex = BEATS_DATA.findIndex(item => item.name === selected.name);
  if (nextIndex >= 0) {
    loadBeat(nextIndex, true);
  }
});

document.addEventListener('beats:data-updated', () => {
  currentBeatIndex = 0;
  loadBeat(0, false);
});

audio.addEventListener('loadedmetadata', updateProgressUI);
audio.addEventListener('timeupdate', updateProgressUI);
audio.addEventListener('pause', () => setPlayingUI(false));
audio.addEventListener('play', () => setPlayingUI(true));
audio.addEventListener('ended', () => setPlayingUI(false));

audio.volume = Number(volSlider?.value || 75) / 100;
loadBeat(0, false);
