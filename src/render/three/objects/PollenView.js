// Visual representation of one pollen particle.
// 单个花粉粒子的可视化对象。
import * as THREE from "three";

export class PollenView {
  constructor(pollen, resources) {
    // Pollen can be a tiny sphere or a flat star.
    // 花粉可以是小球，也可以是扁平星形。
    this.pollen = pollen;
    this.resources = resources;
    const geometry = pollen.isStar ? resources.geometries.star : resources.geometries.tinySphere;
    this.material = resources.materials.pollen.clone();
    this.material.color = new THREE.Color(pollen.color);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.renderOrder = 3;
    this.sync(pollen, 0);
  }

  // Follow simulation position, spin, scale, and fade.
  // 跟随模拟里的位置、旋转、缩放和淡出。
  sync(pollen, elapsedSeconds) {
    this.pollen = pollen;
    this.mesh.position.set(pollen.position.x, pollen.position.y, pollen.position.z);
    this.mesh.scale.setScalar(pollen.size);
    this.mesh.rotation.x = elapsedSeconds * 2.6;
    this.mesh.rotation.z = elapsedSeconds * 2.2;
    this.material.opacity = Math.max(pollen.alpha, 0);
  }

  // Dispose per-particle cloned material.
  // 释放每个粒子单独克隆的材质。
  dispose() {
    this.material.dispose();
  }
}
