// Web Audio synth used by flower hover events.
// 花朵悬停事件使用的 Web Audio 合成器。
import { NOTES } from "../config.js";
import { mapRange } from "../utils/math.js";

// Semitone offsets from A4.
// 相对 A4 的半音偏移。
const NOTE_BASE = {
  C: -9,
  "C#": -8,
  D: -7,
  "D#": -6,
  E: -5,
  F: -4,
  "F#": -3,
  G: -2,
  "G#": -1,
  A: 0,
  "A#": 1,
  B: 2,
};

export class FlowerAudio {
  constructor({ onStateChange } = {}) {
    // AudioContext is created lazily after a user gesture.
    // AudioContext 在用户交互后才延迟创建。
    this.context = null;
    this.enabled = false;
    this.onStateChange = onStateChange;
    this.errorReported = false;
  }

  // Enable audio after a click/tap.
  // 在点击/触摸后启用音频。
  async enable() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
      }
      await this.context.resume();
      this.enabled = true;
      this.onStateChange?.(this.enabled);
    } catch (error) {
      this.enabled = false;
      this.onStateChange?.(this.enabled);
      if (!this.errorReported) {
        console.warn("Unable to enable flower audio", error);
        this.errorReported = true;
      }
    }
  }

  // Play the main note, plus an occasional accent note.
  // 播放主音符，并偶尔加入一个装饰音。
  playFlower(flower) {
    if (!this.enabled || !this.context) return;

    try {
      const velocity = mapRange(flower.position.z, -1200, 320, 0.07, 0.15, true);
      this.playNote(flower.note, velocity, 0, 0.24);

      if (Math.random() > 0.72) {
        this.playNote(NOTES[Math.floor(Math.random() * NOTES.length)], velocity * 0.55, 0.08, 0.18);
      }
    } catch (error) {
      this.enabled = false;
      this.onStateChange?.(this.enabled);
      if (!this.errorReported) {
        console.warn("Flower sound disabled after playback error", error);
        this.errorReported = true;
      }
    }
  }

  // Simple ADSR-like note using oscillator + gain envelope.
  // 用 oscillator 和 gain 包络实现简单的 ADSR 音符。
  playNote(note, velocity, delay, duration) {
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(noteToFrequency(note), now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(velocity, 0.0001), now + 0.08);
    gain.gain.exponentialRampToValueAtTime(Math.max(velocity * 0.18, 0.0001), now + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 1.2);

    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 1.35);
  }
}

// Convert note names like F#4 to frequency in Hz.
// 把 F#4 这样的音名转换为 Hz 频率。
function noteToFrequency(note) {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 440;

  const semitone = NOTE_BASE[match[1]] + (Number(match[2]) - 4) * 12;
  return 440 * 2 ** (semitone / 12);
}
