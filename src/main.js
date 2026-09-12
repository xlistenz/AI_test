import "./style.css";
import { HandTracking } from "./handTracking.js";
import { getControlPoint, getGesture, getHandedness, getPinch } from "./gesture.js";
import { VirtualHand, drawCameraLandmarks } from "./virtualHand.js";
import { createUI } from "./ui.js";

const ui = createUI();
const virtualHand = new VirtualHand(ui.refs.virtualCanvas || document.querySelector("#virtual-canvas"));
let tracker;
let latestLandmarks = null;
let lastFrame = performance.now();
let frameCount = 0;
let fps = 0;
let pinchGrabbed = false;

function handleResult({ hands, gestures }) {
  latestLandmarks = hands.landmarks?.[0] || null;
  const gesture = getGesture(gestures);
  const pinch = getPinch(latestLandmarks);
  const handedness = getHandedness(gestures);
  frameCount += 1;
  const now = performance.now();
  if (now - lastFrame >= 500) { fps = Math.round((frameCount * 1000) / (now - lastFrame)); frameCount = 0; lastFrame = now; }
  virtualHand.update(latestLandmarks, gesture.name, pinch.active);
  ui.setTracking(Boolean(latestLandmarks));
  ui.setMetrics({ gesture: gesture.name, confidence: gesture.confidence, handedness, fps, pinch: pinch.active, landmarks: latestLandmarks });
  ui.addHistory(gesture.name);
  if (ui.getOptions().showSkeleton) drawCameraLandmarks(ui.refs.cameraOverlay, latestLandmarks, ui.getOptions().mirror); else drawCameraLandmarks(ui.refs.cameraOverlay, null);
  const controlPoint = getControlPoint(latestLandmarks);
  if (pinch.active && ui.mode === "object") pinchGrabbed = true;
  if (!pinch.active) pinchGrabbed = false;
  ui.updateObject(controlPoint, pinchGrabbed);
}

function render() { virtualHand.draw(); requestAnimationFrame(render); }
function cameraError(error) { const messages = { NotAllowedError: "攝影機權限被拒絕，請在瀏覽器設定中允許本網站使用攝影機。", NotFoundError: "找不到攝影機，請確認裝置已連接攝影機。", NotReadableError: "攝影機目前被其他應用程式使用，請先關閉後重試。", BROWSER_UNSUPPORTED: "此瀏覽器不支援 Camera API，請使用最新版 Chrome、Edge 或 Safari。" }; ui.setStatus("offline"); ui.error(messages[error.message] || "攝影機或 AI 模型載入失敗，請重新整理後再試。"); }

ui.onStart(async () => {
  if (tracker?.running) { tracker.destroy(); ui.setStatus("offline"); ui.setTracking(false); return; }
  try { ui.setStatus("loading"); tracker = new HandTracking(ui.refs.video, { onResult: handleResult, onStatus: ui.setStatus }); await tracker.start(); } catch (error) { cameraError(error); }
});

ui.refs.mirror.addEventListener("change", () => { ui.refs.video.classList.toggle("mirrored", ui.getOptions().mirror); });
ui.refs.video.classList.add("mirrored");
window.addEventListener("beforeunload", () => tracker?.destroy());
render();
