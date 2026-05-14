// Seeded random helper for repeatable garden layouts.
// 带种子的随机数工具，用来生成可复现的花园布局。
export class Random {
  constructor(seed = 1) {
    // Internal generator state.
    // 随机数生成器的内部状态。
    this.seed = seed >>> 0;
  }

  // Return a deterministic 0..1 random value.
  // 返回一个确定性的 0..1 随机数。
  next() {
    this.seed += 0x6d2b79f5;
    let value = this.seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  // Random float in [min, max).
  // 指定范围内的随机小数。
  range(min, max) {
    return min + (max - min) * this.next();
  }

  // Random integer in [min, max].
  // 指定范围内的随机整数。
  integer(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  // Pick one value from an array.
  // 从数组里随机选一个值。
  choice(values) {
    return values[Math.floor(this.next() * values.length)];
  }

  // True with the given probability.
  // 按给定概率返回 true。
  chance(probability) {
    return this.next() < probability;
  }

  // Random unit vector for particle directions.
  // 用于粒子方向的随机单位向量。
  unitVector3() {
    const theta = this.range(0, Math.PI * 2);
    const z = this.range(-1, 1);
    const radius = Math.sqrt(1 - z * z);
    return {
      x: radius * Math.cos(theta),
      y: z,
      z: radius * Math.sin(theta),
    };
  }
}
