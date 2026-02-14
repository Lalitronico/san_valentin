import Phaser from 'phaser';

let audioCtx: AudioContext | null = null;
let unlocked = false;
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

export const playTypeSound = (): void => {
  if (!unlocked) return;
  tone(680 + Math.random() * 80, 0.04, 'triangle', 0.012, 0.8);
};

export const playStepSound = (): void => {
  if (!unlocked) return;
  tone(130 + Math.random() * 40, 0.05, 'sine', 0.017, 0.7);
};

export const playConfirmSound = (): void => {
  if (!unlocked) return;
  tone(520, 0.09, 'sine', 0.03, 0.8);
  setTimeout(() => tone(720, 0.11, 'triangle', 0.025, 0.82), 55);
};

export const playFanfare = (): void => {
  if (!unlocked) return;
  [392, 440, 523, 659].forEach((f, i) => {
    setTimeout(() => pianoLike(f, 0.03), i * 120);
  });
};

export const startMusic = (_scene: Phaser.Scene): void => {
  if (!unlocked) return;

  const ctx = ensureCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  if (musicInterval !== null) return;

  // Sad 64-bit motif in A minor (clear phrase + answer).
  const lead: Array<number | null> = [
    440.0, null, 392.0, null, 349.23, null, 329.63, null,
    392.0, null, 349.23, null, 329.63, null, 293.66, null,
    329.63, null, 349.23, null, 392.0, null, 329.63, null,
    293.66, null, 261.63, null, 246.94, null, 220.0, null
  ];
  // Subtle counter-voice to keep emotional tension.
  const counter: Array<number | null> = [
    261.63, null, 293.66, null, 261.63, null, 246.94, null,
    220.0, null, 246.94, null, 220.0, null, 196.0, null,
    220.0, null, 246.94, null, 261.63, null, 246.94, null,
    220.0, null, 196.0, null, 174.61, null, 164.81, null
  ];
  // Bass roots per harmony block.
  const bass = [110.0, 98.0, 87.31, 82.41, 73.42, 65.41, 73.42, 82.41];

  noteIndex = 0;
  musicInterval = window.setInterval(() => {
    if (!unlocked) return;
    const l = lead[noteIndex % lead.length];
    const c = counter[noteIndex % counter.length];
    if (l) {
      tone(l, 0.2, 'square', 0.024, 0.9);
      tone(l * 2, 0.12, 'triangle', 0.008, 0.78, -4);
    }
    if (c && noteIndex % 2 === 0) {
      tone(c, 0.18, 'triangle', 0.011, 0.88);
    }
    if (noteIndex % 4 === 0) {
      tone(bass[Math.floor(noteIndex / 4) % bass.length], 0.32, 'square', 0.012, 0.92);
    }
    noteIndex += 1;
  }, 210);
};

export const stopMusic = (): void => {
  if (musicInterval !== null) {
    window.clearInterval(musicInterval);
    musicInterval = null;
  }
};
