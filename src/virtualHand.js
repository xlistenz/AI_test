const CONNECTIONS = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const FINGER_PATHS = [[0,1,2,3,4],[0,5,6,7,8],[0,9,10,11,12],[0,13,14,15,16],[0,17,18,19,20]];

export class VirtualHand {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.landmarks = null;
    this.gesture = "NONE";
    this.pinch = false;
    this.particles = Array.from({ length: 26 }, (_, index) => ({ angle: index * 0.9, radius: 0.42 + (index % 5) * 0.035, speed: 0.0002 + (index % 4) * 0.00008 }));
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement);
    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = rect.width * ratio;
    this.canvas.height = rect.height * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
  }

  update(landmarks, gesture, pinch) {
    this.landmarks = landmarks;
    this.gesture = gesture;
    this.pinch = pinch;
  }

  draw(time = performance.now()) {
    const ctx = this.ctx;
    const { width, height } = this;
    ctx.clearRect(0, 0, width, height);
    this.drawParticles(ctx, time);
    if (!this.landmarks) return;
    const points = this.landmarks.map((point) => ({ x: (1 - point.x) * width, y: point.y * height, z: point.z }));
    const palm = points[0];
    const scale = Math.max(0.7, Math.min(1.35, 0.58 / Math.max(0.18, Math.abs(points[0].z) + 0.38)));
    ctx.save();
    ctx.translate(palm.x, palm.y);
    ctx.scale(scale, scale);
    ctx.translate(-palm.x, -palm.y);
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.pinch ? "#ffb84c" : "#48e8ff";
    this.drawConnections(ctx, points);
    this.drawPalmMesh(ctx, points);
    this.drawJoints(ctx, points);
    ctx.restore();
  }

  drawConnections(ctx, points) {
    ctx.lineCap = "round";
    CONNECTIONS.forEach(([from, to]) => {
      const gradient = ctx.createLinearGradient(points[from].x, points[from].y, points[to].x, points[to].y);
      gradient.addColorStop(0, "#55f0ff"); gradient.addColorStop(1, this.pinch ? "#ffb84c" : "#7b6dff");
      ctx.strokeStyle = gradient; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(points[from].x, points[from].y); ctx.lineTo(points[to].x, points[to].y); ctx.stroke();
    });
  }

  drawPalmMesh(ctx, points) {
    const palm = [points[0], points[5], points[9], points[13], points[17]];
    ctx.strokeStyle = "rgba(97, 222, 255, .25)"; ctx.lineWidth = 1;
    for (let i = 0; i < palm.length; i += 1) { const next = palm[(i + 1) % palm.length]; ctx.beginPath(); ctx.moveTo(palm[i].x, palm[i].y); ctx.lineTo(next.x, next.y); ctx.stroke(); }
    for (let i = 1; i < 5; i += 1) { ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); ctx.lineTo(points[i * 4 + 1].x, points[i * 4 + 1].y); ctx.stroke(); }
  }

  drawJoints(ctx, points) {
    points.forEach((point, index) => { ctx.beginPath(); ctx.fillStyle = index === 0 ? "#ffffff" : (this.pinch && [4, 8].includes(index) ? "#ffcf68" : "#5ff3ff"); ctx.arc(point.x, point.y, index === 0 ? 7 : 4.5, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(106, 234, 255, .8)"; ctx.lineWidth = 1; ctx.stroke(); });
  }

  drawParticles(ctx, time) {
    const centerX = this.width / 2; const centerY = this.height / 2;
    this.particles.forEach((particle) => { const angle = particle.angle + time * particle.speed; const x = centerX + Math.cos(angle) * this.width * particle.radius; const y = centerY + Math.sin(angle * 1.23) * this.height * particle.radius * 0.72; ctx.fillStyle = `rgba(72, 232, 255, ${0.18 + (particle.radius - .42) * 2})`; ctx.fillRect(x, y, 1.5, 1.5); });
  }

  destroy() { this.resizeObserver.disconnect(); }
}

export function drawCameraLandmarks(canvas, landmarks, mirrored = true) {
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth; const height = canvas.clientHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) { canvas.width = width * ratio; canvas.height = height * ratio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0); }
  ctx.clearRect(0, 0, width, height);
  if (!landmarks) return;
  const point = (item) => ({ x: (mirrored ? 1 - item.x : item.x) * width, y: item.y * height });
  CONNECTIONS.forEach(([from, to]) => { const a = point(landmarks[from]); const b = point(landmarks[to]); ctx.strokeStyle = "rgba(91, 236, 255, .85)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
  landmarks.forEach((item) => { const p = point(item); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
}
