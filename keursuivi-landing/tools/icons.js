/*! KeurSuivi : icônes 3D (modèles procéduraux Three.js r128, rendus en images par bake.js). Outil de fabrication, non chargé par la page. */
(function (global) {
  'use strict';
  const THREE = global.THREE;
  const lin = (h) => new THREE.Color(h).convertSRGBToLinear();

  /* ---------- géométries ---------- */
  function rrShape(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  // boîte aux arêtes arrondies
  function rbox(w, h, d, r, bev) {
    bev = Math.min(bev || r * 0.45, d * 0.45, w * 0.2, h * 0.2);
    const g = new THREE.ExtrudeGeometry(rrShape(w - 2 * bev, h - 2 * bev, Math.max(0.001, r - bev)), { depth: Math.max(0.001, d - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 6, curveSegments: 12 });
    g.translate(0, 0, -(d - 2 * bev) / 2);
    return g;
  }
  const mat = (hex, o) => new THREE.MeshPhysicalMaterial(Object.assign({ color: lin(hex), roughness: 0.34, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1 }, o || {}));
  const add = (g, geo, m, x, y, z) => { const mesh = new THREE.Mesh(geo, m); mesh.position.set(x || 0, y || 0, z || 0); g.add(mesh); return mesh; };

  const C = { white: '#F7F2E9', sand: '#EBDDC4', navy: '#1E2A38', navy2: '#34465B', terra: '#C1622D', terraL: '#D97B45', metal: '#CBD3DA', gold: '#E2B057', glass: '#0F2A3D' };

  /* ---------- les six icônes ---------- */
  function hardhat() {
    const g = new THREE.Group(), white = mat(C.white, { clearcoat: 1, clearcoatRoughness: 0.1, roughness: 0.25 }), terra = mat(C.terra, { roughness: 0.3, clearcoat: 1 }), navy = mat(C.navy);
    const RX = 1.12, RY = 1.32, RZ = 1.22;
    const dome = add(g, new THREE.SphereGeometry(1, 80, 48, 0, Math.PI * 2, 0, Math.PI / 2), white, 0, 0, 0); dome.scale.set(RX, RY, RZ);
    // bandeau de base et visière (demi-disque tourné vers l'avant, +z)
    const base = add(g, new THREE.CylinderGeometry(1, 1, 0.2, 80), white, 0, -0.07, 0); base.scale.set(RX * 1.04, 1, RZ * 1.04);
    const visor = add(g, new THREE.CylinderGeometry(1, 1, 0.1, 80, 1, false, -Math.PI / 2, Math.PI), white, 0, -0.1, 0.1); visor.scale.set(RX * 1.1, 1, RZ * 1.5);
    // nervure centrale : arche qui suit exactement la courbure du dôme
    const pts = [];
    for (let i = 0; i <= 40; i++) { const t = -1.2 + (2.4 * i) / 40; pts.push(new THREE.Vector3(0, RY * Math.cos(t) * 1.015, RZ * Math.sin(t) * 1.015)); }
    const arch = add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.13, 14, false), terra, 0, 0, 0); arch.scale.x = 1.5;
    // deux nervures latérales plus basses
    [-1, 1].forEach((sx) => {
      const q = [];
      for (let i = 0; i <= 30; i++) { const t = -1.05 + (2.1 * i) / 30; const k = 0.62; q.push(new THREE.Vector3(sx * RX * Math.sin(0.5) * Math.sin(Math.abs(t) * 0 + 0) + sx * RX * 0.42 * Math.cos(t * 0.8), RY * Math.cos(t) * 0.86, RZ * Math.sin(t) * 0.96 * k + (RZ * Math.sin(t) * 0.38))); }
    });
    // écusson marine et liseré terracotta à l'avant
    const badge = add(g, new THREE.CylinderGeometry(0.27, 0.27, 0.08, 48), navy, 0, 0.62, RZ * 0.9); badge.rotation.x = Math.PI / 2 - 0.62;
    const badgeRing = add(g, new THREE.TorusGeometry(0.27, 0.035, 14, 48), terra, 0, 0.62, RZ * 0.9); badgeRing.rotation.x = -0.62; badgeRing.position.set(0, 0.665, RZ * 0.94);
    badge.position.set(0, 0.64, RZ * 0.9); badge.rotation.x = Math.PI / 2 - 0.62;
    g.rotation.x = 0.1; g.rotation.y = -0.45;
    return g;
  }
  function camera() {
    const g = new THREE.Group(), navy = mat(C.navy, { roughness: 0.3, clearcoat: 1 }), terra = mat(C.terra), metal = mat(C.metal, { metalness: 0.95, roughness: 0.22, clearcoat: 0.2 });
    add(g, rbox(2.3, 1.45, 1.0, 0.28), navy, 0, 0, 0);
    add(g, rbox(0.95, 0.3, 0.72, 0.12), mat(C.navy2), -0.45, 0.82, 0);
    add(g, rbox(2.34, 0.2, 1.04, 0.08), terra, 0, -0.48, 0);
    const barrel = add(g, new THREE.CylinderGeometry(0.62, 0.66, 0.36, 64), metal, 0.1, 0.02, 0.62); barrel.rotation.x = Math.PI / 2;
    const ring = add(g, new THREE.TorusGeometry(0.56, 0.055, 16, 64), terra, 0.1, 0.02, 0.82);
    const lens = add(g, new THREE.SphereGeometry(0.46, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.glass, { roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.8 }), 0.1, 0.02, 0.8); lens.rotation.x = Math.PI / 2; lens.scale.set(1, 0.7, 1);
    add(g, new THREE.SphereGeometry(0.09, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.06, 0.2, 1.17);
    add(g, rbox(0.42, 0.24, 0.12, 0.07), mat('#FFE9C2', { roughness: 0.2 }), 0.8, 0.44, 0.52);
    add(g, new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32), terra, 0.55, 0.85, 0);
    // repère GPS posé sur l'appareil
    const pin = new THREE.Group(), pm = mat(C.terra, { roughness: 0.28, clearcoat: 1 });
    add(pin, new THREE.SphereGeometry(0.3, 32, 20), pm, 0, 0.45, 0);
    const tip = add(pin, new THREE.ConeGeometry(0.3, 0.55, 32), pm, 0, 0.1, 0); tip.rotation.x = Math.PI;
    add(pin, new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, 0.45, 0.26);
    pin.position.set(0.95, 1.12, 0.1); pin.rotation.z = -0.12; g.add(pin);
    g.rotation.y = -0.38; g.position.y = -0.2;
    return g;
  }
  function clipboard() {
    const g = new THREE.Group(), navy = mat(C.navy, { clearcoat: 1 }), paper = mat(C.white, { roughness: 0.55, clearcoat: 0.2 }), terra = mat(C.terra), line = mat('#B9B3A7', { roughness: 0.7, clearcoat: 0 }), metal = mat(C.metal, { metalness: 0.95, roughness: 0.2 });
    add(g, rbox(1.8, 2.3, 0.18, 0.2), navy, 0, 0, 0);
    add(g, rbox(1.5, 1.95, 0.07, 0.1), paper, 0, -0.08, 0.12);
    add(g, rbox(0.78, 0.34, 0.2, 0.1), metal, 0, 1.12, 0.14);
    add(g, new THREE.TorusGeometry(0.12, 0.04, 12, 28), metal, 0, 1.26, 0.14);
    for (let i = 0; i < 4; i++) {
      const y = 0.6 - i * 0.43;
      add(g, rbox(0.2, 0.2, 0.05, 0.05), i < 2 ? terra : mat('#E4DDD0', { clearcoat: 0 }), -0.52, y, 0.185);
      add(g, rbox(0.82 - (i % 2) * 0.18, 0.1, 0.04, 0.04), line, 0.18, y, 0.18);
    }
    [0.6, 0.17].forEach((y) => { add(g, rbox(0.05, 0.13, 0.05, 0.02), mat('#fff'), -0.545, y - 0.03, 0.215).rotation.z = -0.8; add(g, rbox(0.05, 0.22, 0.05, 0.02), mat('#fff'), -0.49, y, 0.215).rotation.z = 0.7; });
    g.rotation.set(0.05, -0.42, 0.08); g.position.y = -0.1;
    return g;
  }
  function receipt() {
    const g = new THREE.Group(), paper = mat(C.white, { roughness: 0.5, clearcoat: 0.25 }), terra = mat(C.terra), line = mat('#B9B3A7', { roughness: 0.7, clearcoat: 0 });
    const s = new THREE.Shape(), w = 0.82, top = 1.2, bot = -0.95, n = 7;
    s.moveTo(-w, top); s.lineTo(w, top); s.lineTo(w, bot);
    for (let i = 0; i < n; i++) { const x1 = w - ((i + 0.5) * 2 * w) / n, x2 = w - ((i + 1) * 2 * w) / n; s.lineTo(x1, bot - 0.2); s.lineTo(x2, bot); }
    s.lineTo(-w, top);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 4 });
    geo.translate(0, 0, -0.05); add(g, geo, paper, 0, 0, 0);
    add(g, rbox(0.9, 0.12, 0.04, 0.05), mat(C.navy), 0, 0.88, 0.1);
    for (let i = 0; i < 4; i++) { add(g, rbox(0.95, 0.07, 0.03, 0.03), line, -0.06, 0.5 - i * 0.28, 0.1); add(g, rbox(0.3, 0.07, 0.03, 0.03), line, 0.46, 0.5 - i * 0.28, 0.1); }
    add(g, rbox(1.2, 0.2, 0.04, 0.06), terra, 0, -0.62, 0.1);
    // pièces
    const gold = mat(C.gold, { metalness: 0.75, roughness: 0.28, clearcoat: 0.6 }), rim = mat('#C99A44', { metalness: 0.8, roughness: 0.3 });
    for (let i = 0; i < 3; i++) { add(g, new THREE.CylinderGeometry(0.44, 0.44, 0.13, 56), gold, 1.05, -0.78 + i * 0.15, 0.55); add(g, new THREE.TorusGeometry(0.4, 0.025, 10, 56), rim, 1.05, -0.78 + i * 0.15 + 0.065, 0.55).rotation.x = Math.PI / 2; }
    add(g, new THREE.CylinderGeometry(0.34, 0.34, 0.02, 48), rim, 1.05, -0.78 + 2 * 0.15 + 0.075, 0.55);
    g.rotation.set(0.05, -0.4, -0.06); g.position.set(-0.25, 0.05, 0);
    return g;
  }
  function bell() {
    const g = new THREE.Group(), terra = mat(C.terra, { roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.1 }), navy = mat(C.navy, { clearcoat: 1 });
    const prof = [[0.0, 1.05], [0.16, 1.04], [0.3, 0.96], [0.52, 0.7], [0.66, 0.2], [0.8, -0.35], [0.98, -0.78], [1.1, -0.9], [1.14, -0.98], [1.08, -1.04], [0.0, -1.04]].map((p) => new THREE.Vector2(p[0], p[1]));
    add(g, new THREE.LatheGeometry(prof, 72), terra, 0, 0, 0);
    add(g, new THREE.SphereGeometry(0.2, 32, 24), navy, 0, 1.12, 0);
    add(g, new THREE.TorusGeometry(1.1, 0.07, 16, 72), mat(C.terraL, { roughness: 0.3 }), 0, -0.99, 0).rotation.x = Math.PI / 2;
    add(g, new THREE.SphereGeometry(0.27, 32, 24), navy, 0, -1.28, 0);
    const wave = (side, r, a) => { const t = add(g, new THREE.TorusGeometry(r, 0.055, 12, 48, a), terra, 0, 0.25, 0); t.rotation.z = side > 0 ? -a / 2 : Math.PI - a / 2; t.rotation.y = 0; return t; };
    wave(1, 1.55, 0.9); wave(1, 1.85, 0.9); wave(-1, 1.55, 0.9); wave(-1, 1.85, 0.9);
    g.rotation.z = 0.12; g.position.y = 0.1; g.scale.setScalar(0.92);
    return g;
  }
  function chat() {
    const g = new THREE.Group(), terra = mat(C.terra, { roughness: 0.28, clearcoat: 1 }), sand = mat(C.white, { roughness: 0.4 }), navy = mat(C.navy);
    // bulle arrière
    const b2 = new THREE.Group();
    add(b2, rbox(1.6, 1.05, 0.5, 0.4), sand, 0, 0, 0);
    const t2 = new THREE.Shape(); t2.moveTo(0, 0); t2.lineTo(0.5, 0); t2.lineTo(0.5, -0.55); t2.lineTo(0, 0);
    const tg2 = new THREE.ExtrudeGeometry(t2, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }); tg2.translate(0, 0, -0.15);
    add(b2, tg2, sand, 0.45, -0.45, 0);
    for (let i = 0; i < 3; i++) add(b2, new THREE.SphereGeometry(0.1, 20, 14), navy, -0.35 + i * 0.35, 0, 0.27);
    b2.position.set(0.75, -0.75, -0.55); b2.rotation.y = -0.1; g.add(b2);
    // bulle avant
    const b1 = new THREE.Group();
    add(b1, rbox(2.2, 1.45, 0.62, 0.5), terra, 0, 0, 0);
    const t1 = new THREE.Shape(); t1.moveTo(0, 0); t1.lineTo(0.62, 0); t1.lineTo(0, -0.72); t1.lineTo(0, 0);
    const tg1 = new THREE.ExtrudeGeometry(t1, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3 }); tg1.translate(0, 0, -0.21);
    add(b1, tg1, terra, -0.85, -0.62, 0);
    for (let i = 0; i < 3; i++) add(b1, new THREE.SphereGeometry(0.15, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, clearcoat: 1 }), -0.5 + i * 0.5, 0.0, 0.38);
    b1.position.set(-0.2, 0.35, 0.1); g.add(b1);
    g.rotation.y = -0.32; g.position.y = 0.0;
    return g;
  }
  const BUILDERS = { hardhat: hardhat, camera: camera, report: clipboard, receipt: receipt, bell: bell, chat: chat };

  /* ---------- rendu ---------- */
  function shadowTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(14,22,32,0.55)'); g.addColorStop(0.55, 'rgba(14,22,32,0.2)'); g.addColorStop(1, 'rgba(14,22,32,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  function create(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(20, 1, 1, 100);
    // environnement de studio
    const env = new THREE.Scene();
    const dg = new THREE.SphereGeometry(40, 48, 24), dp = dg.attributes.position, cols = [], tmp = new THREE.Color();
    const top = lin('#9bbfe0').multiplyScalar(0.7), mid = lin('#f5eadb').multiplyScalar(0.9), bot = lin('#d3c2a6').multiplyScalar(0.5);
    for (let i = 0; i < dp.count; i++) { const h = dp.getY(i) / 40; if (h > 0) tmp.copy(mid).lerp(top, Math.pow(h, 0.6)); else tmp.copy(mid).lerp(bot, Math.pow(-h, 0.5)); cols.push(tmp.r, tmp.g, tmp.b); }
    dg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    env.add(new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const box = (w, h, p, k, col) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: lin(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(p[0], p[1], p[2]); m.lookAt(0, 0, 0); env.add(m); };
    box(16, 10, [-14, 14, 14], 7, '#fff1dc'); box(12, 8, [18, 8, -6], 3.2, '#cfe4ff'); box(30, 6, [0, 24, 0], 2.2, '#ffffff'); box(8, 5, [10, 4, 20], 2.4, '#ffe9cc');
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.03).texture; pm.dispose();
    const key = new THREE.DirectionalLight(lin('#fff3e4'), 1.6); key.position.set(-6, 9, 8); scene.add(key);
    scene.add(new THREE.HemisphereLight(lin('#dce9f5'), lin('#ead8bc'), 0.35));
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, toneMapped: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = -1.55; scene.add(sh);
    cam.position.set(1.6, 2.4, 12.6); cam.lookAt(0, -0.35, 0);
    let current = null;
    return {
      render(name, size) {
        if (current) scene.remove(current);
        current = BUILDERS[name]();
        // cadrage homogène : même emprise pour toutes les icônes, centrées
        const holder = new THREE.Group(); holder.add(current); scene.add(holder); current = holder;
        let box = new THREE.Box3().setFromObject(holder), sz = box.getSize(new THREE.Vector3());
        holder.scale.setScalar(3.65 / Math.max(sz.x, sz.y * 1.0));
        box = new THREE.Box3().setFromObject(holder);
        const ctr = box.getCenter(new THREE.Vector3());
        holder.position.set(-ctr.x, -ctr.y + 0.15, -ctr.z);
        box = new THREE.Box3().setFromObject(holder);
        sh.position.y = box.min.y - 0.22;
        sh.scale.setScalar(Math.min(0.78, Math.max(0.55, (box.max.x - box.min.x) / 5.2)));
        renderer.setPixelRatio(1); renderer.setSize(size, size, false);
        renderer.render(scene, cam);
        return canvas;
      },
      names: Object.keys(BUILDERS),
    };
  }
  global.KSIcons = { create: create };
})(window);
