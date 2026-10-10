// Money Heist Sound FX & Music Engine
// Supports both actual audio tracks (/audio/bella-ciao.mp3) and zero-latency Web Audio API synthesis

let ctx: AudioContext | null = null;
let muted = false; // Music is ON by default!
let songAudio: HTMLAudioElement | null = null;
let songPlaying = false;
let activeMelodyTimeouts: number[] = [];

/**
 * Initializes and resumes AudioContext and loads the real Money Heist theme song
 */
export function initAudio() {
  if (typeof window === 'undefined') return;

  // 1. Web Audio Context setup
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }

  // Play a silent 1ms buffer to bypass strict mobile autoplay policies
  try {
    if (ctx && ctx.state === 'running') {
      const silent = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = silent;
      src.connect(ctx.destination);
      src.start(0);
    }
  } catch {
    // ignore
  }

  // 2. HTML5 Audio Element for genuine Bella Ciao song playback
  if (!songAudio) {
    songAudio = new Audio('/audio/bella-ciao.mp3');
    songAudio.preload = 'auto';
    songAudio.volume = 0.85;
    songAudio.loop = true;
    songAudio.addEventListener('ended', () => {
      songPlaying = false;
    });

    if (!muted) {
      songAudio.play()
        .then(() => { songPlaying = true; })
        .catch(() => {
          // Will auto-play on first tap via user gesture listener
        });
    }
  }
}

/**
 * Unlocks audio immediately upon any user touch or click gesture and plays if unmuted
 */
export function unlockAudio() {
  initAudio();
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
  if (!muted && songAudio && songAudio.paused) {
    songAudio.loop = true;
    songAudio.play()
      .then(() => { songPlaying = true; })
      .catch(() => {});
  }
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    unlockAudio();
    if (ctx && ctx.state === 'running') {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    }
  };
  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });

  // Proactively attempt playback on initial load
  setTimeout(() => initAudio(), 100);
}

export function setMuted(m: boolean) {
  muted = m;
  if (songAudio) {
    songAudio.muted = m;
    if (m) {
      songAudio.pause();
      songPlaying = false;
    } else {
      songAudio.loop = true;
      songAudio.play()
        .then(() => {
          songPlaying = true;
        })
        .catch((err) => {
          console.warn('Playback pending interaction:', err);
        });
    }
  }
  if (m) {
    stopAllMelodies();
  }
}

export function toggleMute(): boolean {
  unlockAudio();
  const next = !muted;
  setMuted(next);
  return next;
}

export function isMuted(): boolean {
  return muted;
}

export function stopAllMelodies() {
  activeMelodyTimeouts.forEach((id) => clearTimeout(id));
  activeMelodyTimeouts = [];
}

export function stopAllMusic() {
  stopAllMelodies();
  pauseSong();
}

/**
 * Resumes or starts playback of the Money Heist song from the current timestamp (never resets to 0)
 */
export function resumeSong(loop = true) {
  if (typeof window === 'undefined' || muted) return;
  initAudio();
  if (songAudio) {
    songAudio.loop = loop;
    songAudio.muted = false;
    songAudio.play()
      .then(() => {
        songPlaying = true;
      })
      .catch((err) => {
        console.warn('Playback pending interaction:', err);
      });
  }
}

/**
 * Plays the song from current position, or starts if stopped
 */
export function playSong(loop = true) {
  resumeSong(loop);
}

export function pauseSong() {
  if (songAudio) {
    songAudio.pause();
    songPlaying = false;
  }
}

export function stopSong() {
  pauseSong();
}

export function isSongPlaying(): boolean {
  return songPlaying && !muted;
}

export function toggleSong(loop = true): boolean {
  return !toggleMute();
}

function env(gain: GainNode, t: number, peak: number, dur: number) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function noise(t: number, dur: number, freq: number, q: number, peak: number) {
  if (!ctx || muted) return;
  try {
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    env(g, t, peak, dur);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t);
  } catch {
    // ignore
  }
}

function playNote(freq: number, startTime: number, duration: number, peak = 0.25, type: OscillatorType = 'triangle') {
  if (!ctx || muted) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(peak * 0.7, startTime + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  } catch {
    // ignore
  }
}

/** Mechanical countdown tick sound */
export function tick(urgent = false) {
  initAudio();
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  noise(t, 0.04, urgent ? 3400 : 2200, 6, urgent ? 0.6 : 0.35);
  playNote(urgent ? 1500 : 1000, t, 0.03, urgent ? 0.12 : 0.06, 'square');
}

/** Vault lock / answer chosen click */
export function lock() {
  initAudio();
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  noise(t, 0.04, 1800, 4, 0.45);
  noise(t + 0.09, 0.07, 700, 3, 0.55);
  playNote(220, t + 0.09, 0.07, 0.1, 'triangle');
}

/** Vault bolt thud */
export function thud() {
  initAudio();
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  playNote(75, t, 0.6, 0.6, 'sine');
  noise(t, 0.25, 220, 1, 0.5);
  noise(t + 0.02, 0.05, 1400, 5, 0.25);
}

/** Money coins & falling cash rustle */
export function moneyChime() {
  initAudio();
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 4; i++) {
    const delay = i * 0.08;
    noise(t + delay, 0.12, 1600 + i * 400, 2, 0.25);
    playNote(1200 + i * 280, t + delay, 0.18, 0.08, 'sine');
  }
}

/**
 * Wrong Answer: Heavy jail door slam, prison lock clatter, and warning buzz
 */
export function jailEffect() {
  initAudio();
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  playNote(180, t, 0.5, 0.5, 'sawtooth');
  playNote(240, t, 0.45, 0.4, 'sawtooth');
  noise(t, 0.4, 450, 4, 0.6);

  playNote(65, t + 0.18, 0.6, 0.7, 'sine');
  noise(t + 0.18, 0.35, 180, 2, 0.7);

  playNote(110, t + 0.35, 0.6, 0.35, 'square');
  playNote(116, t + 0.35, 0.6, 0.35, 'square');
}

/**
 * Right Answer / Winner: Plays actual Bella Ciao song + harmonic fanfare
 */
export function bellaCiaoEffect() {
  initAudio();
  if (!ctx || muted) return;
  stopAllMusic();

  // 1. Trigger actual Money Heist song playback immediately
  playSong(false);

  // 2. Synthesize celebratory horn accompaniment
  const t0 = ctx.currentTime + 0.05;
  const notes = [
    { f: 329.63, d: 0.18, pause: 0.22 }, // E4
    { f: 440.00, d: 0.18, pause: 0.22 }, // A4
    { f: 493.88, d: 0.18, pause: 0.22 }, // B4
    { f: 523.25, d: 0.28, pause: 0.32 }, // C5
    { f: 440.00, d: 0.38, pause: 0.45 }, // A4

    { f: 329.63, d: 0.18, pause: 0.22 },
    { f: 440.00, d: 0.18, pause: 0.22 },
    { f: 493.88, d: 0.18, pause: 0.22 },
    { f: 523.25, d: 0.28, pause: 0.32 },
    { f: 440.00, d: 0.38, pause: 0.45 },

    { f: 329.63, d: 0.16, pause: 0.20 },
    { f: 440.00, d: 0.16, pause: 0.20 },
    { f: 493.88, d: 0.16, pause: 0.20 },
    { f: 523.25, d: 0.22, pause: 0.26 },
    { f: 493.88, d: 0.22, pause: 0.26 },
    { f: 440.00, d: 0.22, pause: 0.26 },
    { f: 523.25, d: 0.22, pause: 0.26 },
    { f: 493.88, d: 0.22, pause: 0.26 },
    { f: 440.00, d: 0.22, pause: 0.26 },
    { f: 659.25, d: 0.65, pause: 0.70 }, // E5
  ];

  let curTime = t0;
  for (const n of notes) {
    playNote(n.f, curTime, n.d, 0.35, 'triangle');
    if (n.f === 440.00 || n.f === 659.25) {
      playNote(n.f / 2, curTime, n.d * 1.4, 0.25, 'sine');
    }
    curTime += n.pause;
  }
}

/**
 * Top 10 Winner Firecracker Celebration explosions
 */
export function firecrackerEffect() {
  initAudio();
  if (!ctx || muted) return;
  const t0 = ctx.currentTime;

  for (let i = 0; i < 7; i++) {
    const popTime = t0 + i * 0.28 + (Math.random() * 0.08);
    playNote(600 + Math.random() * 400, popTime - 0.12, 0.12, 0.15, 'sine');
    noise(popTime, 0.25, 400 + Math.random() * 800, 2, 0.7);
    playNote(80 + Math.random() * 40, popTime, 0.35, 0.5, 'sine');
    for (let c = 0; c < 5; c++) {
      noise(popTime + 0.08 + c * 0.04, 0.03, 3000 + Math.random() * 2000, 8, 0.35);
    }
  }
}
