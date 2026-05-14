// Visual representation of one soft cloud.
// 单朵柔软云的可视化对象。
import * as THREE from "three";

export class CloudView {
  constructor(cloud, resources) {
    this.cloud = cloud;
    this.resources = resources;
    this.group = new THREE.Group();

    const first = this.createLobe(1);
    const second = this.createLobe(0.68);
    const third = this.createLobe(0.58);
    second.position.x = cloud.size * 0.8;
    third.position.x = -cloud.size * 0.78;

    this.group.add(first, second, third);
    this.sync(cloud);
  }

  // Build one spherical lobe of the cloud.
  // 创建云的一团球形组成部分。
  createLobe(scale) {
    const mesh = new THREE.Mesh(this.resources.geometries.sphere, this.resources.materials.cloud);
    mesh.scale.setScalar(this.cloud.size * scale);
    return mesh;
  }

  // Follow simulation position.
  // 跟随模拟位置。
  sync(cloud) {
    this.group.position.set(cloud.position.x, cloud.position.y, cloud.position.z);
  }
}
