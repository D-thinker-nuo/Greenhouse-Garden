// Visual representation of one ambient firefly.
// 单个环境萤火虫的可视化对象。
import * as THREE from "three";

export class FireflyView {
  constructor(firefly, resources) {
    this.firefly = firefly;
    this.resources = resources;
    this.mesh = new THREE.Mesh(resources.geometries.tinySphere, resources.materials.firefly);
    this.sync(firefly, 0);
  }

  // Fireflies are simple glowing points with a subtle pulse.
  // 萤火虫是带轻微呼吸变化的发光小点。
  sync(firefly, elapsedSeconds) {
    this.mesh.position.set(firefly.position.x, firefly.position.y, firefly.position.z);
    const pulse = 0.8 + Math.sin(elapsedSeconds * 3 + firefly.noiseX) * 0.25;
    this.mesh.scale.setScalar(firefly.size * pulse);
  }
}
