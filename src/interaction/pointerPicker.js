// Pointer picker: raycasts from screen space to the ground plane.
// 鼠标拾取器：把屏幕坐标射线投到地面平面上。
import * as THREE from "three";

export class PointerPicker {
  constructor({ camera, domElement }) {
    // Camera and canvas used for raycasting.
    // 用于射线拾取的相机和画布。
    this.camera = camera;
    this.domElement = domElement;

    // Normalized device coordinate pointer.
    // 标准化设备坐标里的鼠标位置。
    this.pointer = null;
    this.raycaster = new THREE.Raycaster();

    // y=0 ground plane.
    // y=0 的地面平面。
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.groundPoint = new THREE.Vector3();

    this.domElement.addEventListener("pointermove", (event) => this.updatePointer(event));
    this.domElement.addEventListener("pointerleave", () => {
      this.pointer = null;
    });
  }

  // Convert DOM pointer position to normalized device coordinates.
  // 把 DOM 鼠标位置转换为标准化设备坐标。
  updatePointer(event) {
    const rect = this.domElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      this.pointer = null;
      return;
    }

    this.pointer = {
      x: (x / rect.width) * 2 - 1,
      y: -(y / rect.height) * 2 + 1,
    };
  }

  // Return the current ray/ground intersection, or null if invalid.
  // 返回当前射线和地面的交点，无效时返回 null。
  getGroundPoint() {
    if (!this.pointer) return null;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, this.groundPoint);
    if (!hit || !Number.isFinite(hit.x) || !Number.isFinite(hit.z)) return null;

    return { x: hit.x, y: hit.y, z: hit.z };
  }
}
