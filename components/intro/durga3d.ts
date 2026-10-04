"use client";

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const PI = Math.PI;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export function makeEnv(renderer: THREE.WebGLRenderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(new RoomEnvironment(), 0.04);
  pm.dispose();
  return rt.texture;
}

export function glowTex(stops: Array<[number, string]>) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** 3D माँ दुर्गा — सुनहरी मूर्ति: कमल पर खड़ी, 8 भुजाएँ, शस्त्र, प्रभामंडल, सिंह */
export function buildDurga() {
  const root = new THREE.Group();
  const g = new THREE.Group();
  root.add(g);

  const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.55, side: THREE.DoubleSide, ...o });
  const gold = std(0xe2b04a, { metalness: 0.95, roughness: 0.26, emissive: 0x4a2a00, emissiveIntensity: 0.6 });
  const goldDk = std(0xc98a1e, { metalness: 0.9, roughness: 0.35, emissive: 0x2a1400 });
  const red = std(0x9b0f26, { roughness: 0.55, metalness: 0.1, emissive: 0x35000c });
  const skin = std(0xe8ae7e, { roughness: 0.5, emissive: 0x3a1a0c });
  const hair = std(0x160812, { roughness: 0.6 });
  const steel = std(0xe6edf5, { metalness: 1, roughness: 0.15 });
  const pink = (c: number) => std(c, { roughness: 0.4, emissive: c, emissiveIntensity: 0.25 });
  const glow = (c = 0xffd166, o = 0.85) =>
    new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });

  const add = (p: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    p.add(m);
    return m;
  };
  const lathe = (pts: Array<[number, number]>, mat: THREE.Material) => {
    const c = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
    return new THREE.Mesh(new THREE.LatheGeometry(c.getPoints(40), 48), mat);
  };
  const spike = (p: THREE.Object3D, mat: THREE.Material, r: number, h: number, a: number, rad: number, z = 0) => {
    const m = add(p, new THREE.ConeGeometry(r, h, 6), mat, Math.cos(a) * rad, Math.sin(a) * rad, z);
    m.rotation.z = a - PI / 2;
    return m;
  };

  /* ---------- आधार + कमल ---------- */
  add(g, new THREE.CylinderGeometry(3.4, 3.6, 0.18, 64), goldDk, 0, -0.09, 0);
  const baseRing = add(g, new THREE.TorusGeometry(3.0, 0.04, 8, 96), glow(), 0, 0.03, 0);
  baseRing.rotation.x = PI / 2;
  const lotus = new THREE.Group();
  g.add(lotus);
  const petalGeo = new THREE.SphereGeometry(1, 14, 10);
  ([[18, 1.3, 0.3, 0xff4f93], [14, 1.0, 0.6, 0xff86b4], [10, 0.7, 0.95, 0xffc4da]] as const).forEach(([n, r, tilt, col], li) => {
    const mat = pink(col);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * PI * 2 + li * 0.15;
      const p = add(lotus, petalGeo, mat, Math.sin(a) * r, 0.2 + li * 0.1, Math.cos(a) * r);
      p.scale.set(0.3, 0.07, 0.8);
      p.rotation.order = "YXZ";
      p.rotation.y = a;
      p.rotation.x = -tilt;
    }
  });
  add(lotus, new THREE.CylinderGeometry(0.85, 0.95, 0.35, 32), gold, 0, 0.35, 0);

  /* ---------- साड़ी (प्लीट्स) + वक्ष ---------- */
  const sari = lathe([[1.05, 0.5], [0.97, 0.9], [0.8, 1.6], [0.6, 2.25], [0.45, 2.75], [0.4, 3.0]], red);
  {
    const pos = sari.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), an = Math.atan2(z, x);
      const k = 1 + 0.05 * Math.sin(an * 16) * clamp((2.6 - y) / 2) + 0.02 * Math.sin(y * 9 + an * 3);
      pos.setXYZ(i, x * k, y, z * k);
    }
    sari.geometry.computeVertexNormals();
  }
  sari.scale.z = 0.8;
  g.add(sari);
  [[0.52, 0.045], [0.66, 0.025]].forEach(([y, t]) => {
    const h = add(g, new THREE.TorusGeometry(1.04 - (y - 0.52) * 0.3, t, 8, 72), gold, 0, y, 0);
    h.rotation.x = PI / 2;
    h.scale.y = 0.8;
  });
  const belt = add(g, new THREE.TorusGeometry(0.42, 0.05, 8, 40), gold, 0, 2.98, 0);
  belt.rotation.x = PI / 2;
  belt.scale.y = 0.8;
  const drape = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.45, 3.75, 0.2), new THREE.Vector3(0, 3.3, 0.36), new THREE.Vector3(0.42, 2.5, 0.4), new THREE.Vector3(0.6, 1.5, 0.5)]);
  add(g, new THREE.TubeGeometry(drape, 24, 0.07, 8), std(0xff8a3d, { roughness: 0.5, emissive: 0x401800 }));
  const blouse = lathe([[0.41, 2.95], [0.46, 3.2], [0.54, 3.5], [0.47, 3.8], [0.18, 3.98]], goldDk);
  blouse.scale.z = 0.72;
  g.add(blouse);
  [[0.3, 3.78], [0.36, 3.62], [0.42, 3.46]].forEach(([r, y]) => {
    const n = add(g, new THREE.TorusGeometry(r, 0.025, 8, 32), gold, 0, y, 0.1);
    n.rotation.x = PI / 2.4;
  });
  add(g, new THREE.SphereGeometry(0.07, 12, 12), pink(0xff2d55), 0, 3.42, 0.34);

  /* ---------- सिर (लंबा, मूर्ति जैसा चेहरा) ---------- */
  add(g, new THREE.CylinderGeometry(0.11, 0.14, 0.4, 16), skin, 0, 4.02, 0);
  const head = add(g, new THREE.SphereGeometry(0.4, 40, 28), skin, 0, 4.38, 0.02);
  head.scale.set(0.78, 1.1, 0.86);
  add(g, new THREE.SphereGeometry(0.2, 20, 16), skin, 0, 4.13, 0.08).scale.set(0.85, 0.9, 0.8);
  const cap = add(g, new THREE.SphereGeometry(0.44, 28, 18, 0, PI * 2, 0, PI * 0.46), hair, 0, 4.42, -0.06);
  cap.scale.set(0.84, 1.08, 0.97);
  cap.rotation.x = -0.45;
  add(g, new THREE.SphereGeometry(0.28, 16, 12), hair, 0, 4.35, -0.38);
  const browG = new THREE.BoxGeometry(0.2, 0.022, 0.03);
  const whiteM = std(0xfffaf2, { roughness: 0.3 });
  [-1, 1].forEach((s) => {
    add(g, new THREE.SphereGeometry(0.06, 14, 10), whiteM, s * 0.125, 4.44, 0.318).scale.set(1.7, 0.6, 0.4);
    add(g, new THREE.SphereGeometry(0.03, 10, 8), hair, s * 0.125, 4.44, 0.34);
    const ln = add(g, new THREE.SphereGeometry(0.06, 12, 8), hair, s * 0.135, 4.468, 0.316);
    ln.scale.set(2.3, 0.26, 0.4);
    ln.rotation.z = s * 0.16;
    const b = add(g, browG, hair, s * 0.135, 4.54, 0.3);
    b.rotation.z = s * 0.22;
    add(g, new THREE.SphereGeometry(0.05, 10, 8), skin, s * 0.3, 4.35, 0.0).scale.set(0.5, 1.2, 0.8);
    add(g, new THREE.SphereGeometry(0.03, 8, 8), gold, s * 0.325, 4.27, 0.0);
    add(g, new THREE.SphereGeometry(0.045, 10, 10), gold, s * 0.325, 4.17, 0.0);
  });
  add(g, new THREE.SphereGeometry(0.035, 10, 10), skin, 0, 4.31, 0.345).scale.set(1, 1.4, 1.2);
  add(g, new THREE.SphereGeometry(0.05, 10, 8), pink(0xc4143a), 0, 4.2, 0.325).scale.set(1.7, 0.5, 0.6);
  const lip = add(g, new THREE.TorusGeometry(0.07, 0.01, 6, 16, PI), pink(0x9a0f2e), 0, 4.222, 0.318);
  lip.rotation.z = PI;
  add(g, new THREE.SphereGeometry(0.03, 10, 10), pink(0xff1744), 0, 4.6, 0.31).scale.set(0.8, 1.6, 0.6);

  /* ---------- मुकुट ---------- */
  add(g, new THREE.CylinderGeometry(0.3, 0.44, 0.4, 32, 1, true), gold, 0, 4.86, -0.02);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * PI * 2;
    add(g, new THREE.ConeGeometry(0.06, 0.3, 6), gold, Math.cos(a) * 0.3, 5.2, Math.sin(a) * 0.3 - 0.02);
  }
  add(g, new THREE.ConeGeometry(0.12, 0.55, 8), gold, 0, 5.3, -0.02);
  add(g, new THREE.SphereGeometry(0.06, 10, 10), pink(0xff2d55), 0, 4.9, 0.42);

  /* ---------- प्रभामंडल (halo) ---------- */
  const halo = new THREE.Group();
  halo.position.set(0, 4.4, -0.55);
  g.add(halo);
  add(halo, new THREE.TorusGeometry(1.55, 0.05, 10, 80), gold);
  add(halo, new THREE.TorusGeometry(1.3, 0.02, 8, 80), glow(0xff86b4, 0.9));
  for (let i = 0; i < 32; i++) spike(halo, gold, 0.05, i % 2 ? 0.24 : 0.42, (i / 32) * PI * 2, 1.72 + (i % 2 ? 0 : 0.08));

  /* ---------- पीछे का दिव्य मंडल ---------- */
  const mandala = new THREE.Group();
  mandala.position.set(0, 3.1, -1.7);
  g.add(mandala);
  add(mandala, new THREE.TorusGeometry(3.5, 0.035, 8, 120), glow());
  add(mandala, new THREE.TorusGeometry(2.1, 0.02, 8, 100), glow(0xff86b4, 0.7));
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * PI * 2;
    const b = add(mandala, new THREE.BoxGeometry(0.025, i % 2 ? 0.35 : 0.65, 0.02), glow(), Math.cos(a) * 3.8, Math.sin(a) * 3.8, 0);
    b.rotation.z = a - PI / 2;
  }
  const mandala2 = new THREE.Group();
  mandala2.position.set(0, 3.1, -1.8);
  g.add(mandala2);
  const pm = glow(0xff4f93, 0.28);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * PI * 2;
    const p = add(mandala2, petalGeo, pm, Math.cos(a) * 2.8, Math.sin(a) * 2.8, 0);
    p.scale.set(0.34, 0.9, 0.04);
    p.rotation.z = a - PI / 2;
  }
  const aura = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex([[0, "rgba(255,210,120,.95)"], [0.35, "rgba(255,110,60,.35)"], [1, "rgba(0,0,0,0)"]]), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  aura.scale.setScalar(10);
  aura.position.set(0, 3.2, -2.4);
  g.add(aura);

  /* ---------- 8 भुजाएँ + शस्त्र ---------- */
  const L = 1.25;
  const upperGeo = new THREE.CylinderGeometry(0.06, 0.052, 0.64, 12).translate(0, 0.32, 0);
  const foreGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.62, 12).translate(0, 0.31, 0);
  const handGeo = new THREE.SphereGeometry(0.1, 12, 10);
  const braceGeo = new THREE.TorusGeometry(0.075, 0.018, 6, 16);
  const spinners: THREE.Object3D[] = [];
  const arms: Array<{ g: THREE.Group; s: number; base: number; k: number }> = [];

  const weapon = (kind: string, p: THREE.Group) => {
    if (kind === "trishul") {
      add(p, new THREE.CylinderGeometry(0.024, 0.024, 2.5, 8), gold, 0, 0.8, 0);
      add(p, new THREE.ConeGeometry(0.07, 0.5, 8), gold, 0, 2.3, 0);
      [-1, 1].forEach((s) => add(p, new THREE.ConeGeometry(0.05, 0.38, 8), gold, s * 0.17, 2.05, 0));
      const u = add(p, new THREE.TorusGeometry(0.17, 0.025, 8, 16, PI), gold, 0, 1.88, 0);
      u.rotation.z = PI;
    } else if (kind === "sword") {
      add(p, new THREE.BoxGeometry(0.1, 1.2, 0.015), steel, 0, 0.7, 0);
      add(p, new THREE.ConeGeometry(0.05, 0.2, 4), steel, 0, 1.4, 0);
      add(p, new THREE.BoxGeometry(0.32, 0.05, 0.06), gold, 0, 0.1, 0);
    } else if (kind === "chakra") {
      const c = new THREE.Group();
      c.position.y = 0.45;
      p.add(c);
      add(c, new THREE.TorusGeometry(0.36, 0.035, 8, 40), steel);
      add(c, new THREE.TorusGeometry(0.16, 0.02, 8, 24), gold);
      for (let i = 0; i < 16; i++) spike(c, steel, 0.03, 0.14, (i / 16) * PI * 2, 0.43);
      spinners.push(c);
    } else if (kind === "mace") {
      add(p, new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), gold, 0, 0.55, 0);
      add(p, new THREE.SphereGeometry(0.22, 16, 12), goldDk, 0, 1.4, 0);
      for (let i = 0; i < 8; i++) spike(p, gold, 0.045, 0.16, (i / 8) * PI * 2, 0.26).position.y += 1.4;
    } else if (kind === "conch") {
      const s = add(p, new THREE.SphereGeometry(0.2, 16, 12), std(0xfff3e0, { roughness: 0.3 }), 0, 0.3, 0);
      s.scale.set(0.8, 1.35, 0.8);
      add(p, new THREE.ConeGeometry(0.1, 0.3, 10), std(0xfff3e0, { roughness: 0.3 }), 0, 0.72, 0);
      add(p, new THREE.TorusGeometry(0.13, 0.02, 6, 16), gold, 0, 0.12, 0).rotation.x = PI / 2;
    } else if (kind === "bow") {
      const b = add(p, new THREE.TorusGeometry(0.75, 0.03, 8, 32, PI), gold, 0, 0.4, 0);
      b.rotation.z = -PI / 2;
      add(p, new THREE.CylinderGeometry(0.006, 0.006, 1.5, 4), steel, 0, 0.4, 0);
    } else if (kind === "lotus") {
      add(p, new THREE.ConeGeometry(0.15, 0.34, 10), pink(0xff4f93), 0, 0.28, 0);
      add(p, new THREE.ConeGeometry(0.1, 0.28, 8), pink(0xffc4da), 0, 0.3, 0.02);
    } else {
      add(p, new THREE.SphereGeometry(0.15, 14, 12), gold, 0, 0.22, 0);
      add(p, new THREE.CylinderGeometry(0.08, 0.1, 0.1, 12), gold, 0, 0.05, 0);
    }
  };
  const right = ["trishul", "sword", "chakra", "lotus"];
  const left = ["mace", "conch", "bow", "kalash"];
  const angles = [26, 66, 106, 150].map((d) => (d * PI) / 180);
  [1, -1].forEach((s) => {
    for (let k = 0; k < 4; k++) {
      const a = new THREE.Group();
      a.position.set(s * 0.46, 3.55, 0.06);
      add(a, new THREE.SphereGeometry(0.13, 12, 10), gold);
      add(a, upperGeo, skin);
      add(a, braceGeo, gold, 0, 0.22, 0).rotation.x = PI / 2;
      const el = new THREE.Group();
      el.position.y = 0.64;
      el.rotation.z = s * 0.4;
      a.add(el);
      add(el, new THREE.SphereGeometry(0.058, 10, 8), skin);
      add(el, foreGeo, skin);
      add(el, braceGeo, gold, 0, 0.42, 0).rotation.x = PI / 2;
      add(el, braceGeo, gold, 0, 0.5, 0).rotation.x = PI / 2;
      add(el, handGeo, skin, 0, 0.62, 0).scale.set(0.85, 1.2, 0.7);
      const w = new THREE.Group();
      w.position.y = 0.62;
      el.add(w);
      weapon((s > 0 ? right : left)[k], w);
      g.add(a);
      arms.push({ g: a, s, base: angles[k], k });
    }
  });

  /* ---------- सिंह ---------- */
  const lion = new THREE.Group();
  lion.position.set(-2.4, 0.05, 1.0);
  lion.rotation.y = 0.55;
  lion.scale.setScalar(0.85);
  g.add(lion);
  const lg = std(0xe8a22a, { metalness: 0.6, roughness: 0.4, emissive: 0x2a1400 });
  const mane = std(0xa85f10, { metalness: 0.4, roughness: 0.6 });
  add(lion, new THREE.SphereGeometry(1, 20, 16), lg, 0, 1.05, 0).scale.set(0.62, 0.55, 1.05);
  add(lion, new THREE.SphereGeometry(0.85, 24, 18), mane, 0, 1.5, 0.7).scale.set(1.05, 1.05, 0.9);
  add(lion, new THREE.SphereGeometry(0.4, 20, 16), lg, 0, 1.55, 1.05).scale.set(0.95, 0.95, 1.15);
  add(lion, new THREE.SphereGeometry(0.22, 12, 10), std(0xf5c76a), 0, 1.42, 1.45).scale.set(1, 0.72, 1.45);
  add(lion, new THREE.SphereGeometry(0.06, 8, 8), hair, 0, 1.5, 1.75);
  [-1, 1].forEach((s) => {
    add(lion, new THREE.SphereGeometry(0.03, 8, 8), hair, s * 0.17, 1.64, 1.42).scale.set(1.6, 0.8, 1);
    add(lion, new THREE.ConeGeometry(0.1, 0.18, 8), mane, s * 0.3, 1.95, 1.0);
    add(lion, new THREE.CylinderGeometry(0.16, 0.12, 0.95, 10), lg, s * 0.3, 0.52, 0.75);
    add(lion, new THREE.CylinderGeometry(0.18, 0.13, 0.95, 10), lg, s * 0.32, 0.52, -0.65);
    add(lion, new THREE.SphereGeometry(0.14, 10, 8), lg, s * 0.3, 0.05, 0.82).scale.set(1, 0.6, 1.4);
    add(lion, new THREE.SphereGeometry(0.14, 10, 8), lg, s * 0.32, 0.05, -0.58).scale.set(1, 0.6, 1.4);
  });
  const tail = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.0, -1), new THREE.Vector3(0, 1.3, -1.6), new THREE.Vector3(0.25, 1.9, -1.5), new THREE.Vector3(0.1, 2.15, -1.15)]);
  add(lion, new THREE.TubeGeometry(tail, 20, 0.05, 8), lg);
  add(lion, new THREE.SphereGeometry(0.13, 10, 10), mane, 0.1, 2.18, -1.12);

  /* ---------- चिंगारियाँ ---------- */
  const N = 260;
  const sp = new Float32Array(N * 3), sv = new Float32Array(N);
  const respawn = (i: number, y?: number) => {
    const a = Math.random() * PI * 2, r = 0.5 + Math.random() * 3.6;
    sp.set([Math.cos(a) * r, y ?? Math.random() * 7.5, Math.sin(a) * r], i * 3);
    sv[i] = 0.25 + Math.random() * 0.7;
  };
  for (let i = 0; i < N; i++) respawn(i);
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const sparks = new THREE.Points(
    sg,
    new THREE.PointsMaterial({ map: glowTex([[0, "rgba(255,240,200,1)"], [0.4, "rgba(255,180,70,.6)"], [1, "rgba(0,0,0,0)"]]), size: 0.2, color: 0xffd98a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  root.add(sparks);

  /* ---------- रोशनी ---------- */
  const key = new THREE.PointLight(0xffdca0, 260, 40, 2);
  key.position.set(0, 5.5, 9);
  const fill = new THREE.PointLight(0xffb070, 60, 20, 2);
  fill.position.set(0, 3.8, 3);
  const rimL = new THREE.PointLight(0xff4f9a, 180, 30, 2);
  rimL.position.set(-6, 3, -2);
  const rimR = new THREE.PointLight(0xff9a3c, 180, 30, 2);
  rimR.position.set(6, 2, -2);
  root.add(new THREE.AmbientLight(0xffe3c0, 0.5), key, fill, rimL, rimR);

  function update(t: number, dt: number, reveal = 1) {
    const e = 1 - Math.pow(1 - clamp(reveal), 3);
    root.visible = reveal > 0;
    g.scale.setScalar(0.55 + 0.45 * e);
    g.position.y = -1.6 * (1 - e) + Math.sin(t * 1.5) * 0.04;
    lotus.scale.set(0.25 + 0.75 * e, 0.6 + 0.4 * e, 0.25 + 0.75 * e);
    halo.scale.setScalar(0.2 + 0.8 * e);
    mandala.rotation.z = t * 0.1;
    mandala.scale.setScalar(0.3 + 0.7 * e);
    mandala2.rotation.z = -t * 0.18;
    mandala2.scale.setScalar(0.3 + 0.7 * e);
    (aura.material as THREE.SpriteMaterial).opacity = (0.75 + Math.sin(t * 2) * 0.12) * e;
    const spread = 0.06 + 0.94 * clamp((e - 0.25) / 0.75);
    arms.forEach((a) => {
      a.g.rotation.z = -a.s * (a.base * spread + Math.sin(t * 1.4 + a.k * 1.3 + (a.s > 0 ? 0 : 1.7)) * 0.045 * e);
    });
    spinners.forEach((s) => (s.rotation.z += dt * 2.4));
    key.intensity = 260 + Math.sin(t * 5) * 14;
    for (let i = 0; i < N; i++) {
      sp[i * 3 + 1] += sv[i] * dt;
      if (sp[i * 3 + 1] > 7.8) respawn(i, 0);
    }
    sg.attributes.position.needsUpdate = true;
    sparks.material.opacity = e;
  }

  function dispose() {
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
        (x as THREE.MeshBasicMaterial).map?.dispose();
        x.dispose();
      });
    });
  }

  return { root, update, dispose };
}

/** हीरो सेक्शन में चलने वाला इंटरैक्टिव 3D दुर्गा (माउस/टच से घूमती है) */
export function mountHero(canvas: HTMLCanvasElement): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const env = makeEnv(renderer);
  scene.environment = env;
  scene.environmentIntensity = 0.7;
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const d = buildDurga();
  scene.add(d.root);

  const fit = () => {
    const w = canvas.clientWidth || 400, h = canvas.clientHeight || 400;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.position.set(0, 3.2, 15.5);
    camera.lookAt(0, 3, 0);
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);

  let tx = 0, ty = 0, ry = 0, rx = 0, raf = 0, visible = true, last = performance.now(), t = 0, pulse = 0;
  const onMove = (e: PointerEvent) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onDown = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) pulse = 1;
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerdown", onDown);
  const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
  io.observe(canvas);

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;
    t += dt;
    pulse = Math.max(0, pulse - dt * 1.6);
    ry += (tx * 0.5 + Math.sin(t * 0.4) * 0.12 - ry) * 0.06;
    rx += (ty * 0.1 - rx) * 0.06;
    d.root.rotation.set(rx, ry, 0);
    d.root.scale.setScalar(1 + Math.sin(pulse * PI) * 0.05);
    d.update(t, dt, 1);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    ro.disconnect();
    io.disconnect();
    d.dispose();
    env.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
