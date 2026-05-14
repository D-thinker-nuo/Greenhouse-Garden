// Small math helpers shared by simulation and rendering.
// 模拟层和渲染层共用的小型数学工具。

// Clamp a value into a closed range.
// 把数值限制在指定区间内。
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation.
// 线性插值。
export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

// Remap a number from one range to another.
// 将一个数从旧范围映射到新范围。
export function mapRange(value, inMin, inMax, outMin, outMax, shouldClamp = false) {
  const mapped = outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  return shouldClamp ? clamp(mapped, Math.min(outMin, outMax), Math.max(outMin, outMax)) : mapped;
}

// Distance on the garden ground plane, using x/z only.
// 地面平面上的距离，只使用 x/z 坐标。
export function distance2D(ax, az, bx, bz) {
  const dx = ax - bx;
  const dz = az - bz;
  return Math.sqrt(dx * dx + dz * dz);
}

// Frame-rate-independent smoothing toward a target.
// 与帧率无关的平滑靠近目标值。
export function frameLerp(current, target, rate, deltaSeconds) {
  return lerp(current, target, 1 - Math.exp(-rate * deltaSeconds));
}
