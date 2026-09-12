export const GESTURE_LABELS = {
  Open_Palm: "OPEN PALM",
  Closed_Fist: "FIST",
  Pointing_Up: "POINTING UP",
  Thumb_Up: "THUMBS UP",
  Victory: "VICTORY",
  ILoveYou: "I LOVE YOU",
};

export const FINGER_TIPS = [4, 8, 12, 16, 20];
export const FINGER_PIPS = [3, 6, 10, 14, 18];

export function getGesture(result) {
  const category = result?.gestures?.[0]?.[0];
  const rawName = category?.categoryName || "None";
  return {
    rawName,
    name: GESTURE_LABELS[rawName] || "NONE",
    confidence: category?.score || 0,
  };
}

export function getHandedness(result) {
  return result?.handednesses?.[0]?.[0]?.displayName || result?.handednesses?.[0]?.[0]?.categoryName || "--";
}

export function getPinch(landmarks) {
  if (!landmarks?.[4] || !landmarks?.[8]) return { active: false, distance: 1 };
  const thumb = landmarks[4];
  const index = landmarks[8];
  const distance = Math.hypot(thumb.x - index.x, thumb.y - index.y, (thumb.z - index.z) * 0.5);
  return { active: distance < 0.075, distance };
}

export function getControlPoint(landmarks) {
  const point = landmarks?.[8];
  return point ? { x: 1 - point.x, y: point.y } : null;
}
