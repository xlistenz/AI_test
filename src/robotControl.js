const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

export class RobotController {
  constructor() {
    this.mode = "free";
    this.sensitivity = 0.5;
    this.smoothness = 0.7;
    this.deadZone = 0.05;
    this.stopped = false;
    this.demo = null;
    this.target = { base: 0, shoulder: 0.45, elbow: 0.78, wrist: 0, gripper: 0 };
    this.current = { ...this.target };
    this.home = { base: 0, shoulder: 0.26, elbow: 0.78, wrist: 0, gripper: 0 };
  }

  setMode(mode) { this.mode = mode; }
  setParameters({ sensitivity, smoothness, deadZone }) { this.sensitivity = sensitivity; this.smoothness = smoothness; this.deadZone = deadZone; }
  emergencyStop() { this.stopped = true; this.demo = null; }
  resume() { this.stopped = false; }
  homePosition() { this.target = { ...this.home }; this.demo = null; }
  runDemo(now = performance.now()) { this.stopped = false; this.mode = "demo"; this.demo = { started: now, duration: 11500 }; }

  updateFromHand(landmarks, pinch, now = performance.now()) {
    if (this.stopped || this.mode === "demo" || !landmarks) return;
    const palm = landmarks[0];
    const middle = landmarks[9];
    const indexMcp = landmarks[5];
    const pinkyMcp = landmarks[17];
    const handSize = Math.max(0.08, Math.hypot(palm.x - middle.x, palm.y - middle.y));
    const palmX = 1 - palm.x;
    const palmY = palm.y;
    const tilt = Math.atan2(indexMcp.y - pinkyMcp.y, indexMcp.x - pinkyMcp.x);
    const normalizedX = Math.abs(palmX - 0.5) < this.deadZone ? 0.5 : palmX;
    this.target.base = (normalizedX - 0.5) * Math.PI * this.sensitivity * 1.8;
    this.target.shoulder = clamp((0.65 - palmY) * 1.45 * this.sensitivity + 0.35, -0.15, 1.25);
    this.target.elbow = clamp(1.24 - handSize * 2.1 * this.sensitivity, 0.25, 1.22);
    this.target.wrist = clamp(tilt * 1.8, -1.1, 1.1);
    this.target.gripper = pinch.active ? 1 : 0;
    this.target.handPosition = { x: palmX, y: palmY, z: clamp((handSize - 0.12) * 2.6, 0, 1) };
    this.smooth(now);
  }

  smooth(now = performance.now()) {
    if (this.demo) this.updateDemo(now);
    const amount = 0.08 + this.smoothness * 0.16;
    Object.keys(this.current).forEach((key) => {
      if (key === "handPosition") return;
      this.current[key] = lerp(this.current[key], this.target[key], amount);
    });
  }

  updateDemo(now) {
    const elapsed = (now - this.demo.started) % this.demo.duration;
    const phase = elapsed / this.demo.duration;
    const wave = (start, end, from, to) => {
      const progress = clamp((phase - start) / (end - start), 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      return from + (to - from) * eased;
    };
    this.target.base = phase < 0.22 ? wave(0, 0.22, 0, 0.7) : phase < 0.68 ? 0.7 : wave(0.68, 0.9, 0.7, 0);
    this.target.shoulder = phase < 0.25 ? 0.3 : phase < 0.68 ? 0.95 : wave(0.68, 0.92, 0.95, 0.26);
    this.target.elbow = phase < 0.3 ? 0.9 : phase < 0.68 ? 0.35 : wave(0.68, 0.92, 0.35, 0.78);
    this.target.wrist = Math.sin(phase * Math.PI * 2) * 0.2;
    this.target.gripper = phase > 0.44 && phase < 0.63 ? 1 : 0;
    this.smoothness = 0.78;
  }

  getState() { return { ...this.current, target: { ...this.target }, stopped: this.stopped, mode: this.mode }; }
}
