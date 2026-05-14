// App entry point: wires state, renderer, input, audio, UI, and the frame loop.
// 应用入口：把状态、渲染、输入、音频、UI 和帧循环串起来。
import { FlowerAudio } from "./audio/flowerAudio.js";
import { AppLoop } from "./app/loop.js";
import { PointerPicker } from "./interaction/pointerPicker.js";
import { HoverController } from "./interaction/hoverController.js";
import { ThreeGardenRenderer } from "./render/three/ThreeGardenRenderer.js";
import { GardenStore } from "./simulation/gardenStore.js";
import { updateFlowerGrowth } from "./simulation/flowerGrowthSystem.js";
import { GardenControls } from "./ui/controls.js";

// DOM mount point for the WebGL canvas.
// WebGL 画布挂载的 DOM 容器。
const container = document.getElementById("sketch-holder");

// Single source of truth for garden data.
// 花园数据的唯一状态源。
const store = new GardenStore();

// UI is assigned after audio creation so callbacks can reference it safely.
// UI 会在音频对象之后赋值，这样回调里可以安全更新按钮状态。
let controls = null;

// Sound engine for hover-triggered flower tones.
// 悬停触发花朵音效的声音引擎。
const audio = new FlowerAudio({
  onStateChange: (enabled) => controls?.updateSoundState(enabled),
});

// Three.js renderer adapter; rendering depends on store data, not hidden mesh state.
// Three.js 渲染适配器；渲染读取 store 数据，不把游戏状态藏在 mesh 里。
const renderer = new ThreeGardenRenderer({
  container,
  store,
  onContextLost: () => controls?.setStatus("Restoring garden..."),
  onContextRestored: () => {
    store.rebuildGarden();
    store.rebuildAtmosphere();
    controls?.setStatus("Hover the buds");
  },
});

store.rebuildGarden();
store.rebuildAtmosphere();

// DOM controls: density slider and sound button.
// DOM 控件：密度滑杆和声音按钮。
controls = new GardenControls({
  audio,
  onDensityChange: (density) => {
    store.setDensity(density);
  },
});

// Converts pointer position into a 3D ground-plane hit point.
// 把鼠标位置转换成 3D 地面上的命中点。
const pointerPicker = new PointerPicker({
  camera: renderer.camera,
  domElement: renderer.domElement,
});

// Applies hover enter/leave behavior to simulation state.
// 根据悬停进入/离开更新模拟状态。
const hoverController = new HoverController({ store, audio });

container.addEventListener("pointerdown", () => {
  audio.enable();
});

window.addEventListener("resize", () => {
  renderer.resize();
  store.rebuildGarden();
});

// Main frame loop: input -> interaction -> simulation -> render.
// 主循环：输入 -> 交互 -> 模拟 -> 渲染。
const loop = new AppLoop((deltaSeconds, elapsedSeconds) => {
  const pointerGroundPoint = pointerPicker.getGroundPoint();
  hoverController.update(pointerGroundPoint);
  updateFlowerGrowth(store, deltaSeconds);
  store.updateEffects(deltaSeconds, elapsedSeconds);
  renderer.render(elapsedSeconds);
});

loop.start();
