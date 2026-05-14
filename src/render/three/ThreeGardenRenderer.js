// Three.js implementation of the renderer adapter.
// RendererAdapter 的 Three.js 实现。
import * as THREE from "three";
import { RendererAdapter } from "../RendererAdapter.js";
import { CloudView } from "./objects/CloudView.js";
import { FireflyView } from "./objects/FireflyView.js";
import { FlowerView } from "./objects/FlowerView.js";
import { PollenView } from "./objects/PollenView.js";
import { createGardenResources, disposeGardenResources } from "./materials/gardenResources.js";

export class ThreeGardenRenderer extends RendererAdapter {
  constructor({ container, store, onContextLost, onContextRestored }) {
    super();
    // DOM container and simulation state.
    // DOM 容器和模拟状态。
    this.container = container;
    this.store = store;

    // Context recovery callbacks shown through UI status.
    // WebGL 上下文恢复相关的 UI 回调。
    this.onContextLost = onContextLost;
    this.onContextRestored = onContextRestored;

    // Shared resources and view maps keyed by simulation ids.
    // 共用资源，以及按模拟 id 索引的视图表。
    this.resources = createGardenResources();
    this.flowerViews = new Map();
    this.pollenViews = new Map();
    this.fireflyViews = new Map();
    this.cloudViews = new Map();

    // Scene/camera/renderer are owned by this adapter.
    // 场景、相机、渲染器由这个适配器持有。
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x88c5d8);
    this.scene.fog = new THREE.Fog(0xeaf8f4, 880, 2400);

    this.cameraInstance = new THREE.PerspectiveCamera(60, 1, 1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // World group contains garden objects that live in 3D space.
    // world 组里放置所有存在于 3D 世界中的花园对象。
    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.setupLights();
    this.setupEnvironment();
    this.installContextHandlers();
    this.resize();
  }

  // Camera exposed to pointer raycasting.
  // 暴露给鼠标射线拾取使用的相机。
  get camera() {
    return this.cameraInstance;
  }

  // Canvas exposed to DOM input handlers.
  // 暴露给 DOM 输入逻辑使用的画布。
  get domElement() {
    return this.renderer.domElement;
  }

  // Build the basic lighting rig.
  // 创建基础光照。
  setupLights() {
    const ambient = new THREE.AmbientLight(0xb6bad6, 1.25);
    const sun = new THREE.DirectionalLight(0xfff2cc, 2.2);
    sun.position.set(-360, 780, 520);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -1100;
    sun.shadow.camera.right = 1100;
    sun.shadow.camera.top = 1100;
    sun.shadow.camera.bottom = -1100;

    const warmPoint = new THREE.PointLight(0xffecbe, 1.4, 1600);
    warmPoint.position.set(-360, 320, 180);

    this.scene.add(ambient, sun, warmPoint);
  }

  // Create sky gradient, ground plane, and ground stripes.
  // 创建天空渐变、地面和地面横线。
  setupEnvironment() {
    this.sky = new THREE.Mesh(
      new THREE.PlaneGeometry(5200, 3000),
      new THREE.MeshBasicMaterial({ map: createSkyTexture(), depthWrite: false })
    );
    this.sky.position.set(0, 680, -1600);
    this.scene.add(this.sky);

    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(5200, 3050),
      new THREE.MeshStandardMaterial({ color: 0x64a16a, roughness: 0.9 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, 0, -410);
    this.ground.receiveShadow = true;
    this.world.add(this.ground);

    const stripeMaterial = new THREE.LineBasicMaterial({ color: 0x5b9b63, transparent: true, opacity: 0.22 });
    const points = [];
    for (let z = -1380; z <= 980; z += 110) {
      points.push(new THREE.Vector3(-2600, 0.18, z), new THREE.Vector3(2600, 0.18, z));
    }
    const stripeGeometry = new THREE.BufferGeometry().setFromPoints(points);
    this.groundStripes = new THREE.LineSegments(stripeGeometry, stripeMaterial);
    this.world.add(this.groundStripes);
  }

  // Handle WebGL context loss/restoration gracefully.
  // 优雅处理 WebGL 上下文丢失和恢复。
  installContextHandlers() {
    this.renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.onContextLost?.();
    });

    this.renderer.domElement.addEventListener("webglcontextrestored", () => {
      this.onContextRestored?.();
    });
  }

  // Resize renderer and update camera projection.
  // 调整渲染器尺寸并更新相机投影。
  resize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.position.set(0, 440, 930);
    this.camera.lookAt(0, 0, -420);
    this.camera.updateProjectionMatrix();
    this.store.setViewport(width, height);
  }

  // Sync all views from simulation data, then draw.
  // 从模拟状态同步所有视图，然后绘制。
  render(elapsedSeconds) {
    this.syncFlowers(elapsedSeconds);
    this.syncPollens(elapsedSeconds);
    this.syncFireflies(elapsedSeconds);
    this.syncClouds();
    this.renderer.render(this.scene, this.camera);
  }

  // Create/update/remove flower views.
  // 创建、更新、移除花朵视图。
  syncFlowers(elapsedSeconds) {
    const liveIds = new Set();
    for (const flower of this.store.flowers) {
      liveIds.add(flower.id);
      if (!this.flowerViews.has(flower.id)) {
        const view = new FlowerView(flower, this.resources);
        this.flowerViews.set(flower.id, view);
        this.world.add(view.group);
      }
      this.flowerViews.get(flower.id).sync(flower, elapsedSeconds);
    }
    this.removeMissing(this.flowerViews, liveIds);
  }

  // Create/update/remove pollen views.
  // 创建、更新、移除花粉视图。
  syncPollens(elapsedSeconds) {
    const liveIds = new Set();
    for (const pollen of this.store.pollens) {
      liveIds.add(pollen.id);
      if (!this.pollenViews.has(pollen.id)) {
        const view = new PollenView(pollen, this.resources);
        this.pollenViews.set(pollen.id, view);
        this.world.add(view.mesh);
      }
      this.pollenViews.get(pollen.id).sync(pollen, elapsedSeconds);
    }
    this.removeMissing(this.pollenViews, liveIds);
  }

  // Create/update/remove firefly views.
  // 创建、更新、移除萤火虫视图。
  syncFireflies(elapsedSeconds) {
    const liveIds = new Set();
    for (const firefly of this.store.fireflies) {
      liveIds.add(firefly.id);
      if (!this.fireflyViews.has(firefly.id)) {
        const view = new FireflyView(firefly, this.resources);
        this.fireflyViews.set(firefly.id, view);
        this.world.add(view.mesh);
      }
      this.fireflyViews.get(firefly.id).sync(firefly, elapsedSeconds);
    }
    this.removeMissing(this.fireflyViews, liveIds);
  }

  // Create/update/remove cloud views.
  // 创建、更新、移除云朵视图。
  syncClouds() {
    const liveIds = new Set();
    for (const cloud of this.store.clouds) {
      liveIds.add(cloud.id);
      if (!this.cloudViews.has(cloud.id)) {
        const view = new CloudView(cloud, this.resources);
        this.cloudViews.set(cloud.id, view);
        this.world.add(view.group);
      }
      this.cloudViews.get(cloud.id).sync(cloud);
    }
    this.removeMissing(this.cloudViews, liveIds);
  }

  // Remove stale views when simulation objects disappear.
  // 模拟对象消失时移除过期视图。
  removeMissing(viewMap, liveIds) {
    for (const [id, view] of viewMap.entries()) {
      if (liveIds.has(id)) continue;
      if (view.group) this.world.remove(view.group);
      if (view.mesh) this.world.remove(view.mesh);
      view.dispose?.();
      viewMap.delete(id);
    }
  }

  // Dispose renderer-owned GPU resources.
  // 释放渲染器持有的 GPU 资源。
  dispose() {
    this.renderer.dispose();
    this.sky.geometry.dispose();
    this.sky.material.map.dispose();
    this.sky.material.dispose();
    this.ground.geometry.dispose();
    this.ground.material.dispose();
    this.groundStripes.geometry.dispose();
    this.groundStripes.material.dispose();
    disposeGardenResources(this.resources);
  }
}

// Tiny generated gradient texture for the sky plane.
// 为天空平面生成的小型渐变贴图。
function createSkyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#7fc5e2");
  gradient.addColorStop(1, "#ffddbc");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
