import * as THREE from "three";

export class ObjectInteraction {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.held = null;
    this.createObjects();
  }

  createObjects() {
    const items = [
      ["CUBE", new THREE.BoxGeometry(0.22, 0.22, 0.22), 0xffb84c, [-1.45, 0.14, -0.55]],
      ["SPHERE", new THREE.SphereGeometry(0.14, 18, 12), 0x62eaff, [-0.9, 0.14, -0.85]],
      ["CYLINDER", new THREE.CylinderGeometry(0.13, 0.13, 0.25, 18), 0x9d88ff, [0.85, 0.14, -0.8]],
      ["RING", new THREE.TorusGeometry(0.14, 0.035, 8, 24), 0x4ee7a4, [1.4, 0.17, -0.45]],
      ["BOX", new THREE.BoxGeometry(0.28, 0.16, 0.18), 0xff718c, [0.25, 0.1, -1.25]],
    ];
    items.forEach(([name, geometry, color, position]) => {
      const material = new THREE.MeshStandardMaterial({ color, metalness: 0.62, roughness: 0.28, emissive: color, emissiveIntensity: 0.12 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.userData = { name, home: mesh.position.clone(), held: false };
      this.scene.add(mesh);
      this.objects.push(mesh);
    });
  }

  update(gripperPosition, closed) {
    const gripper = new THREE.Vector3(...gripperPosition);
    if (closed && !this.held) {
      this.held = this.objects.find((object) => object.position.distanceTo(gripper) < 0.62) || null;
      if (this.held) this.held.userData.held = true;
    }
    if (this.held && closed) {
      this.held.position.lerp(gripper, 0.25);
      this.held.rotation.y += 0.04;
    }
    if (this.held && !closed) {
      this.held.userData.held = false;
      this.held = null;
    }
  }

  reset() {
    this.held = null;
    this.objects.forEach((object) => { object.position.copy(object.userData.home); object.userData.held = false; });
  }
}
