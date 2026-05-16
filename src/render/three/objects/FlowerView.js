// Visual representation of one simulated flower.
// 单朵模拟花的可视化对象。
import * as THREE from "three";
import { ACTIVE_FLOWER_EPSILON, REST_GROWTH } from "../../../config.js";

// Marker offsets lift circles above the ground to avoid z-fighting.
// 花点圆片抬离地面，避免和地面深度冲突产生频闪。
const MARKER_GLOW_Y = 1.05;
const MARKER_CORE_Y = 1.28;
const MARKER_BUD_Y = 5.2;

export class FlowerView {
  constructor(flower, resources) {
    // Keep a reference to the simulation record and shared GPU resources.
    // 保存对应的模拟数据和共用 GPU 资源。
    this.flower = flower;
    this.resources = resources;

    // group contains marker + full flower body.
    // group 同时包含花点标记和完整花体。
    this.group = new THREE.Group();
    this.markerGroup = new THREE.Group();
    this.bodyGroup = new THREE.Group();

    this.group.add(this.markerGroup, this.bodyGroup);
    this.createMarker(flower);
    this.createBody(flower);
    this.sync(flower, 0);
  }

  // Create the ground marker shown before the flower blooms.
  // 创建开花前显示在地面上的花点。
  createMarker(flower) {
    this.markerGlow = new THREE.Mesh(this.resources.geometries.marker, this.resources.materials.markerGlow.clone());
    this.markerGlow.rotation.x = -Math.PI / 2;
    this.markerGlow.position.y = MARKER_GLOW_Y;
    this.markerGlow.renderOrder = 1;

    this.markerCore = new THREE.Mesh(this.resources.geometries.marker, this.resources.materials.markerCore.clone());
    this.markerCore.rotation.x = -Math.PI / 2;
    this.markerCore.position.y = MARKER_CORE_Y;
    this.markerCore.renderOrder = 2;

    this.bud = new THREE.Mesh(this.resources.geometries.tinySphere, this.resources.materials.bud.clone());
    this.bud.position.y = MARKER_BUD_Y;

    this.markerGroup.add(this.markerGlow, this.markerCore, this.bud);
    this.markerGroup.position.copy(toVector3(flower.position));
  }

  // Build the stem and flower head once; sync() only animates transforms.
  // 只创建一次花茎和花头；sync() 只负责同步动画变换。
  createBody(flower) {
    this.bodyGroup.position.copy(toVector3(flower.position));

    const stem = new THREE.Mesh(this.resources.geometries.stem, this.resources.materials.stem);
    stem.position.y = flower.stemHeight / 2;
    stem.scale.set(2.6, flower.stemHeight, 2.6);
    stem.castShadow = true;
    this.bodyGroup.add(stem);

    const head = new THREE.Group();
    head.position.y = flower.stemHeight;
    this.bodyGroup.add(head);

    if (flower.type === 0) {
      this.createPuffball(head, flower);
    } else if (flower.type === 1) {
      this.createLily(head, flower);
    } else {
      this.createDaisy(head, flower);
    }
  }

  // Round puffball flower type.
  // 球状花类型。
  createPuffball(head, flower) {
    const petalMaterial = flowerMaterial(flower.petalColor);

    for (let i = 0; i < 5; i += 1) {
      const angle = flower.angleOffset + i * 1.25;
      const petal = new THREE.Mesh(this.resources.geometries.sphere, petalMaterial);
      petal.position.set(Math.cos(angle) * 10, 8, Math.sin(angle) * 10);
      petal.scale.setScalar(18);
      petal.castShadow = true;
      head.add(petal);
    }

    const center = new THREE.Mesh(this.resources.geometries.sphere, flowerMaterial("#ffcd44", true));
    center.scale.setScalar(11);
    center.castShadow = true;
    head.add(center);
  }

  // Layered lily flower type.
  // 分层百合/莲花类型。
  createLily(head, flower) {
    const lowerMaterial = flowerMaterial(flower.petalColor);
    const upperMaterial = flowerMaterial(lightenColor(flower.petalColor, 32));

    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6 + flower.angleOffset;
      const petal = this.createPetal(lowerMaterial, angle, 18, -2, 22, 5, 11);
      petal.rotation.z = Math.PI / 9;
      head.add(petal);
    }

    for (let i = 0; i < 5; i += 1) {
      const angle = (Math.PI * 2 * i) / 5 + flower.angleOffset + 0.5;
      const petal = this.createPetal(upperMaterial, angle, 12, 4, 16, 4, 8);
      petal.rotation.z = -Math.PI / 12;
      head.add(petal);
    }

    const center = new THREE.Mesh(this.resources.geometries.sphere, flowerMaterial("#fff196", true));
    center.scale.setScalar(8);
    center.castShadow = true;
    head.add(center);
  }

  // Daisy-like radial flower type.
  // 雏菊式放射花类型。
  createDaisy(head, flower) {
    const petalMaterial = flowerMaterial(flower.petalColor);

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + flower.angleOffset;
      head.add(this.createPetal(petalMaterial, angle, 22, 0, 24, 6, 12));
    }

    const center = new THREE.Mesh(this.resources.geometries.sphere, flowerMaterial("#ffde20", true));
    center.scale.setScalar(13);
    center.castShadow = true;
    head.add(center);
  }

  // One stretched sphere petal.
  // 一个由拉伸球体构成的花瓣。
  createPetal(material, angle, radius, y, scaleX, scaleY, scaleZ) {
    const petal = new THREE.Mesh(this.resources.geometries.sphere, material);
    petal.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    petal.rotation.y = -angle;
    petal.scale.set(scaleX, scaleY, scaleZ);
    petal.castShadow = true;
    return petal;
  }

  // Sync mesh transforms/material opacity from simulation state.
  // 根据模拟状态同步 mesh 的位置、缩放和透明度。
  sync(flower, elapsedSeconds) {
    this.flower = flower;
    this.group.position.set(0, 0, 0);
    this.markerGroup.position.copy(toVector3(flower.position));
    this.bodyGroup.position.copy(toVector3(flower.position));

    const pulse = Math.sin(elapsedSeconds * 2.7 + flower.windPhase) * 3.4;
    const markerSize = flower.markerSize + pulse;
    this.markerGlow.scale.set(markerSize, markerSize * 0.72, 1);
    this.markerCore.scale.set(markerSize * 0.52, markerSize * 0.38, 1);
    this.markerGlow.material.opacity = flower.isHovered ? 0.86 : opacityFromGrowth(flower.growth);
    this.bud.scale.setScalar(flower.isHovered ? 6.4 : 4.8);

    const active = flower.targetGrowth > REST_GROWTH || flower.growth > REST_GROWTH + ACTIVE_FLOWER_EPSILON;
    this.bodyGroup.visible = active;
    if (active) {
      this.bodyGroup.scale.setScalar(flower.growth);
      this.bodyGroup.rotation.z = Math.sin(elapsedSeconds * 1.2 + flower.windPhase) * 0.16;
      this.bodyGroup.rotation.x = Math.sin(elapsedSeconds * 0.8 + flower.windPhase) * 0.08;
    }
  }

  // Dispose cloned materials owned by this view.
  // 释放这个视图自己克隆出来的材质。
  dispose() {
    const materials = new Set();
    this.group.traverse((object) => {
      if (object.isMesh && object.material && object.material !== this.resources.materials.stem) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => materials.add(material));
        } else if (!object.material.userData.shared) {
          materials.add(object.material);
        }
      }
    });

    for (const material of materials) {
      material.dispose();
    }
  }
}

// Convert plain simulation position to THREE.Vector3.
// 将普通模拟坐标转换成 THREE.Vector3。
function toVector3(position) {
  return new THREE.Vector3(position.x, position.y, position.z);
}

// Fade marker opacity as the full flower grows.
// 随着完整花朵长出，逐渐降低花点透明度。
function opacityFromGrowth(growth) {
  const t = Math.min(Math.max((growth - REST_GROWTH) / (1 - REST_GROWTH), 0), 1);
  return 0.8 - t * 0.48;
}

// Create a material for petal or flower center.
// 创建花瓣或花心材质。
function flowerMaterial(color, emissive = false) {

  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: emissive ? color : "#000000",
    emissiveIntensity: emissive ? 0.35 : 0,
    roughness: 0.62,
    metalness: 0.02,
  });

  // 在着色器里添加边缘光效果，让花朵更亮眼
  // Add a rim lighting effect in the shader for extra pop
  material.onBeforeCompile = (shader) => {

    shader.fragmentShader = shader.fragmentShader.replace(

      "#include <opaque_fragment>",

      `
      #include <opaque_fragment>

      vec3 viewDir = normalize(-vViewPosition);
      float rim = 1.0 - max(dot(-viewDir, normal), 0.0);
      rim = pow(rim, 4.0);
      gl_FragColor.rgb += vec3(1.0, 0.35, 0.2) * rim * 0.5;
      `
    );
  };

  material.needsUpdate = true;
  return material;
}


// Lighten a hex color without needing a separate color library.
// 不引入额外库，直接调亮十六进制颜色。
function lightenColor(hex, amount) {
  const color = new THREE.Color(hex);
  color.r = Math.min(color.r + amount / 255, 1);
  color.g = Math.min(color.g + amount / 255, 1);
  color.b = Math.min(color.b + amount / 255, 1);
  return `#${color.getHexString()}`;
}
