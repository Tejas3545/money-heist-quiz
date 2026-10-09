// Short mechanical cues synthesised with Web Audio (no audio files, no downloads).
// Loaded lazily and only after a user gesture.

let ctx: AudioContext | null = null;
let muted = false;

export function initAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

export function setMuted(m: boolean) {
  muted = m;
}

function env(gain: GainNode, t: number, peak: number, dur: number) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function noise(t: number, dur: number, freq: number, q: number, peak: number) {
  if (!ctx) return;
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
}

function tone(t: number, type: OscillatorType, from: number, to: number, dur: number, peak: number) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  env(g, t, peak, dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Wall-clock tick. `urgent` is the higher, tighter version for the last seconds. */
export function tick(urgent = false) {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  noise(t, 0.03, urgent ? 3200 : 2200, 6, urgent ? 0.5 : 0.3);
  tone(t, 'square', urgent ? 1500 : 1100, urgent ? 1200 : 900, 0.025, urgent ? 0.05 : 0.03);
}

/** Two-stage lock click. */
export function lock() {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  noise(t, 0.04, 1800, 4, 0.45);
  noise(t + 0.09, 0.07, 700, 3, 0.55);
  tone(t + 0.09, 'triangle', 220, 120, 0.07, 0.08);
}

/** Heavy vault bolt thud. */
export function thud() {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  tone(t, 'sine', 90, 38, 0.6, 0.6);
  noise(t, 0.25, 220, 1, 0.5);
  noise(t + 0.02, 0.05, 1400, 5, 0.25);
}
