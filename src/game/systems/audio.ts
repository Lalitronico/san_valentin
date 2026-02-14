import Phaser from 'phaser';
import { MUSIC_TICK_MS } from '../constants';

let audioCtx: AudioContext | null = null;
let unlocked = false;
let muted = false;
let musicInterval: number | null = null;
let noteIndex = 0;

const ensureCtx = (): AudioContext | null => {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new AudioContext();
    return audioCtx;
  } catch {
    return null;
  }
};

const tone = (
  freq: number,
  duration = 0.32,
  type: OscillatorType = 'sine',
  gain = 0.03,
  release = 0.9,
  detune = 0
): void => {
  const ctx = ensureCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.value = 2500;

  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;

  const t0 = ctx.currentTime;
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration * release);

  osc.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + duration);
};

const pianoLike = (freq: number, gain = 0.028): void => {
  tone(freq, 0.48, 'sine', gain, 0.97);
  tone(freq * 2, 0.26, 'triangle', gain * 0.24, 0.82, -6);
  tone(freq * 0.5, 0.62, 'sine', gain * 0.17, 0.96);
  // Soft detuned tail for a sadder color.
  tone(freq * 1.003, 0.52, 'sine', gain * 0.1, 0.98, -12);
};

export const unlockAudio = async (): Promise<void> => {
  const ctx = ensureCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') await ctx.resume();
  unlocked = true;
};

export const isMuted = (): boolean => muted;

export const toggleMute = (): boolean => {
  muted = !muted;
  if (muted) {
    stopMusic();
  }
  return muted;
};

export const playTypeSound = (): void => {
  if (!unlocked || muted) return;
  tone(680 + Math.random() * 80, 0.04, 'triangle', 0.012, 0.8);
};

export const playStepSound = (): void => {
  if (!unlocked || muted) return;
  tone(130 + Math.random() * 40, 0.05, 'sine', 0.017, 0.7);
};

export const playConfirmSound = (): void => {
  if (!unlocked || muted) return;
  tone(520, 0.09, 'sine', 0.03, 0.8);
  setTimeout(() => tone(720, 0.11, 'triangle', 0.025, 0.82), 55);
};

export const playFanfare = (): void => {
  if (!unlocked || muted) return;
  [392, 440, 523, 659].forEach((f, i) => {
    setTimeout(() => pianoLike(f, 0.03), i * 120);
  });
};

export const startMusic = (_scene: Phaser.Scene): void => {
  if (!unlocked || muted) return;

  const ctx = ensureCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  if (musicInterval !== null) return;

  // Classic 8-bit RPG melody — nostalgic pixel adventure (C major, I-V-vi-IV).
  const lead: Array<number | null> = [
    329.63, null, 392.00, null, 523.25, null, 392.00, null,   // E4-G4-C5-G4 (arpeggio up)
    293.66, null, 392.00, null, 493.88, null, 392.00, null,   // D4-G4-B4-G4
    261.63, null, 329.63, null, 440.00, null, 329.63, null,   // C4-E4-A4-E4
    261.63, null, 349.23, null, 440.00, null, 349.23, null,   // C4-F4-A4-F4
    523.25, null, 493.88, null, 440.00, null, 392.00, null,   // C5-B4-A4-G4 (descending)
    440.00, null, 392.00, null, 349.23, null, 329.63, null,   // A4-G4-F4-E4
    293.66, null, 329.63, null, 349.23, null, 392.00, null,   // D4-E4-F4-G4 (rising)
    329.63, null, 293.66, null, 261.63, null, null, null       // E4-D4-C4--- (resolve)
  ];
  // Sparse counter (triangle, chord tones).
  const counter: Array<number | null> = [
    null, null, null, null, 196.00, null, null, null,
    null, null, null, null, 246.94, null, null, null,
    null, null, null, null, 220.00, null, null, null,
    null, null, null, null, 174.61, null, null, null,
    null, null, null, null, 261.63, null, null, null,
    null, null, null, null, 220.00, null, null, null,
    null, null, null, null, 174.61, null, null, null,
    null, null, null, null, 196.00, null, null, null
  ];
  // Bass (root notes, triangle).
  const bass = [130.81, 98.00, 110.00, 87.31, 130.81, 110.00, 87.31, 98.00];

  noteIndex = 0;
  musicInterval = window.setInterval(() => {
    if (!unlocked) return;
    const l = lead[noteIndex % lead.length];
    const c = counter[noteIndex % counter.length];
    if (l) tone(l, 0.14, 'square', 0.016, 0.8);
    if (c && noteIndex % 2 === 0) tone(c, 0.22, 'triangle', 0.009, 0.85);
    if (noteIndex % 4 === 0) {
      tone(bass[Math.floor(noteIndex / 4) % bass.length], 0.32, 'triangle', 0.011, 0.9);
    }
    noteIndex += 1;
  }, MUSIC_TICK_MS);
};

export const stopMusic = (): void => {
  if (musicInterval !== null) {
    window.clearInterval(musicInterval);
    musicInterval = null;
  }
};
