// Flower growth simulation.
// 花朵生长动画的模拟逻辑。
import { REST_GROWTH } from "../config.js";
import { frameLerp } from "../utils/math.js";

// Move each flower's growth value toward its hover-driven target.
// 让每朵花的 growth 平滑靠近由悬停状态决定的目标值。
export function updateFlowerGrowth(store, deltaSeconds) {
  for (const flower of store.flowers) {
    const rate = flower.targetGrowth > flower.growth ? flower.growRate : flower.shrinkRate;
    flower.growth = frameLerp(flower.growth, flower.targetGrowth, rate, deltaSeconds);

    if (Math.abs(flower.growth - flower.targetGrowth) < 0.004) {
      flower.growth = flower.targetGrowth;
    }

    if (!flower.isHovered && flower.targetGrowth === REST_GROWTH && flower.growth < REST_GROWTH) {
      flower.growth = REST_GROWTH;
    }
  }
}
