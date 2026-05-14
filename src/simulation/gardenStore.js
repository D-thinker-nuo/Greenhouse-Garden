// Simulation store: owns all mutable garden data.
// 模拟状态仓库：统一管理花园里所有会变化的数据。
import {
  DENSITY,
  FLOWER_COLORS,
  GARDEN_BOUNDS,
  GROUND_Y,
  MAX_POLLEN,
  NOTES,
  REST_GROWTH,
} from "../config.js";
import { mapRange } from "../utils/math.js";
import { Random } from "../utils/random.js";

export class GardenStore {
  constructor() {
    // User-selected density multiplier.
    // 用户选择的花点密度倍率。
    this.density = DENSITY.initial;

    // Main simulation collections.
    // 主要模拟数据集合。
    this.flowers = [];
    this.pollens = [];
    this.fireflies = [];
    this.clouds = [];

    // Current hovered flower id, or null.
    // 当前被悬停的花朵 id，没有则为 null。
    this.hoveredFlowerId = null;

    // Renderer viewport, used to rebuild responsive layouts.
    // 渲染视口尺寸，用于响应式重建布局。
    this.viewport = { width: window.innerWidth, height: window.innerHeight };

    // Separate random stream for transient effects.
    // 临时特效使用独立随机数流。
    this.effectRandom = new Random(4024);
    this.nextPollenId = 1;
  }

  // Store the current canvas size.
  // 保存当前画布尺寸。
  setViewport(width, height) {
    this.viewport = { width, height };
  }

  // Update density and rebuild flower positions.
  // 更新密度并重新生成花点位置。
  setDensity(density) {
    this.density = density;
    this.rebuildGarden();
    this.pollens = [];
    this.hoveredFlowerId = null;
  }

  // Rebuild deterministic flower spots from density and viewport.
  // 根据密度和视口重建可复现的花点布局。
  rebuildGarden() {
    const rng = new Random(24 + Math.round(this.density * 100));
    const densityRoot = Math.sqrt(this.density);
    const rows = Math.max(3, Math.round(6 * densityRoot));
    const cols = Math.max(4, Math.round(8 * densityRoot));
    const edgeSkipChance = mapRange(this.density, DENSITY.min, DENSITY.max, 0.32, 0.08, true);
    const skipChance = mapRange(this.density, DENSITY.min, DENSITY.max, 0.18, 0.03, true);
    const jitter = mapRange(this.density, DENSITY.min, DENSITY.max, 72, 36, true);
    const xSpread = Math.min(this.viewport.width * 1.28, GARDEN_BOUNDS.maxXSpread);

    this.flowers = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if ((row === 0 || row === rows - 1) && rng.chance(edgeSkipChance)) continue;
        if (rng.chance(skipChance)) continue;

        const rowT = rows === 1 ? 0 : row / (rows - 1);
        const colT = cols === 1 ? 0 : col / (cols - 1);
        const x = mapRange(colT, 0, 1, -xSpread / 2, xSpread / 2) + rng.range(-jitter, jitter);
        const z = mapRange(rowT, 0, 1, GARDEN_BOUNDS.zNear, GARDEN_BOUNDS.zFar) + rng.range(-jitter, jitter);
        const id = `flower-${this.flowers.length + 1}`;

        this.flowers.push({
          // Pure simulation state; renderers decide how this appears visually.
          // 纯模拟状态；具体怎么显示由渲染器决定。
          id,
          position: { x, y: GROUND_Y, z },
          stemHeight: rng.range(54, 142),
          type: rng.integer(0, 2),
          petalColor: rng.choice(FLOWER_COLORS),
          angleOffset: rng.range(0, Math.PI * 2),
          windPhase: rng.range(0, Math.PI * 2),
          growth: REST_GROWTH,
          targetGrowth: REST_GROWTH,
          growRate: rng.range(4.7, 7.5),
          shrinkRate: rng.range(2.8, 4.5),
          hoverRadius: rng.range(56, 82),
          markerSize: rng.range(34, 52),
          note: NOTES[this.flowers.length % NOTES.length],
          isHovered: false,
        });
      }
    }
  }

  // Recreate ambient moving objects.
  // 重建环境装饰对象。
  rebuildAtmosphere() {
    const rng = new Random(900 + Math.round(this.viewport.width));
    this.fireflies = [];
    this.clouds = [];

    for (let i = 0; i < 44; i += 1) {
      this.fireflies.push({
        id: `firefly-${i}`,
        position: {
          x: rng.range(-this.viewport.width * 1.45, this.viewport.width * 1.45),
          y: rng.range(65, 330),
          z: rng.range(-1180, 380),
        },
        noiseX: rng.range(0, 100),
        noiseY: rng.range(0, 200),
        size: rng.range(1.6, 3.4),
      });
    }

    for (let i = 0; i < 8; i += 1) {
      this.clouds.push({
        id: `cloud-${i}`,
        position: {
          x: rng.range(-this.viewport.width, this.viewport.width),
          y: rng.range(330, 680),
          z: rng.range(-1300, -360),
        },
        speed: rng.range(12, 30),
        size: rng.range(40, 82),
      });
    }
  }

  // Spawn pollen particles when a flower starts blooming.
  // 当花朵开始绽放时生成花粉粒子。
  spawnPollen(flower) {
    const count = this.effectRandom.integer(5, 9);

    for (let i = 0; i < count; i += 1) {
      if (this.pollens.length >= MAX_POLLEN) {
        this.pollens.shift();
      }

      const direction = this.effectRandom.unitVector3();
      const speed = this.effectRandom.range(55, 165);
      this.pollens.push({
        id: `pollen-${this.nextPollenId}`,
        position: {
          x: flower.position.x,
          y: flower.position.y + flower.stemHeight * 0.68,
          z: flower.position.z,
        },
        velocity: {
          x: direction.x * speed,
          y: Math.abs(direction.y) * speed + this.effectRandom.range(40, 120),
          z: direction.z * speed,
        },
        alpha: 0.92,
        size: this.effectRandom.range(2.5, 7),
        isStar: this.effectRandom.chance(0.52),
        color: this.effectRandom.choice(["#ffd700", "#fff4b8", "#ff8bd3", "#ffa657", flower.petalColor]),
      });
      this.nextPollenId += 1;
    }
  }

  // Advance transient particles and atmosphere.
  // 推进花粉、萤火虫和云的临时动画。
  updateEffects(deltaSeconds, elapsedSeconds) {
    for (const pollen of this.pollens) {
      pollen.position.x += pollen.velocity.x * deltaSeconds;
      pollen.position.y += pollen.velocity.y * deltaSeconds;
      pollen.position.z += pollen.velocity.z * deltaSeconds;
      pollen.velocity.x *= 0.94;
      pollen.velocity.y = pollen.velocity.y * 0.94 - 80 * deltaSeconds;
      pollen.velocity.z *= 0.94;
      pollen.alpha -= deltaSeconds * 1.9;
    }

    this.pollens = this.pollens.filter((pollen) => pollen.alpha > 0);

    for (const firefly of this.fireflies) {
      firefly.position.x += Math.sin(elapsedSeconds * 1.4 + firefly.noiseX) * 0.55;
      firefly.position.y += Math.sin(elapsedSeconds * 1.1 + firefly.noiseY) * 0.28;
    }

    for (const cloud of this.clouds) {
      cloud.position.x += cloud.speed * deltaSeconds;
      if (cloud.position.x > this.viewport.width * 2) {
        cloud.position.x = -this.viewport.width * 2;
      }
    }
  }
}
