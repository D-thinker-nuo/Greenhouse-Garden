// Base renderer interface for future renderer swaps.
// 渲染器基础接口，方便以后切换 Three.js/WebGPU/path tracing 等实现。
export class RendererAdapter {
  // Active camera used by interaction raycasting.
  // 交互射线拾取使用的当前相机。
  get camera() {
    throw new Error("RendererAdapter.camera must be implemented");
  }

  // Canvas element receiving pointer input.
  // 接收鼠标输入的画布元素。
  get domElement() {
    throw new Error("RendererAdapter.domElement must be implemented");
  }

  // Update canvas/camera sizes.
  // 更新画布和相机尺寸。
  resize() {
    throw new Error("RendererAdapter.resize must be implemented");
  }

  // Draw one frame.
  // 绘制一帧。
  render() {
    throw new Error("RendererAdapter.render must be implemented");
  }

  // Free GPU resources.
  // 释放 GPU 资源。
  dispose() {
    throw new Error("RendererAdapter.dispose must be implemented");
  }
}
