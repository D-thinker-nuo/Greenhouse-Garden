// requestAnimationFrame wrapper with delta time.
// 带 delta time 的 requestAnimationFrame 循环封装。
export class AppLoop {
  constructor(update) {
    // Function called every frame: update(deltaSeconds, elapsedSeconds).
    // 每帧调用的函数：update(deltaSeconds, elapsedSeconds)。
    this.update = update;
    this.lastTime = 0;
    this.frameId = null;
    this.tick = this.tick.bind(this);
  }

  // Start the render/update loop.
  // 启动渲染/更新循环。
  start() {
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  // Stop the loop if the app needs to be torn down.
  // 需要销毁应用时停止循环。
  stop() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  // One animation frame.
  // 单帧更新。
  tick(time) {
    const deltaSeconds = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.update(deltaSeconds, time / 1000);
    this.frameId = requestAnimationFrame(this.tick);
  }
}
