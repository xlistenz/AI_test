import * as THREE from "three";
import { ObjectInteraction } from "./objectInteraction.js";

const cyan = 0x62eaff;
const metal = 0x252d3b;
const darkMetal = 0x0e1420;

export class RobotArm {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x080d1d, 8, 18);
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    this.camera.position.set(4.2, 3.2, 5.7);
    this.camera.lookAt(0, 1.3, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.createLights();
    this.createEnvironment();
    this.createArm();
    this.objects = new ObjectInteraction(this.scene);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  createLights() {
    this.scene.add(new THREE.HemisphereLight(0x9bbcff, 0x080c16, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(3, 6, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); this.scene.add(key);
    const rim = new THREE.PointLight(cyan, 12, 7); rim.position.set(-2, 2.5, 2); this.scene.add(rim);
  }

  createEnvironment() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ color: 0x0a1122, metalness: 0.7, roughness: 0.42 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; this.scene.add(floor);
    const grid = new THREE.GridHelper(14, 28, cyan, 0x1d3151); grid.position.y = 0.012; grid.material.opacity = 0.28; grid.material.transparent = true; this.scene.add(grid);
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.2, 48), new THREE.MeshStandardMaterial({ color: 0x172033, metalness: 0.8, roughness: 0.3, emissive: 0x07182d, emissiveIntensity: 0.5 }));
    platform.position.y = 0.1; platform.receiveShadow = true; platform.castShadow = true; this.scene.add(platform);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.015, 6, 64), new THREE.MeshBasicMaterial({ color: cyan })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.22; this.scene.add(ring);
  }

  createArm() {
    this.base = new THREE.Group(); this.base.position.y = 0.22; this.root.add(this.base);
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.95, 0.42, 32), new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.92, roughness: 0.22 })); baseMesh.castShadow = true; this.base.add(baseMesh);
    const baseGlow = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.025, 8, 40), new THREE.MeshBasicMaterial({ color: cyan })); baseGlow.rotation.x = Math.PI / 2; baseGlow.position.y = 0.22; this.base.add(baseGlow);
    this.shoulder = new THREE.Group(); this.shoulder.position.y = 0.3; this.base.add(this.shoulder);
    const shoulderMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 16), new THREE.MeshStandardMaterial({ color: metal, metalness: 0.85, roughness: 0.25, emissive: 0x101f37, emissiveIntensity: 0.6 })); shoulderMesh.castShadow = true; this.shoulder.add(shoulderMesh);
    this.upper = this.makeSegment(0.95, 0.18); this.upper.position.y = 0.48; this.shoulder.add(this.upper);
    this.elbow = new THREE.Group(); this.elbow.position.y = 0.98; this.shoulder.add(this.elbow);
    this.elbowJoint = this.makeJoint(); this.elbow.add(this.elbowJoint);
    this.forearm = this.makeSegment(0.82, 0.15); this.forearm.position.y = 0.4; this.elbow.add(this.forearm);
    this.wrist = new THREE.Group(); this.wrist.position.y = 0.83; this.elbow.add(this.wrist);
    this.wrist.add(this.makeJoint(0.2));
    this.gripper = new THREE.Group(); this.gripper.position.y = 0.22; this.wrist.add(this.gripper);
    this.fingerLeft = this.makeFinger(-1); this.fingerRight = this.makeFinger(1); this.gripper.add(this.fingerLeft, this.fingerRight);
  }

  makeSegment(length, width) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, length, width), new THREE.MeshStandardMaterial({ color: metal, metalness: 0.82, roughness: 0.28 })); mesh.position.y = length / 2; mesh.castShadow = true; group.add(mesh);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(width + 0.025, length * 0.8, width + 0.025), new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: 0.35 })); edge.position.y = length / 2; group.add(edge); return group;
  }
  makeJoint(radius = 0.18) { const joint = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14), new THREE.MeshStandardMaterial({ color: metal, metalness: 0.9, roughness: 0.2, emissive: cyan, emissiveIntensity: 0.35 })); joint.castShadow = true; return joint; }
  makeFinger(side) { const finger = new THREE.Group(); finger.position.x = side * 0.09; const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.1), new THREE.MeshStandardMaterial({ color: 0x7e8b9d, metalness: 0.75, roughness: 0.24 })); mesh.position.y = 0.12; finger.add(mesh); return finger; }

  update(state, now = performance.now()) {
    this.base.rotation.y = state.base;
    this.shoulder.rotation.z = -state.shoulder;
    this.elbow.rotation.z = state.elbow - 0.8;
    this.wrist.rotation.z = state.wrist;
    const open = 1 - state.gripper;
    this.fingerLeft.rotation.z = 0.35 * open;
    this.fingerRight.rotation.z = -0.35 * open;
    const end = this.getGripperPosition();
    this.objects.update(end, state.gripper > 0.55);
    this.updateTrail(end);
  }

  getGripperPosition() { const position = new THREE.Vector3(); this.gripper.getWorldPosition(position); return [position.x, position.y, position.z]; }
  updateTrail(position) { if (!this.trail) { this.trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...position), new THREE.Vector3(...position)]), new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.28 })); this.scene.add(this.trail); } const points = this.trail.geometry.attributes.position; points.setXYZ(0, ...position); points.setXYZ(1, position[0], 0.03, position[2]); points.needsUpdate = true; }
  render() { this.renderer.render(this.scene, this.camera); }
  resize() { const width = this.container.clientWidth; const height = this.container.clientHeight || 400; this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height, false); }
  resetObjects() { this.objects.reset(); }
  destroy() { this.resizeObserver.disconnect(); this.renderer.dispose(); this.container.removeChild(this.renderer.domElement); }
}
