// Hover controller: turns pointer hits into flower enter/leave events.
// 悬停控制器：把鼠标命中转换为花朵进入/离开事件。
import { REST_GROWTH } from "../config.js";
import { distance2D } from "../utils/math.js";

export class HoverController {
  constructor({ store, audio }) {
    // Simulation data and sound output.
    // 模拟状态和声音输出。
    this.store = store;
    this.audio = audio;
  }

  // Find the nearest flower under the pointer and update hover targets.
  // 查找鼠标下最近的花点，并更新悬停目标。
  update(pointerGroundPoint) {
    let nextHoveredId = null;
    let closest = Infinity;

    if (pointerGroundPoint) {
      for (const flower of this.store.flowers) {
        const distance = distance2D(pointerGroundPoint.x, pointerGroundPoint.z, flower.position.x, flower.position.z);
        if (distance < flower.hoverRadius && distance < closest) {
          closest = distance;
          nextHoveredId = flower.id;
        }
      }
    }

    if (nextHoveredId !== this.store.hoveredFlowerId) {
      const entered = this.store.flowers.find((flower) => flower.id === nextHoveredId);
      if (entered) {
        this.audio.playFlower(entered);
        this.store.spawnPollen(entered);
      }
    }

    this.store.hoveredFlowerId = nextHoveredId;

    for (const flower of this.store.flowers) {
      flower.isHovered = flower.id === nextHoveredId;
      flower.targetGrowth = flower.isHovered ? 1 : REST_GROWTH;
    }
  }
}
