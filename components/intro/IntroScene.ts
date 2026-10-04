"use client";

import * as THREE from "three";
import { buildDurga, makeEnv, glowTex } from "./durga3d";

/** अकेलवा पूर्व (बस्ती) */
const AKELWA = { lat: 26.79, lon: 82.79 };
const R = 10;
const TOTAL = 8.8;
const SWAP = 5.0; // यहाँ धरती से दुर्गा-दर्शन में बदलाव
const KEYS: Array<[number, number]> = [[0, 170], [1.5, 62], [3, 30], [4.2, 15.5], [5, 11.3]];
const SUN = new THREE.Vector3(0.85, 0.22, 0.55).normalize();

function toVec3(lat: number, lon: number, r: number) {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
function distanceAt(t: number) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [t0, d0] = KEYS[i], [t1, d1] = KEYS[i + 1];
    if (t <= t1) {
      const r = (t - t0) / (t1 - t0);
      const e = r < 0.5 ? 4 * r ** 3 : 1 - Math.pow(-2 * r + 2, 3) / 2;
      return d0 + (d1 - d0) * Math.max(0, Math.min(1, e));
    }
  }
  return KEYS[KEYS.length - 1][1];
}
function sprite(tex: THREE.Texture, size: number, pos: THREE.Vector3, opacity = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.setScalar(size);
  s.position.copy(pos);
  return s;
}

export function buildIntro(canvas: HTMLCanvasElement, speedEl: HTMLDivElement | null, onStage: (i: number) => void, onDone: () => void, useImage: () => boolean = () => false): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 6000);

  let raf = 0, disposed = false;
  const disposables: Array<{ dispose(): void }> = [renderer];
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);

  const loader = new THREE.TextureLoader();
  const load = (f: string) => loader.loadAsync(`/tex/${f}`);
  Promise.all([load("earth_atmos_2048.jpg"), load("earth_lights_2048.png")])
    .then(([dayTex, nightTex]) => {
      if (disposed) return;
      renderer.capabilities.getMaxAnisotropy();
      [dayTex, nightTex].forEach((t) => (t.anisotropy = 8));
      disposables.push(dayTex, nightTex);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const env = makeEnv(renderer);
      scene.environment = env;
      scene.environmentIntensity = 0.7;
      disposables.push(env);
      const durga = buildDurga();
      durga.root.visible = false;
      scene.add(durga.root);
      disposables.push({ dispose: durga.dispose });

      /* ---------- तारे (रंग-बिरंगे, अलग आकार) ---------- */
      const N = 6500, sp = new Float32Array(N * 3), sc = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 900 + Math.random() * 900, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
        sp.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * 0.7, r * Math.sin(b) * Math.sin(a)], i * 3);
        const k = Math.random(), c = k < 0.15 ? [1, 0.75, 0.55] : k < 0.3 ? [0.65, 0.78, 1] : [1, 0.97, 0.9];
        const br = 0.4 + Math.random() * 0.6;
        sc.set([c[0] * br, c[1] * br, c[2] * br], i * 3);
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
      sg.setAttribute("color", new THREE.BufferAttribute(sc, 3));
      const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.5, vertexColors: true, sizeAttenuation: false, transparent: true, depthWrite: false }));
      scene.add(stars);
      disposables.push(sg);

      /* ---------- नीहारिका (nebula) + सूरज ---------- */
      const neb1 = glowTex([[0, "rgba(120,60,200,.55)"], [0.5, "rgba(60,30,120,.2)"], [1, "rgba(0,0,0,0)"]]);
      const neb2 = glowTex([[0, "rgba(255,110,40,.45)"], [0.5, "rgba(190,40,60,.18)"], [1, "rgba(0,0,0,0)"]]);
      const neb3 = glowTex([[0, "rgba(40,120,255,.4)"], [0.5, "rgba(20,60,160,.15)"], [1, "rgba(0,0,0,0)"]]);
      const sunTex = glowTex([[0, "rgba(255,255,240,1)"], [0.12, "rgba(255,230,160,.85)"], [0.4, "rgba(255,150,60,.25)"], [1, "rgba(0,0,0,0)"]]);
      scene.add(sprite(neb1, 900, new THREE.Vector3(-420, 160, -900), 0.9), sprite(neb2, 800, new THREE.Vector3(500, -120, -950), 0.8), sprite(neb3, 700, new THREE.Vector3(-80, -300, -800), 0.7));
      const sunPos = SUN.clone().multiplyScalar(260);
      const sunS = sprite(sunTex, 120, sunPos);
      const flare = sprite(sunTex, 420, sunPos, 0.35);
      scene.add(sunS, flare);
      disposables.push(neb1, neb2, neb3, sunTex);

      /* ---------- धरती (दिन/रात shader + शहरों की बत्तियाँ) ---------- */
      const earthGroup = new THREE.Group();
      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(R, 128, 96),
        new THREE.ShaderMaterial({
          uniforms: { day: { value: dayTex }, night: { value: nightTex }, sun: { value: SUN } },
          vertexShader: `varying vec2 vUv; varying vec3 vN; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
          fragmentShader: `uniform sampler2D day; uniform sampler2D night; uniform vec3 sun; varying vec2 vUv; varying vec3 vN;
            void main(){ float d=dot(normalize(vN),sun); float k=smoothstep(-0.1,0.2,d);
              vec3 dc=texture2D(day,vUv).rgb; vec3 nc=texture2D(night,vUv).rgb*vec3(1.5,1.05,0.55);
              vec3 col=mix(nc+dc*0.05, dc*(0.3+0.95*max(d,0.0)), k);
              col+=vec3(1.0,0.4,0.12)*smoothstep(-0.02,0.12,d)*smoothstep(0.34,0.1,d)*0.28; gl_FragColor=vec4(col,1.0); }`,
        })
      );
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.14, 64, 64),
        new THREE.ShaderMaterial({
          transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
          vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
          fragmentShader: `varying vec3 vN; varying vec3 vP; void main(){ float r=pow(1.0-abs(dot(vN,normalize(-vP))),2.4); gl_FragColor=vec4(vec3(0.35,0.7,1.0),r*0.95); }`,
        })
      );
      earthGroup.add(earth, atmo);
      disposables.push(earth.geometry, atmo.geometry);

      /* ---------- अकेलवा पूर्व का निशान ---------- */
      const mk = toVec3(AKELWA.lat, AKELWA.lon, R * 1.012);
      const baseRot = Math.atan2(-mk.x, mk.z);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffa733 }));
      dot.position.copy(mk);
      earthGroup.add(dot);
      const rings = [0, 1].map(() => {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.2, 48), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
        m.position.copy(mk).multiplyScalar(1.004);
        earthGroup.add(m);
        return m;
      });
      earthGroup.rotation.y = baseRot;
      scene.add(earthGroup, new THREE.AmbientLight(0xffffff, 0.35));
      const sunLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
      sunLight.position.copy(SUN).multiplyScalar(50);
      scene.add(sunLight);

      /* ---------- रफ़्तार की लकीरें (शुरू में) ---------- */
      const ST = 500, stg = new THREE.BufferGeometry(), stp = new Float32Array(ST * 6);
      const resetStreak = (i: number, z: number) => {
        const x = (Math.random() - 0.5) * 140, y = (Math.random() - 0.5) * 140;
        stp.set([x, y, z, x, y, z - 8], i * 6);
      };
      for (let i = 0; i < ST; i++) resetStreak(i, -Math.random() * 400);
      stg.setAttribute("position", new THREE.BufferAttribute(stp, 3));
      const streaks = new THREE.LineSegments(stg, new THREE.LineBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending }));
      scene.add(streaks);
      disposables.push(stg);

      /* ---------- animation ---------- */
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      let lastStage = -1, finished = false, swapped = false, prev = start;
      const render = () => {
        raf = requestAnimationFrame(render);
        const t = reduced ? TOTAL + 1 : (performance.now() - start) / 1000;
        const stage = t < 1.5 ? 0 : t < 3 ? 1 : t < SWAP ? 2 : 3;
        if (stage !== lastStage) { lastStage = stage; onStage(stage); }

        const now = performance.now(), dt = Math.min(0.05, (now - prev) / 1000);
        prev = now;
        if (t >= SWAP) {
          if (!swapped) {
            swapped = true;
            earthGroup.visible = sunS.visible = flare.visible = streaks.visible = sunLight.visible = false;
            camera.fov = 45;
            camera.updateProjectionMatrix();
          }
          const p = Math.min(1, (t - SWAP) / 3.4), e = 1 - Math.pow(1 - p, 3);
          const z0 = Math.max(13, 9.7 / camera.aspect);
          camera.position.set(Math.sin(t * 0.35) * 1.4, 2.6, z0 * (1.18 - 0.18 * e));
          camera.lookAt(0, 1.4, 0);
          if (!useImage()) durga.update(t, dt, (t - SWAP - 0.15) / 2.6);
          stars.rotation.y += 0.0003;
          if (speedEl) speedEl.style.opacity = "0";
          renderer.render(scene, camera);
          if (!finished && t >= TOTAL) { finished = true; cancelAnimationFrame(raf); onDone(); }
          return;
        }
        const dist = distanceAt(t);
        const zoomSpeed = Math.max(0, 1 - (dist - 13) / 90);
        const near = Math.max(0, Math.min(1, (60 - dist) / 45));
        camera.fov = 55 + Math.sin(Math.min(1, t / 3) * Math.PI) * 10 * (1 - near);
        camera.updateProjectionMatrix();
        camera.position.set(Math.sin(t * 0.25) * 2.2 * (1 - near), near * mk.y * 0.9 + Math.sin(t * 0.35) * 0.6 * (1 - near), dist);
        camera.lookAt(0, near * mk.y, 0);

        earthGroup.rotation.y = baseRot + Math.max(0, 1.4 - t * 0.3) * (1 - near * 0.6);
        stars.rotation.y += 0.00015;
        sunS.material.opacity = 1 - near * 0.6;
        flare.material.opacity = 0.35 * (1 - near);

        const arr = stg.attributes.position.array as Float32Array;
        const v = 8 + zoomSpeed * 70;
        for (let i = 0; i < ST; i++) {
          arr[i * 6 + 2] += v;
          arr[i * 6 + 5] = arr[i * 6 + 2] - 4 - zoomSpeed * 30;
          if (arr[i * 6 + 2] > camera.position.z - 6) resetStreak(i, -300);
        }
        stg.attributes.position.needsUpdate = true;
        (streaks.material as THREE.LineBasicMaterial).opacity = Math.max(0, zoomSpeed * 0.6 - near * 0.4);

        dot.scale.setScalar(1 - near * 0.55);
        const pulse = (performance.now() % 1600) / 1600;
        rings.forEach((m, i) => {
          const p = (pulse + i * 0.5) % 1;
          m.scale.setScalar(1 + p * (2.5 + near * 1.5));
          (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * (0.25 + near * 0.35);
          m.lookAt(camera.position);
        });

        if (speedEl) {
          speedEl.style.opacity = String(Math.min(0.7, zoomSpeed * 0.8));
          speedEl.style.transform = `scale(${1 + zoomSpeed * 0.5})`;
        }
        renderer.render(scene, camera);
        if (!finished && t >= TOTAL) {
          finished = true;
          cancelAnimationFrame(raf);
          if (speedEl) speedEl.style.opacity = "0";
          onDone();
        }
      };
      render();
    })
    .catch(() => !disposed && onDone());

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    disposables.forEach((d) => d.dispose());
  };
}
