export class PerformanceMonitor {
  constructor({ onUpdate } = {}) {
    this.onUpdate = onUpdate;
    this.renderFrames = 0;
    this.aiFrames = 0;
    this.lastRender = performance.now();
    this.lastAi = performance.now();
    this.renderFps = 0;
    this.aiFps = 0;
    this.performanceMode = false;
  }

  frame(type) {
    const now = performance.now();
    if (type === "ai") this.aiFrames += 1;
    else this.renderFrames += 1;
    if (now - this.lastRender >= 500) {
      this.renderFps = Math.round((this.renderFrames * 1000) / (now - this.lastRender));
      this.renderFrames = 0;
      this.lastRender = now;
    }
    if (now - this.lastAi >= 500) {
      this.aiFps = Math.round((this.aiFrames * 1000) / (now - this.lastAi));
      this.aiFrames = 0;
      this.lastAi = now;
    }
    this.onUpdate?.({ renderFps: this.renderFps, aiFps: this.aiFps });
  }

  setMode(enabled) {
    this.performanceMode = enabled;
    return enabled;
  }
}
