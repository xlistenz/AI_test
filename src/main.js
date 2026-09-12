import "./style.css";
import { HandTracking } from "./handTracking.js";
import { getControlPoint, getGesture, getHandedness, getPinch, GestureStabilizer } from "./gesture.js";
import { VirtualHand, drawCameraLandmarks } from "./virtualHand.js";
import { RobotArm } from "./robotArm.js";
import { RobotController } from "./robotControl.js";
import { PerformanceMonitor } from "./performance.js";
import { createUI } from "./ui.js";

const ui = createUI();
const virtualHand = new VirtualHand(document.querySelector("#virtual-canvas"));
const robotArm = new RobotArm(ui.refs.robotCanvas);
const robotController = new RobotController();
const performanceMonitor = new PerformanceMonitor();
const gestureStabilizer = new GestureStabilizer({ threshold: 0.65, samples: 4 });
let tracker;
let latestLandmarks = null;
let latestPinch = { active: false };
let lastAiUpdate = performance.now();
let lastRenderUpdate = performance.now();
let enteredRobot = false;

function handleResult({ hands, gestures }) {
  const rightHandIndex = gestures.handednesses?.findIndex((hand) => (hand?.[0]?.displayName || hand?.[0]?.categoryName) === "Right");
  const handIndex = rightHandIndex >= 0 ? rightHandIndex : 0;
  latestLandmarks = hands.landmarks?.[handIndex] || null;
  const rawGesture = getGesture(gestures);
  const gesture = gestureStabilizer.update(rawGesture);
  latestPinch = getPinch(latestLandmarks);
  const handedness = getHandedness(gestures);
  performanceMonitor.frame("ai");
  const now = performance.now();
  if (now - lastAiUpdate < 250) return;
  lastAiUpdate = now;
  virtualHand.update(latestLandmarks, gesture.name, latestPinch.active);
  robotController.updateFromHand(latestLandmarks, latestPinch, now);
  ui.setTracking(Boolean(latestLandmarks));
  ui.setMetrics({ gesture: gesture.name, confidence: gesture.confidence, handedness, aiFps: performanceMonitor.aiFps, renderFps: performanceMonitor.renderFps, pinch: latestPinch.active, landmarks: latestLandmarks });
  ui.addHistory(gesture.name);
  if (ui.getOptions().showSkeleton) drawCameraLandmarks(ui.refs.cameraOverlay, latestLandmarks, ui.getOptions().mirror); else drawCameraLandmarks(ui.refs.cameraOverlay, null);
  const controlPoint = getControlPoint(latestLandmarks);
  ui.updateObject(controlPoint, latestPinch.active);
}

function render(now) {
  performanceMonitor.frame("render");
  const state = robotController.getState();
  robotController.smooth(now);
  robotArm.update(state, now);
  robotArm.render();
  virtualHand.draw(now);
  const position = state.target.handPosition || { x: 0.5, y: 0.63, z: 0.41 };
  ui.updateRobot(state, position, { aiFps: performanceMonitor.aiFps, renderFps: performanceMonitor.renderFps });
  lastRenderUpdate = now;
  requestAnimationFrame(render);
}

function cameraError(error) {
  const messages = { NotAllowedError: "攝影機權限被拒絕，請在瀏覽器設定中允許本網站使用攝影機。", NotFoundError: "找不到攝影機，請確認裝置已連接攝影機。", NotReadableError: "攝影機目前被其他應用程式使用，請先關閉後重試。", BROWSER_UNSUPPORTED: "此瀏覽器不支援 Camera API，請使用最新版 Chrome、Edge 或 Safari。" };
  ui.setStatus("offline"); ui.error(messages[error.message] || "攝影機或 AI 模型載入失敗，請重新整理後再試。");
}

function handleMode(mode) {
  if (mode === "robot" && !enteredRobot) { enteredRobot = true; document.querySelector("#robot-training").showModal(); }
  if (mode === "robot") robotController.setMode("free");
}

ui.bind({
  onMode: handleMode,
  onRobotMode: (mode) => { robotController.setMode(mode); document.querySelectorAll(".robot-mode").forEach((button) => button.classList.toggle("active", button.dataset.robotMode === mode)); },
  onHome: () => { robotController.homePosition(); robotArm.resetObjects(); },
  onDemo: () => robotController.runDemo(),
  onStop: () => robotController.emergencyStop(),
  onResume: () => robotController.resume(),
  onParameters: (parameters) => robotController.setParameters(parameters),
  onPerformance: (enabled) => { performanceMonitor.setMode(enabled); document.body.classList.toggle("performance-mode", enabled); },
});

ui.onStart(async () => {
  if (tracker?.running) { tracker.destroy(); ui.setStatus("offline"); ui.setTracking(false); latestLandmarks = null; return; }
  try { ui.setStatus("loading"); tracker = new HandTracking(ui.refs.video, { onResult: handleResult, onStatus: ui.setStatus }); await tracker.start(); } catch (error) { cameraError(error); }
});

ui.refs.mirror.addEventListener("change", () => ui.refs.video.classList.toggle("mirrored", ui.getOptions().mirror));
ui.refs.video.classList.add("mirrored");
document.querySelector("#close-training").addEventListener("click", () => document.querySelector("#robot-training").close());
document.querySelector("#start-training").addEventListener("click", () => document.querySelector("#robot-training").close());
window.addEventListener("beforeunload", () => { tracker?.destroy(); robotArm.destroy(); });
requestAnimationFrame(render);
