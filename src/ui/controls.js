// DOM controls for density and sound.
// 密度和声音的 DOM 控件。
import { DENSITY } from "../config.js";

export class GardenControls {
  constructor({ audio, onDensityChange }) {
    // External callbacks.
    // 外部传入的行为回调。
    this.audio = audio;
    this.onDensityChange = onDensityChange;

    // Cached DOM nodes.
    // 缓存的 DOM 节点。
    this.densitySlider = document.getElementById("density-slider");
    this.densityValue = document.getElementById("density-value");
    this.soundButton = document.getElementById("sound-toggle");
    this.statusChip = document.getElementById("status-chip");

    this.setupDensity();
    this.setupSound();
  }

  // Wire the density slider to simulation state.
  // 将密度滑杆连接到模拟状态。
  setupDensity() {
    if (!this.densitySlider) return;

    this.densitySlider.min = String(DENSITY.min);
    this.densitySlider.max = String(DENSITY.max);
    this.densitySlider.value = String(DENSITY.initial);
    this.updateDensityLabel(DENSITY.initial);

    this.densitySlider.addEventListener("input", () => {
      const density = Number(this.densitySlider.value) || DENSITY.initial;
      this.updateDensityLabel(density);
      this.onDensityChange(density);
    });
  }

  // Wire the sound button to the audio unlock.
  // 将声音按钮连接到音频启用逻辑。
  setupSound() {
    if (!this.soundButton) return;

    this.soundButton.addEventListener("click", () => {
      this.audio.enable();
    });
  }

  // Update the visible density label.
  // 更新密度显示文本。
  updateDensityLabel(density) {
    if (this.densityValue) {
      this.densityValue.textContent = `${density.toFixed(1)}x`;
    }
  }

  // Reflect current audio state in the button.
  // 在按钮上反映当前音频状态。
  updateSoundState(enabled) {
    if (!this.soundButton) return;

    this.soundButton.classList.toggle("is-on", enabled);
    this.soundButton.textContent = enabled ? "Sound on" : "Sound";
    this.soundButton.setAttribute("aria-label", enabled ? "Sound enabled" : "Enable sound");
  }

  // Small status chip for transient feedback.
  // 左下角状态提示。
  setStatus(text) {
    if (this.statusChip) {
      this.statusChip.textContent = text;
    }
  }
}
