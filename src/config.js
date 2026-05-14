// Shared tuning constants for the garden.
// 花园项目的全局调参常量。

// Ground plane height in Three.js world space.
// Three.js 世界坐标中地面的高度。
export const GROUND_Y = 0;

// Minimum flower scale when it is only a bud/marker.
// 花朵只显示为花点/芽时的最小缩放。
export const REST_GROWTH = 0.12;

// Small threshold used to hide inactive full flower meshes.
// 用于隐藏非激活完整花模型的小阈值。
export const ACTIVE_FLOWER_EPSILON = 0.018;

// Particle cap to keep hover effects stable.
// 花粉粒子上限，避免快速扫动时越积越多。
export const MAX_POLLEN = 140;

// Notes used by the flower sound engine.
// 花朵音效使用的音符池。
export const NOTES = [
  "D2",
  "D3",
  "F#3",
  "A3",
  "C#4",
  "D4",
  "F#4",
  "A4",
  "C#5",
  "E5",
  "F#5",
  "A6",
];

// Color palette for generated flower heads.
// 程序生成花头时使用的颜色池。
export const FLOWER_COLORS = [
  "#ff8ca8",
  "#f7d33a",
  "#b76df1",
  "#ff9b68",
  "#f8c5e5",
  "#92d7ff",
];

// User-facing density slider range.
// 用户界面里密度滑杆的范围。
export const DENSITY = {
  min: 0.5,
  max: 2.2,
  initial: 1,
};

// Planting area limits on the ground plane.
// 地面上自动铺花点的范围。
export const GARDEN_BOUNDS = {
  zNear: 250,
  zFar: -1120,
  maxXSpread: 1180,
};
