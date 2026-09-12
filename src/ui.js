const NAMES = ["WRIST", "THUMB CMC", "THUMB MCP", "THUMB IP", "THUMB TIP", "INDEX MCP", "INDEX PIP", "INDEX DIP", "INDEX TIP", "MIDDLE MCP", "MIDDLE PIP", "MIDDLE DIP", "MIDDLE TIP", "RING MCP", "RING PIP", "RING DIP", "RING TIP", "PINKY MCP", "PINKY PIP", "PINKY DIP", "PINKY TIP"];

export function createUI() {
  const $ = (selector) => document.querySelector(selector);
  const history = [];
  let currentMode = "virtual";
  let developerMode = false;
  let lastGesture = "NONE";
  const refs = { video: $("#camera-video"), cameraOverlay: $("#camera-overlay"), placeholder: $("#camera-placeholder"), start: $("#start-camera"), cameraState: $("#camera-state"), tracking: $("#tracking-state"), stageMessage: $("#stage-message"), object: $("#object-orb"), skeleton: $("#skeleton-toggle"), mirror: $("#mirror-toggle"), modeLabel: $("#mode-label"), gestureLabel: $("#gesture-label"), metricGesture: $("#metric-gesture"), metricConfidence: $("#metric-confidence"), metricHand: $("#metric-hand"), metricTracking: $("#metric-tracking"), metricFps: $("#metric-fps"), metricPinch: $("#metric-pinch"), history: $("#gesture-history"), developerToggle: $("#developer-toggle"), developerPanel: $("#developer-panel"), landmarkGrid: $("#landmark-grid"), bottomStatus: $("#bottom-status"), toast: $("#toast") };

  function setStatus(status) {
    const states = { loading: ["LOADING", "Loading AI Hand Tracking...", "loading"], active: ["ACTIVE", "AI Tracking Active", "active"], offline: ["OFFLINE", "Camera Offline", "offline"] };
    const [label, bottom, className] = states[status] || states.offline;
    refs.cameraState.textContent = label; refs.cameraState.className = `live-badge ${className}`; refs.bottomStatus.textContent = bottom;
    if (status === "loading") refs.start.disabled = true;
    if (status === "active") { refs.placeholder.classList.add("hidden"); refs.stageMessage.classList.add("hidden"); refs.start.textContent = "停止攝影機"; refs.start.disabled = false; }
    if (status === "offline") { refs.placeholder.classList.remove("hidden"); refs.stageMessage.classList.remove("hidden"); refs.start.textContent = "◎ 啟動攝影機"; refs.start.disabled = false; }
  }

  function setTracking(active) { refs.tracking.innerHTML = `<i></i> ${active ? "TRACKING ACTIVE" : "WAITING FOR HAND"}`; refs.tracking.classList.toggle("active", active); refs.metricTracking.textContent = active ? "ACTIVE" : "IDLE"; }
  function setMetrics({ gesture, confidence, handedness, fps, pinch, landmarks }) { refs.gestureLabel.textContent = gesture; refs.metricGesture.textContent = gesture; refs.metricConfidence.textContent = confidence ? `${Math.round(confidence * 100)}%` : "--%"; refs.metricHand.textContent = handedness; refs.metricFps.textContent = fps ? String(fps) : "--"; refs.metricPinch.textContent = pinch ? "ON" : "OFF"; refs.metricPinch.classList.toggle("success-text", pinch); updateLandmarks(landmarks); }
  function addHistory(gesture) { if (!gesture || gesture === "NONE" || gesture === lastGesture) return; lastGesture = gesture; history.unshift({ time: new Date().toLocaleTimeString("en-GB"), gesture }); history.splice(5); refs.history.innerHTML = history.map((item) => `<li><time>${item.time}</time><span>${item.gesture}</span></li>`).join(""); }
  function updateLandmarks(landmarks) { if (!developerMode || !landmarks) return; refs.landmarkGrid.innerHTML = landmarks.map((point, index) => `<div><span>${String(index).padStart(2, "0")} · ${NAMES[index]}</span><b>X ${point.x.toFixed(3)}　Y ${point.y.toFixed(3)}</b></div>`).join(""); }
  function setMode(mode) { currentMode = mode; const labels = { virtual: "VIRTUAL HAND", object: "OBJECT CONTROL", lab: "GESTURE LAB" }; refs.modeLabel.textContent = labels[mode]; refs.object.classList.toggle("visible", mode === "object"); document.querySelectorAll(".mode-button").forEach((button) => { const active = button.dataset.mode === mode; button.classList.toggle("active", active); button.setAttribute("aria-selected", active); }); }
  function updateObject(point, grabbed) { if (!point || currentMode !== "object") return; refs.object.style.left = `${point.x * 100}%`; refs.object.style.top = `${point.y * 100}%`; refs.object.classList.toggle("grabbed", grabbed); }
  function error(message) { refs.toast.textContent = message; refs.toast.classList.add("show"); window.setTimeout(() => refs.toast.classList.remove("show"), 5000); }
  function toggleDeveloper() { developerMode = !developerMode; refs.developerPanel.classList.toggle("hidden", !developerMode); refs.developerToggle.querySelector("b").textContent = developerMode ? "ON" : "OFF"; }
  function onStart(callback) { refs.start.addEventListener("click", callback); }
  function getOptions() { return { showSkeleton: refs.skeleton.checked, mirror: refs.mirror.checked }; }
  document.querySelectorAll(".mode-button").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  refs.developerToggle.addEventListener("click", toggleDeveloper);
  $("#help-button").addEventListener("click", () => $("#help-dialog").showModal()); $("#close-help").addEventListener("click", () => $("#help-dialog").close()); $("#dialog-start").addEventListener("click", () => $("#help-dialog").close());
  return { refs, setStatus, setTracking, setMetrics, addHistory, updateObject, error, onStart, getOptions, get mode() { return currentMode; } };
}
