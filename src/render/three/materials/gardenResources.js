// Shared Three.js geometries/materials.
// Three.js 共用几何体和材质资源。
import * as THREE from "three";

// Create reusable resources to reduce per-object GPU allocations.
// 创建可复用资源，减少每个对象单独分配 GPU 资源。
export function createGardenResources() {
  return {
    geometries: {
      marker: new THREE.CircleGeometry(1, 36),
      stem: new THREE.CylinderGeometry(1, 1, 1, 8, 1),
      sphere: new THREE.SphereGeometry(1, 12, 8),
      tinySphere: new THREE.SphereGeometry(1, 6, 4),
      star: createStarGeometry(),
      ground: new THREE.PlaneGeometry(1, 1),
    },
    materials: {
      stem: new THREE.MeshStandardMaterial({ color: 0x4a914f, roughness: 0.82, metalness: 0.02 }),
      markerGlow: new THREE.MeshBasicMaterial({
        color: 0xffec9b,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
      markerCore: new THREE.MeshStandardMaterial({
        color: 0x59844e,
        transparent: true,
        opacity: 0.52,
        roughness: 0.9,
        depthWrite: false,
      }),
      bud: new THREE.MeshBasicMaterial({ color: 0xffe07a }),
      pollen: new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.9 }),
      firefly: new THREE.MeshBasicMaterial({ color: 0xfff782 }),
      cloud: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.78,
        roughness: 0.95,
      }),
    },
  };
}

export function disposeGardenResources(resources) {
  for (const geometry of Object.values(resources.geometries)) {
    geometry.dispose();
  }

  for (const material of Object.values(resources.materials)) {
    material.dispose();
  }
}

// Flat star shape used by some pollen particles.
// 部分花粉粒子使用的扁平星形。
function createStarGeometry() {
  const shape = new THREE.Shape();
  const points = 5;
  const outer = 1;
  const inner = 0.42;

  for (let i = 0; i <= points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  return new THREE.ShapeGeometry(shape);
}
