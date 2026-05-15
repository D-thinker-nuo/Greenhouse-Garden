# Hover 3D Grow

一个基于 Three.js 的互动 3D 花园实验。地面预设花点，鼠标悬停时花朵生长，离开后收回，并触发音效和花粉粒子。

## Run

```bash
python3 -m http.server 4173
```

打开：

```txt
http://127.0.0.1:4173/
```

## Interaction

- `Density`：调整地面花点密度。
- `Sound`：启用浏览器音频；启用后，悬停花点会播放音符。
- 鼠标悬停花点：花朵生长。
- 鼠标离开花点：花朵收回。

## Architecture

```txt
src/
  main.js                         # App entry / 应用入口
  config.js                       # Shared constants / 全局参数

  app/
    loop.js                       # Frame loop / 帧循环

  audio/
    flowerAudio.js                # Web Audio flower notes / 花朵音效

  interaction/
    pointerPicker.js              # Screen-to-ground raycast / 鼠标射线到地面
    hoverController.js            # Hover enter/leave behavior / 悬停进入离开逻辑

  simulation/
    gardenStore.js                # Garden state / 花园状态
    flowerGrowthSystem.js         # Growth animation state / 生长动画状态

  ui/
    controls.js                   # Density and sound controls / 密度和声音控件

  render/
    RendererAdapter.js            # Renderer interface / 渲染器接口
    three/
      ThreeGardenRenderer.js      # Three.js renderer / Three.js 渲染实现
      materials/
        gardenResources.js        # Shared GPU resources / 共用几何和材质
      objects/
        FlowerView.js             # Flower mesh view / 花朵视图
        PollenView.js             # Pollen particle view / 花粉视图
        FireflyView.js            # Firefly view / 萤火虫视图
        CloudView.js              # Cloud view / 云朵视图

```

## Design Notes

- `simulation/` stores pure data such as position, growth, target growth, and hover state.
- `render/` reads simulation data and turns it into Three.js meshes.
- `interaction/` converts pointer movement into ground-plane hits and hover events.
- `audio/` is separated from rendering so sound failures do not affect the scene.
- `RendererAdapter` leaves room for future renderers, such as WebGPU, post-processing, or path tracing experiments.

## Future Rendering Ideas

- Add post-processing in `render/three/`, such as bloom or SSAO.
- Add glTF/GLB flower models under a future `render/three/loaders/` folder.
- Add a separate experimental renderer under `render/experiments/` or another adapter implementation.
