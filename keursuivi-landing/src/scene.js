/*! KeurSuivi : scène 3D « villa en chantier » (Three.js r128, 100 % procédural, aucun fichier externe) */
(function (global) {
  'use strict';
  const THREE = global.THREE;
  if (!THREE) return;

  /* ------------------------------------------------------------------ */
  /* Utilitaires                                                         */
  /* ------------------------------------------------------------------ */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const easeOutBack = (t) => { t = clamp(t); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const lin = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; };
  const uniq = (arr) => Array.from(new Set(arr)).sort((a, b) => a - b);

  /* ------------------------------------------------------------------ */
  /* Textures procédurales (motifs en niveaux de gris, moyenne ≈ 0,5)   */
  /* ------------------------------------------------------------------ */
  function valueNoise(size, octaves, seed, base) {
    base = base || 4;
    const rnd = rng(seed);
    const out = new Float32Array(size * size);
    let amp = 1, total = 0;
    for (let o = 0; o < octaves; o++) {
      const n = base << o;
      const g = new Float32Array(n * n);
      for (let i = 0; i < g.length; i++) g[i] = rnd();
      for (let y = 0; y < size; y++) {
        const fy = (y / size) * n, y0 = Math.floor(fy), ty = smooth(fy - y0);
        const ya = (y0 % n) * n, yb = ((y0 + 1) % n) * n;
        for (let x = 0; x < size; x++) {
          const fx = (x / size) * n, x0 = Math.floor(fx), tx = smooth(fx - x0);
          const xa = x0 % n, xb = (x0 + 1) % n;
          const top = lerp(g[ya + xa], g[ya + xb], tx), bot = lerp(g[yb + xa], g[yb + xb], tx);
          out[y * size + x] += amp * lerp(top, bot, ty);
        }
      }
      total += amp; amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= total;
    return out;
  }
  function grayCanvas(field, size, mean, contrast) {
    const c = mkCanvas(size), ctx = c.getContext('2d'), img = ctx.createImageData(size, size);
    for (let i = 0; i < field.length; i++) {
      const v = clamp(mean + (field[i] - 0.5) * contrast) * 255;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }
  function grain(ctx, size, amount, seed) {
    const r = rng(seed), img = ctx.getImageData(0, 0, size, size), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * amount; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    ctx.putImageData(img, 0, 0);
  }
  // blocs de béton (parpaings 40 x 20 cm) sur un carreau de 2 m
  function blockCanvas() {
    const s = 512, c = mkCanvas(s), x = c.getContext('2d'), r = rng(7);
    x.fillStyle = '#4c4c4c'; x.fillRect(0, 0, s, s);
    const rows = 10, bh = s / rows, bw = s / 5;
    for (let j = 0; j < rows; j++) {
      const off = (j % 2) * (bw / 2);
      for (let i = -1; i < 6; i++) {
        const v = 116 + Math.floor(r() * 26);
        x.fillStyle = 'rgb(' + v + ',' + v + ',' + (v - 3) + ')';
        x.fillRect(i * bw + off + 2, j * bh + 2, bw - 4, bh - 4);
      }
    }
    grain(x, s, 22, 11);
    return c;
  }
  const memo = (() => { const c = {}; return (k, f) => (c[k] || (c[k] = f())); })();
  function plasterCanvas() { return grayCanvas(valueNoise(256, 5, 21, 4), 256, 0.5, 0.42); }
  function concreteCanvas() {
    const f = valueNoise(256, 5, 33, 6), c = grayCanvas(f, 256, 0.5, 0.7), x = c.getContext('2d');
    grain(x, 256, 18, 5);
    return c;
  }
  // lames de bois verticales (8 lames sur 0,64 m)
  function slatCanvas() {
    const s = 512, c = mkCanvas(s), x = c.getContext('2d'), r = rng(3), n = 8, w = s / n;
    x.fillStyle = '#262626'; x.fillRect(0, 0, s, s);
    for (let i = 0; i < n; i++) {
      const v = 118 + Math.floor(r() * 20);
      x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; x.fillRect(i * w + 5, 0, w - 10, s);
      for (let k = 0; k < 26; k++) {
        const gx = i * w + 7 + r() * (w - 14);
        x.fillStyle = 'rgba(' + (r() < 0.5 ? '0,0,0' : '255,255,255') + ',' + (0.04 + r() * 0.07) + ')';
        x.fillRect(gx, 0, 1 + r() * 2, s);
      }
    }
    return c;
  }
  function woodCanvas() {
    const s = 256, c = mkCanvas(s), x = c.getContext('2d'), r = rng(9);
    x.fillStyle = '#808080'; x.fillRect(0, 0, s, s);
    for (let k = 0; k < 90; k++) {
      x.fillStyle = 'rgba(' + (r() < 0.5 ? '0,0,0' : '255,255,255') + ',' + (0.04 + r() * 0.08) + ')';
      x.fillRect(0, r() * s, s, 1 + r() * 3);
    }
    return c;
  }
  // pavés / dalles 60 x 60 cm sur un carreau de 1,2 m
  function paverCanvas() {
    const s = 512, c = mkCanvas(s), x = c.getContext('2d'), r = rng(13), n = 2, w = s / n;
    x.fillStyle = '#555'; x.fillRect(0, 0, s, s);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const v = 122 + Math.floor(r() * 14);
      x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; x.fillRect(i * w + 3, j * w + 3, w - 6, w - 6);
    }
    grain(x, s, 16, 17);
    return c;
  }

  /* Sol : état « terrain nu » et état « aménagé » (plan 22 x 22 m) */
  function groundCanvases(size) {
    const S = size, W = 22;
    const X = (x) => ((x + 11) / W) * S, Z = (z) => ((z + 11) / W) * S, P = (m) => (m / W) * S;
    function base(seed, tint) {
      const n = 512, c = mkCanvas(n), cx = c.getContext('2d'), img = cx.createImageData(n, n);
      const f1 = valueNoise(n, 5, seed, 4), f2 = valueNoise(n, 3, seed + 5, 32), r = rng(seed);
      for (let i = 0; i < f1.length; i++) {
        const k = 0.80 + f1[i] * 0.34 + (f2[i] - 0.5) * 0.12 + (r() - 0.5) * 0.05;
        img.data[i * 4] = clamp(tint[0] * k, 0, 255); img.data[i * 4 + 1] = clamp(tint[1] * k, 0, 255); img.data[i * 4 + 2] = clamp(tint[2] * k, 0, 255); img.data[i * 4 + 3] = 255;
      }
      cx.putImageData(img, 0, 0);
      const big = mkCanvas(S), g = big.getContext('2d');
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(c, 0, 0, S, S);
      return { canvas: big, g };
    }
    function soft(g, x, z, w, d, blur, alpha, col) {
      g.save(); g.shadowColor = 'rgba(' + (col || '58,34,18') + ',' + alpha + ')'; g.shadowBlur = blur; g.shadowOffsetX = S * 4;
      g.fillStyle = '#000'; g.fillRect(X(x) - S * 4, Z(z), P(w), P(d)); g.restore();
    }
    function softCircle(g, x, z, r, alpha) {
      const gr = g.createRadialGradient(X(x), Z(z), 0, X(x), Z(z), P(r));
      gr.addColorStop(0, 'rgba(50,30,15,' + alpha + ')'); gr.addColorStop(1, 'rgba(50,30,15,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(X(x), Z(z), P(r), 0, 7); g.fill();
    }
    // terrain nu
    const raw = base(101, [226, 204, 166]);
    {
      const g = raw.g;
      soft(g, -8.2, -7.8, 15.6, 9.6, S * 0.03, 0.22);                          // sol compacté sous le futur bâtiment
      g.strokeStyle = 'rgba(120,84,50,0.20)'; g.lineWidth = P(0.34);
      [-0.1, 0.55].forEach((o) => { g.beginPath(); g.moveTo(X(1.6 + o), Z(10.8)); g.bezierCurveTo(X(1.6 + o), Z(6.5), X(-1.0 + o), Z(4.6), X(-1.8 + o), Z(1.0)); g.stroke(); });
      const r = rng(5);
      for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '255,244,222' : '120,86,56') + ',' + (0.06 + r() * 0.08) + ')'; g.beginPath(); g.arc(r() * S, r() * S, P(0.05 + r() * 0.16), 0, 7); g.fill(); }
    }
    // terrain aménagé
    const fin = base(202, [226, 205, 168]);
    {
      const g = fin.g, r = rng(8);
      // allée carrossable
      g.fillStyle = '#d3b690'; g.fillRect(X(0.0), Z(2.6), P(3.1), P(8.3));
      g.strokeStyle = 'rgba(88,60,36,0.42)'; g.lineWidth = Math.max(1.5, P(0.025));
      for (let x = 0.0; x <= 3.11; x += 0.5) { g.beginPath(); g.moveTo(X(x), Z(2.6)); g.lineTo(X(x), Z(10.9)); g.stroke(); }
      for (let z = 2.6; z <= 10.9; z += 0.5) { g.beginPath(); g.moveTo(X(0.0), Z(z)); g.lineTo(X(3.1), Z(z)); g.stroke(); }
      for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(255,240,215,' + (0.05 + r() * 0.07) + ')'; g.fillRect(X(0.0) + r() * P(3.1), Z(2.6) + r() * P(8.3), P(0.45), P(0.45)); }
      // massifs le long des murs
      [[-10.05, -10.05, 1.15, 20.1], [8.9, -10.05, 1.15, 20.1], [-10.05, -10.05, 20.1, 1.0]].forEach((b) => {
        g.fillStyle = 'rgba(82,58,38,0.78)'; g.fillRect(X(b[0]), Z(b[1]), P(b[2]), P(b[3]));
        for (let i = 0; i < 220; i++) {
          g.fillStyle = r() < 0.7 ? 'rgba(96,128,64,' + (0.35 + r() * 0.4) + ')' : 'rgba(' + (r() < 0.5 ? '150,70,60' : '200,150,60') + ',0.55)';
          g.beginPath(); g.arc(X(b[0]) + r() * P(b[2]), Z(b[1]) + r() * P(b[3]), P(0.05 + r() * 0.13), 0, 7); g.fill();
        }
      });
      // ombres portées au sol (occlusion ambiante)
      soft(g, -7.45, -7.05, 14.0, 9.0, S * 0.028, 0.55);
      soft(g, -3.3, -0.4, 9.7, 2.3, S * 0.02, 0.28);
      soft(g, -10.3, -10.3, 0.5, 20.6, S * 0.012, 0.35); soft(g, 10.0, -10.3, 0.5, 20.6, S * 0.012, 0.35); soft(g, -10.3, -10.3, 20.6, 0.5, S * 0.012, 0.35); soft(g, -10.3, 9.9, 20.6, 0.5, S * 0.012, 0.35);
      softCircle(g, 8.3, -3.6, 3.4, 0.55); softCircle(g, -5.6, 8.6, 1.9, 0.4); softCircle(g, 8.8, 6.4, 1.9, 0.4); softCircle(g, -9.1, 0.4, 1.7, 0.4);
    }
    return { raw: raw.canvas, fin: fin.canvas };
  }
  function blobCanvas() {
    const s = 512, c = mkCanvas(s), x = c.getContext('2d');
    x.shadowColor = 'rgba(18,28,40,0.9)'; x.shadowBlur = 70; x.shadowOffsetX = 4000;
    x.fillStyle = '#000'; x.fillRect(120 - 4000, 130, 272, 272);
    return c;
  }

  /* ------------------------------------------------------------------ */
  /* Plantes et personnage                                               */
  /* ------------------------------------------------------------------ */
  function makeFrondGeometry(L, seg) {
    const pos = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const s = i / seg, x = s * L, y = 0.95 * Math.sin(s * 2.1) - 1.55 * s * s;
      const w = 0.62 * Math.pow(Math.sin(Math.PI * Math.min(0.98, s * 0.97 + 0.03)), 0.65) * (1 - 0.25 * s) + 0.03;
      pos.push(x, y - 0.1 * w, -w / 2, x, y, 0, x, y - 0.1 * w, w / 2);
    }
    for (let i = 0; i < seg; i++) {
      const a = i * 3, b = (i + 1) * 3;
      idx.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, a + 2, a + 2, b + 1, b + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  function blobGeometry(radius, detail, seed, wobble) {
    const g = new THREE.IcosahedronGeometry(radius, detail), p = g.attributes.position, r = rng(seed), ph = [r() * 6, r() * 6, r() * 6];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + wobble * (Math.sin(x * 2.3 + ph[0]) + Math.sin(y * 2.9 + ph[1]) + Math.sin(z * 2.6 + ph[2])) / 3;
      p.setXYZ(i, x * k, y * k, z * k);
    }
    g.computeVertexNormals();
    return g;
  }

  /* ------------------------------------------------------------------ */
  /* Création de la scène                                                */
  /* ------------------------------------------------------------------ */
  function create(canvas, options) {
    options = options || {};
    const lowPower = !!options.lowPower;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!options.preserve });
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(22, 1, 1, 400);
    const root = new THREE.Group();
    scene.add(root);

    /* ---------- environnement (réflexions de studio) ---------- */
    (function () {
      const s = new THREE.Scene();
      // dôme dégradé (ciel, horizon, sol) en couleurs de sommets : plus fiable qu'un shader dans la génération PMREM
      const dg = new THREE.SphereGeometry(45, 64, 32), dp = dg.attributes.position, dc = [];
      const cTop = lin('#7fb0e0').multiplyScalar(0.55), cMid = lin('#f7ebd9').multiplyScalar(0.85), cBot = lin('#cdb99a').multiplyScalar(0.4), cc = new THREE.Color();
      for (let i = 0; i < dp.count; i++) {
        const h = dp.getY(i) / 45;
        if (h > 0) cc.copy(cMid).lerp(cTop, Math.pow(h, 0.55)); else cc.copy(cMid).lerp(cBot, Math.pow(-h, 0.45));
        dc.push(cc.r, cc.g, cc.b);
      }
      dg.setAttribute('color', new THREE.Float32BufferAttribute(dc, 3));
      const dome = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false }));
      s.add(dome);
      const soft = (w, h, pos, k, col) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: lin(col).multiplyScalar(k), side: THREE.DoubleSide }));
        m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); s.add(m);
      };
      soft(20, 11, [-19, 15, 12], 6, '#fff0da');
      soft(14, 9, [22, 9, -8], 3, '#cfe4ff');
      soft(36, 7, [0, 28, 2], 1.6, '#ffffff');
      soft(10, 5, [14, 6, 24], 2, '#ffe6c6');
      const pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromScene(s, 0.03).texture;
      pm.dispose();
    })();

    /* ---------- lumières ---------- */
    const base = { sun: 2.5, sunLate: 2.35, hemi: 0.24, rim: 0.4, exposure: 0.92, exposureLate: 0.98, env: 0.85 };
    const sun = new THREE.DirectionalLight(lin('#fff3e4'), base.sun);
    sun.castShadow = true;
    sun.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
    { const c = sun.shadow.camera; c.left = -19; c.right = 19; c.top = 19; c.bottom = -19; c.near = 5; c.far = 140; }
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.05;
    scene.add(sun, sun.target);
    const hemi = new THREE.HemisphereLight(lin('#cfe1f2'), lin('#ead8bc'), base.hemi);
    scene.add(hemi);
    const rim = new THREE.DirectionalLight(lin('#a9ccff'), base.rim);
    rim.position.set(30, 14, -36); scene.add(rim);

    /* ---------- textures et matériaux ---------- */
    const T = (cv) => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; return t; };
    const white = (() => { const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat); t.needsUpdate = true; return t; })();
    const tBlock = T(memo('block', blockCanvas)), tPlaster = T(memo('plaster', plasterCanvas)), tConc = T(memo('conc', concreteCanvas)), tSlat = T(memo('slat', slatCanvas)), tWood = T(memo('wood', woodCanvas)), tPaver = T(memo('paver', paverCanvas));
    const paint = { value: -2 };   // hauteur (m) jusqu'où l'enduit est appliqué

    function patch(mat, c) {
      mat.defines = Object.assign({}, mat.defines, c.paint ? { PAINT: 1 } : {});
      mat.onBeforeCompile = (sh) => {
        sh.uniforms.uTexA = { value: c.A || white };
        sh.uniforms.uScaleA = { value: c.scaleA || 1 };
        sh.uniforms.uAmtA = { value: c.amtA === undefined ? 0.6 : c.amtA };
        sh.uniforms.uTexB = { value: c.B || white };
        sh.uniforms.uScaleB = { value: c.scaleB || 0.5 };
        sh.uniforms.uRaw = { value: c.raw || new THREE.Color(1, 1, 1) };
        sh.uniforms.uPaint = paint;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\n' +
            'mat4 kM = modelMatrix;\n#ifdef USE_INSTANCING\nkM = modelMatrix * instanceMatrix;\n#endif\n' +
            'vWPos = (kM * vec4(transformed, 1.0)).xyz;\nvWNrm = normalize((kM * vec4(objectNormal, 0.0)).xyz);');
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;\n' +
            'uniform sampler2D uTexA;\nuniform sampler2D uTexB;\nuniform float uScaleA;\nuniform float uScaleB;\nuniform float uAmtA;\nuniform float uPaint;\nuniform vec3 uRaw;\n' +
            'vec3 kTri(sampler2D t, vec3 p, vec3 n, float s) {\n' +
            '  vec3 w = pow(abs(n), vec3(6.0)); w /= (w.x + w.y + w.z + 1e-5);\n' +
            '  return texture2D(t, p.zy * s).rgb * w.x + texture2D(t, p.xz * s).rgb * w.y + texture2D(t, p.xy * s).rgb * w.z;\n}')
          .replace('#include <color_fragment>', '#include <color_fragment>\n{\n' +
            '  vec3 kn = normalize(vWNrm);\n' +
            '  vec3 col = diffuseColor.rgb * mix(vec3(1.0), kTri(uTexA, vWPos, kn, uScaleA) * 2.0, uAmtA);\n' +
            '  #ifdef PAINT\n' +
            '    vec3 raw = uRaw * kTri(uTexB, vWPos, kn, uScaleB) * 2.0;\n' +
            '    float kk = smoothstep(uPaint - 0.3, uPaint + 0.3, vWPos.y);\n' +
            '    col = mix(col, raw, kk);\n' +
            '  #endif\n' +
            '  diffuseColor.rgb = col;\n}');
      };
      mat.customProgramCacheKey = () => 'ks-' + (c.paint ? 'P' : 'N');
      return mat;
    }
    const std = (hex, o) => new THREE.MeshStandardMaterial(Object.assign({ color: lin(hex), roughness: 0.9, metalness: 0, envMapIntensity: 0.55 }, o || {}));
    function paintable(hex, rawHex, rawTex, rawScale) {
      return patch(std(hex, { roughness: 0.92 }), { paint: true, A: tPlaster, scaleA: 0.7, amtA: 0.55, B: rawTex, scaleB: rawScale, raw: lin(rawHex) });
    }
    const M = {
      wallW: paintable('#f3ebde', '#8f8d86', tBlock, 0.5),
      wallT: paintable('#a9552a', '#8f8d86', tBlock, 0.5),
      wallN: paintable('#2c3b4e', '#8f8d86', tBlock, 0.5),
      col: paintable('#efe6d8', '#bab6ae', tConc, 0.6),
      slab: paintable('#f0e8db', '#aca89f', tConc, 0.6),
      concrete: patch(std('#b9b5ac', { roughness: 0.95 }), { A: tConc, scaleA: 0.6, amtA: 0.7 }),
      blockProp: patch(std('#8f8d86', { roughness: 0.95 }), { A: tBlock, scaleA: 0.5, amtA: 0.95 }),
      slat: patch(std('#b27d4c', { roughness: 0.62 }), { A: tSlat, scaleA: 1 / 0.64, amtA: 1 }),
      wood: patch(std('#9b6a40', { roughness: 0.6 }), { A: tWood, scaleA: 1.4, amtA: 0.7 }),
      deck: patch(std('#d9cebf', { roughness: 0.85 }), { A: tPaver, scaleA: 1 / 1.2, amtA: 0.95 }),
      poolTile: patch(std('#dfe9e8', { roughness: 0.5 }), { A: tPaver, scaleA: 1 / 0.6, amtA: 0.9 }),
      frame: std('#222c36', { roughness: 0.45, metalness: 0.7, envMapIntensity: 1.2 }),
      metal: std('#2a3440', { roughness: 0.5, metalness: 0.6, envMapIntensity: 1.1 }),
      scaffold: std('#aab2b9', { roughness: 0.45, metalness: 0.85, envMapIntensity: 1.1 }),
      board: patch(std('#c8a878', { roughness: 0.8 }), { A: tWood, scaleA: 1.4, amtA: 0.7 }),
      glass: new THREE.MeshPhysicalMaterial({ color: lin('#0f2a3d'), roughness: 0.05, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.92, envMapIntensity: 1.5, emissive: lin('#ff9a45'), emissiveIntensity: 0, depthWrite: false }),
      railGlass: new THREE.MeshPhysicalMaterial({ color: lin('#9fc3d6'), roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.32, envMapIntensity: 1.6, depthWrite: false }),
      solar: std('#1d3350', { roughness: 0.25, metalness: 0.5, envMapIntensity: 1.6 }),
      lounger: std('#f4efe6', { roughness: 0.8 }),
      stake: std('#c9a46c', { roughness: 0.85 }),
      tape: std('#c1622d', { roughness: 0.6 }),
      strata1: std('#7b4b34', { roughness: 1 }),
      strata2: std('#a84f27', { roughness: 1 }),
      strata3: std('#dcc095', { roughness: 1 }),
      trunk: std('#8a7767', { roughness: 0.95 }),
      palmTrunk: std('#86654a', { roughness: 0.95 }),
      leaf: std('#4d7d3c', { roughness: 0.65, side: THREE.DoubleSide, envMapIntensity: 0.5 }),
      leafDark: std('#3d6a35', { roughness: 0.7, envMapIntensity: 0.5 }),
      leafLight: std('#7ea04f', { roughness: 0.7, envMapIntensity: 0.5 }),
      bloom: std('#c85a7c', { roughness: 0.6, envMapIntensity: 0.5 }),
      sandPile: std('#d9bd8c', { roughness: 1 }),
      water: new THREE.MeshPhysicalMaterial({ color: lin('#1b97ad'), roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.86, envMapIntensity: 2.0, depthWrite: false }),
      poolFloor: std('#5fbcc8', { roughness: 0.6 }),
      hivis: std('#f28a2c', { roughness: 0.6 }),
      helmet: std('#f6f3ee', { roughness: 0.35 }),
      skin: std('#7d5238', { roughness: 0.7 }),
      navy: std('#1e2a38', { roughness: 0.6 }),
      terra: std('#c1622d', { roughness: 0.45, envMapIntensity: 1 }),
      pin: new THREE.MeshStandardMaterial({ color: lin('#c1622d'), roughness: 0.32, metalness: 0.05, emissive: lin('#c1622d'), emissiveIntensity: 0.1, envMapIntensity: 1.1 }),
      pinDot: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    };

    /* ---------- socle : strates du sol ---------- */
    const slabBox = (mat, y0, y1) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(22, y1 - y0, 22), mat);
      m.position.y = (y0 + y1) / 2; m.receiveShadow = true; m.castShadow = true; root.add(m); return m;
    };
    slabBox(M.strata1, -1.1, -0.75); slabBox(M.strata2, -0.75, -0.3); slabBox(M.strata3, -0.3, -0.01);

    const gSize = lowPower ? 1024 : 2048, gc = memo('ground' + gSize, () => groundCanvases(gSize));
    const gTex = (cv) => { const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso; return t; };
    const groundRaw = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshStandardMaterial({ map: gTex(gc.raw), roughness: 1, envMapIntensity: 0.35 }));
    groundRaw.rotation.x = -Math.PI / 2; groundRaw.receiveShadow = true; root.add(groundRaw);
    const finMat = new THREE.MeshStandardMaterial({ map: gTex(gc.fin), roughness: 1, envMapIntensity: 0.35, transparent: true, opacity: 0, depthWrite: false });
    const groundFin = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), finMat);
    groundFin.rotation.x = -Math.PI / 2; groundFin.position.y = 0.004; groundFin.receiveShadow = true; groundFin.renderOrder = 1; root.add(groundFin);

    const blobTex = new THREE.CanvasTexture(memo('blob', blobCanvas));
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.5 }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = -1.16; root.add(blob);

    /* ------------------------------------------------------------------ */
    /* Éléments de construction (boîtes animées, rendues en instances)     */
    /* ------------------------------------------------------------------ */
    const els = [];
    function box(mat, x0, y0, z0, x1, y1, z1, t0, t1, o) {
      o = o || {};
      els.push({ mat: mat, x0: x0, y0: y0, z0: z0, x1: x1, y1: y1, z1: z1, t0: t0, t1: t1, anim: o.anim || 'rise', base: o.base !== undefined ? o.base : y0, rev: !!o.rev, rx: o.rx || 0, ry: o.ry || 0, rz: o.rz || 0 });
    }
    // mur plein avec ouvertures ; axis 'x' : mur parallèle à X, centré en z = c
    function wall(axis, c, a0, a1, y0, y1, th, holes, matFn, t0, t1) {
      const A = [a0, a1], Y = [y0, y1];
      holes.forEach((h) => { A.push(h.a0, h.a1); Y.push(h.y0, h.y1); });
      const xs = uniq(A), ys = uniq(Y);
      for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
        const ca = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
        if (holes.some((h) => ca > h.a0 && ca < h.a1 && cy > h.y0 && cy < h.y1)) continue;
        const m = typeof matFn === 'function' ? matFn(ca, cy) : matFn;
        if (axis === 'x') box(m, xs[i], ys[j], c - th / 2, xs[i + 1], ys[j + 1], c + th / 2, t0, t1, { base: y0 });
        else box(m, c - th / 2, ys[j], xs[i], c + th / 2, ys[j + 1], xs[i + 1], t0, t1, { base: y0 });
      }
    }
    // menuiserie : cadre + vitrage dans une ouverture
    function glaze(axis, c, h, t0, t1, mullion) {
      const f = 0.07, d = 0.13, ga = [h.a0, h.a1], gy = [h.y0, h.y1];
      const put = (mat, a0, y0, a1, y1, depth) => {
        if (axis === 'x') box(mat, a0, y0, c - depth / 2, a1, y1, c + depth / 2, t0, t1, { anim: 'grow' });
        else box(mat, c - depth / 2, y0, a0, c + depth / 2, y1, a1, t0, t1, { anim: 'grow' });
      };
      put(M.frame, ga[0], gy[0], ga[0] + f, gy[1], d); put(M.frame, ga[1] - f, gy[0], ga[1], gy[1], d);
      put(M.frame, ga[0], gy[1] - f, ga[1], gy[1], d); put(M.frame, ga[0], gy[0], ga[1], gy[0] + f, d);
      if (mullion) put(M.frame, (ga[0] + ga[1]) / 2 - f / 2, gy[0], (ga[0] + ga[1]) / 2 + f / 2, gy[1], d * 0.8);
      put(M.glass, ga[0] + f, gy[0] + f, ga[1] - f, gy[1] - f, 0.03);
    }
    const col = (x0, z0, x1, z1, y0, y1, t0, t1) => box(M.col, x0, y0, z0, x1, y1, z1, t0, t1, { base: y0 });

    /* --- repères d'implantation (piquets et cordeaux), visibles dès le début --- */
    const stakes = [[-7.6, -7.1], [5.7, -7.1], [5.7, 0.1], [-7.6, 0.1]];
    stakes.forEach((s) => box(M.stake, s[0] - 0.05, 0, s[1] - 0.05, s[0] + 0.05, 0.9, s[1] + 0.05, -0.02, 0.02, { anim: 'rise' }));
    for (let i = 0; i < 4; i++) {
      const a = stakes[i], b = stakes[(i + 1) % 4];
      box(M.tape, Math.min(a[0], b[0]) - 0.02, 0.62, Math.min(a[1], b[1]) - 0.02, Math.max(a[0], b[0]) + 0.02, 0.66, Math.max(a[1], b[1]) + 0.02, -0.02, 0.03, { anim: 'grow' });
    }
    // tas de parpaings et sable (retirés avant les finitions)
    for (let k = 0; k < 3; k++) for (let j = 0; j < 4 - k; j++) box(M.blockProp, 6.2 + j * 0.42, k * 0.2, 5.6, 6.6 + j * 0.42, k * 0.2 + 0.2, 5.9, 0.04 + k * 0.01, 0.1 + k * 0.01, { anim: 'grow' });
    for (let k = 0; k < 3; k++) for (let j = 0; j < 4 - k; j++) box(M.blockProp, 6.2 + j * 0.42, k * 0.2, 6.0, 6.6 + j * 0.42, k * 0.2 + 0.2, 6.3, 0.05 + k * 0.01, 0.11 + k * 0.01, { anim: 'grow' });

    /* --- fondation : dalle et poteaux du rez-de-chaussée --- */
    box(M.slab, -7.3, 0, -6.8, 5.3, 0.3, -0.2, 0.10, 0.22, { anim: 'sweepZ' });
    col(-7.04, -6.54, -6.66, -6.16, 0.3, 3.3, 0.24, 0.32); col(4.66, -6.54, 5.04, -6.16, 0.3, 3.3, 0.24, 0.32);
    col(-7.04, -0.84, -6.66, -0.46, 0.3, 3.3, 0.24, 0.32); col(4.66, -0.84, 5.04, -0.46, 0.3, 3.3, 0.24, 0.32);
    col(-3.19, -0.9, -2.81, -0.46, 0.3, 3.3, 0.26, 0.34); col(-3.19, -6.54, -2.81, -6.1, 0.3, 3.3, 0.26, 0.34);

    /* --- murs du rez-de-chaussée (parpaings) --- */
    const W1 = [0.32, 0.46];
    wall('x', -0.65, -7, 5, 0.3, 3.3, 0.3,
      [{ a0: -6.2, a1: -3.6, y0: 0.55, y1: 3.0 }, { a0: 0.5, a1: 2.5, y0: 0.3, y1: 2.9 }, { a0: -2.4, a1: -0.7, y0: 1.0, y1: 2.7 }, { a0: 3.3, a1: 4.6, y0: 1.0, y1: 2.7 }], M.wallW, W1[0], W1[1]);
    wall('x', -6.35, -7, 5, 0.3, 3.3, 0.3, [{ a0: -5.8, a1: -4.2, y0: 1.0, y1: 2.7 }, { a0: -2, a1: 0, y0: 1.0, y1: 2.7 }, { a0: 2.2, a1: 4.2, y0: 1.0, y1: 2.7 }], M.wallW, W1[0], W1[1]);
    wall('z', -6.85, -6.2, -0.8, 0.3, 3.3, 0.3, [{ a0: -5.4, a1: -3.6, y0: 1.0, y1: 2.7 }, { a0: -2.6, a1: -1.1, y0: 1.0, y1: 2.7 }], M.wallW, W1[0], W1[1]);
    wall('z', 4.85, -6.2, -0.8, 0.3, 3.3, 0.3, [{ a0: -4.8, a1: -2.4, y0: 1.0, y1: 2.7 }], M.wallW, W1[0], W1[1]);

    /* --- dalle du R+1 --- */
    box(M.slab, -7.3, 3.3, -6.8, 6.3, 3.6, 1.5, 0.47, 0.55, { anim: 'drop' });

    /* --- étage : poteaux et murs --- */
    col(-3.04, -6.54, -2.66, -6.16, 3.6, 6.6, 0.56, 0.62); col(5.66, -6.54, 6.04, -6.16, 3.6, 6.6, 0.56, 0.62);
    col(-3.04, 0.86, -2.66, 1.24, 3.6, 6.6, 0.56, 0.62); col(5.66, 0.86, 6.04, 1.24, 3.6, 6.6, 0.56, 0.62);
    const W2 = [0.58, 0.68];
    wall('x', 1.05, -3, 6, 3.6, 6.6, 0.3, [{ a0: -2.3, a1: 1.1, y0: 3.9, y1: 6.2 }, { a0: 2.7, a1: 5.5, y0: 4.3, y1: 5.9 }], (ca) => (ca > 2.5 ? M.wallT : M.wallW), W2[0], W2[1]);
    wall('x', -6.35, -3, 6, 3.6, 6.6, 0.3, [{ a0: -2, a1: -0.2, y0: 4.3, y1: 5.9 }, { a0: 1.5, a1: 3.5, y0: 4.3, y1: 5.9 }], M.wallW, W2[0], W2[1]);
    wall('z', -2.85, -6.2, 0.9, 3.6, 6.6, 0.3, [{ a0: -5.6, a1: -1.4, y0: 3.6, y1: 6.2 }], M.wallW, W2[0], W2[1]);
    wall('z', 5.85, -6.2, 0.9, 3.6, 6.6, 0.3, [{ a0: -4.8, a1: -3.4, y0: 4.3, y1: 5.9 }, { a0: -1.8, a1: 0.2, y0: 4.3, y1: 5.9 }], (ca) => (ca > -1 ? M.wallT : M.wallW), W2[0], W2[1]);

    /* --- toiture-terrasse, acrotères, local technique, panneaux solaires --- */
    box(M.slab, -3.3, 6.6, -6.8, 6.3, 6.9, 1.5, 0.66, 0.74, { anim: 'drop' });
    [[-3.3, 1.3, 6.3, 1.5], [-3.3, -6.8, 6.3, -6.6], [-3.3, -6.6, -3.1, 1.3], [6.1, -6.6, 6.3, 1.3]].forEach((p) => box(M.wallW, p[0], 6.9, p[1], p[2], 7.5, p[3], 0.72, 0.78, { base: 6.9 }));
    box(M.wallW, -1.6, 6.9, -5.2, 0.6, 8.7, -3.0, 0.74, 0.8, { base: 6.9 });
    for (let i = 0; i < 3; i++) box(M.solar, 2.0 + i * 1.3, 7.05, -4.6, 3.1 + i * 1.3, 7.1, -2.2, 0.92 + i * 0.02, 0.97 + i * 0.02, { anim: 'grow', rx: -0.28 });
    // acrotère coiffé d'une bande marine
    [[-3.3, 1.3, 6.3, 1.5]].forEach((p) => box(M.wallN, p[0] - 0.03, 7.5, p[1] - 0.03, p[2] + 0.03, 7.6, p[3] + 0.03, 0.8, 0.86, { anim: 'sweepX' }));

    /* --- échafaudage (posé pendant le gros œuvre, déposé avant l'enduit) --- */
    {
      const post = (x, z, h, a, b) => box(M.scaffold, x - 0.035, 0, z - 0.035, x + 0.035, h, z + 0.035, a, b, { anim: 'rise' });
      for (let k = 0; k < 6; k++) post(-3.5 + k * 1.95, 2.55, 7.9, 0.32, 0.38);
      for (let k = 0; k < 5; k++) post(7.0, -6.4 + k * 1.95, 7.9, 0.34, 0.4);
      [1.9, 3.7, 5.5, 7.3].forEach((y, lv) => {
        const a = 0.34 + lv * 0.02, b = a + 0.05;
        box(M.scaffold, -3.5, y, 2.5, 6.25, y + 0.06, 2.6, a, b, { anim: 'sweepX', rev: false });
        box(M.board, -3.5, y + 0.06, 1.4, 6.25, y + 0.1, 2.5, a, b, { anim: 'sweepX' });
        box(M.scaffold, 6.95, y, -6.45, 7.05, y + 0.06, 1.4, a, b, { anim: 'sweepZ' });
        box(M.board, 6.0, y + 0.06, -6.45, 6.95, y + 0.1, 1.4, a, b, { anim: 'sweepZ' });
        for (let k = 0; k < 6; k += 5) box(M.scaffold, -3.5 + k * 1.95, y, 1.4, -3.4 + k * 1.95, y + 0.05, 2.55, a, b, { anim: 'grow' });
      });
      [[0, 3.7, 5.5], [3, 5.5, 7.3]].forEach((d, i) => {
        const x0 = -3.5 + d[0] * 1.95, x1 = x0 + 2 * 1.95, ang = Math.atan2(d[2] - d[1], x1 - x0), len = Math.hypot(x1 - x0, d[2] - d[1]);
        const cx = (x0 + x1) / 2, cy = (d[1] + d[2]) / 2;
        box(M.scaffold, cx - len / 2, cy - 0.02, 2.55 - 0.02, cx + len / 2, cy + 0.02, 2.55 + 0.02, 0.4, 0.44, { anim: 'grow', rz: i ? -ang : ang });
      });
      // les éléments de l'échafaudage disparaissent avant l'enduit
      els.filter((e) => e.mat === M.scaffold || e.mat === M.board).forEach((e) => { e.out0 = 0.68; e.out1 = 0.74; });
    }
    els.filter((e) => e.mat === M.blockProp || e.mat === M.stake || e.mat === M.tape).forEach((e) => { e.out0 = e.mat === M.blockProp ? 0.66 : 0.12; e.out1 = e.mat === M.blockProp ? 0.74 : 0.2; });

    /* --- menuiseries (vitrages), porte, brise-soleil --- */
    const G = [0.78, 0.86];
    glaze('x', -0.65, { a0: -6.2, a1: -3.6, y0: 0.55, y1: 3.0 }, G[0], G[1], true);
    glaze('x', -0.65, { a0: -2.4, a1: -0.7, y0: 1.0, y1: 2.7 }, G[0] + 0.01, G[1] + 0.01, false);
    glaze('x', -0.65, { a0: 3.3, a1: 4.6, y0: 1.0, y1: 2.7 }, G[0] + 0.02, G[1] + 0.02, false);
    glaze('x', -6.35, { a0: -5.8, a1: -4.2, y0: 1.0, y1: 2.7 }, G[0], G[1], false); glaze('x', -6.35, { a0: -2, a1: 0, y0: 1.0, y1: 2.7 }, G[0], G[1], false); glaze('x', -6.35, { a0: 2.2, a1: 4.2, y0: 1.0, y1: 2.7 }, G[0], G[1], false);
    glaze('z', -6.85, { a0: -5.4, a1: -3.6, y0: 1.0, y1: 2.7 }, G[0], G[1], false); glaze('z', -6.85, { a0: -2.6, a1: -1.1, y0: 1.0, y1: 2.7 }, G[0], G[1], false);
    glaze('z', 4.85, { a0: -4.8, a1: -2.4, y0: 1.0, y1: 2.7 }, G[0] + 0.02, G[1] + 0.02, true);
    glaze('x', 1.05, { a0: -2.3, a1: 1.1, y0: 3.9, y1: 6.2 }, G[0] + 0.03, G[1] + 0.03, true);
    glaze('x', 1.05, { a0: 2.7, a1: 5.5, y0: 4.3, y1: 5.9 }, G[0] + 0.04, G[1] + 0.04, true);
    glaze('x', -6.35, { a0: -2, a1: -0.2, y0: 4.3, y1: 5.9 }, G[0], G[1], false); glaze('x', -6.35, { a0: 1.5, a1: 3.5, y0: 4.3, y1: 5.9 }, G[0], G[1], false);
    glaze('z', -2.85, { a0: -5.6, a1: -1.4, y0: 3.6, y1: 6.2 }, G[0] + 0.03, G[1] + 0.03, true);
    glaze('z', 5.85, { a0: -4.8, a1: -3.4, y0: 4.3, y1: 5.9 }, G[0] + 0.02, G[1] + 0.02, false); glaze('z', 5.85, { a0: -1.8, a1: 0.2, y0: 4.3, y1: 5.9 }, G[0] + 0.02, G[1] + 0.02, false);
    // porte d'entrée en bois, deux vantaux
    box(M.wood, 0.55, 0.3, -0.72, 1.48, 2.85, -0.58, 0.82, 0.9, { anim: 'grow' }); box(M.wood, 1.52, 0.3, -0.72, 2.45, 2.85, -0.58, 0.83, 0.91, { anim: 'grow' });
    box(M.frame, 1.3, 1.2, -0.56, 1.34, 1.9, -0.52, 0.88, 0.92, { anim: 'grow' }); box(M.frame, 1.66, 1.2, -0.56, 1.7, 1.9, -0.52, 0.88, 0.92, { anim: 'grow' });
    // brise-soleil en lames de bois sur la façade de l'étage
    box(M.slat, 1.3, 3.6, 1.2, 2.5, 6.6, 1.3, 0.8, 0.88, { anim: 'sweepZ', base: 3.6 });
    // pergola sur la terrasse
    for (let i = 0; i < 8; i++) box(M.wood, -7.05 + i * 0.52, 6.1, -6.65, -6.93 + i * 0.52, 6.3, -0.35, 0.84 + i * 0.004, 0.9 + i * 0.004, { anim: 'sweepZ' });
    [[-7.1, -6.65], [-7.1, -0.4], [-3.45, -6.65], [-3.45, -0.4]].forEach((p) => box(M.wood, p[0] - 0.08, 3.6, p[1] - 0.08, p[0] + 0.08, 6.1, p[1] + 0.08, 0.84, 0.9, { base: 3.6 }));
    // garde-corps vitrés de la terrasse
    [[-7.25, 3.6, -6.75, -7.2, 4.6, -0.25], [-7.2, 3.6, -0.3, -3.4, 4.6, -0.25], [-7.2, 3.6, -6.75, -3.4, 4.6, -6.7]].forEach((r, i) => {
      box(M.railGlass, r[0], r[1], r[2], r[3], r[4], r[5], 0.86 + i * 0.01, 0.92 + i * 0.01, { anim: 'sweepX', base: 3.6 });
      box(M.frame, r[0] - 0.02, 4.6, r[2] - 0.02, r[3] + 0.02, 4.67, r[5] + 0.02, 0.88 + i * 0.01, 0.94 + i * 0.01, { anim: 'sweepX' });
    });

    /* --- perron, dalle de la terrasse couverte, escalier --- */
    box(M.deck, -3.3, 0, -0.2, 6.3, 0.16, 2.5, 0.8, 0.88, { anim: 'sweepZ' });
    box(M.deck, 0.0, 0, 2.5, 3.1, 0.1, 3.1, 0.82, 0.9, { anim: 'sweepZ' });

    /* --- clôture, portail et piliers --- */
    const FW = [0.76, 0.87], FC = [0.87, 0.93];
    wall('z', -10.2, -10.35, 10.35, 0, 2.2, 0.3, [], M.wallW, FW[0], FW[1]);
    wall('z', 10.2, -10.35, 10.35, 0, 1.1, 0.3, [], M.wallW, FW[0] + 0.01, FW[1] + 0.01);
    wall('x', -10.2, -10.35, 10.35, 0, 2.2, 0.3, [], M.wallW, FW[0] + 0.02, FW[1] + 0.02);
    wall('x', 10.2, -10.35, -0.55, 0, 1.1, 0.3, [], M.wallW, FW[0] + 0.03, FW[1] + 0.03);
    wall('x', 10.2, 3.55, 10.35, 0, 1.1, 0.3, [], M.wallW, FW[0] + 0.03, FW[1] + 0.03);
    box(M.wallN, -10.4, 2.2, -10.4, 10.4, 2.3, -10.0, FC[0], FC[1], { anim: 'sweepX', base: 2.2 });
    box(M.wallN, -10.4, 2.2, -10.4, -10.0, 2.3, 10.4, FC[0], FC[1], { anim: 'sweepZ', base: 2.2 });
    box(M.wallN, 9.95, 1.1, -10.4, 10.4, 1.18, 10.4, FC[0], FC[1], { anim: 'sweepZ', base: 1.1 });
    box(M.wallN, -10.4, 1.1, 9.95, -0.55, 1.18, 10.4, FC[0], FC[1], { anim: 'sweepX', base: 1.1 });
    box(M.wallN, 3.55, 1.1, 9.95, 10.4, 1.18, 10.4, FC[0], FC[1], { anim: 'sweepX', base: 1.1 });
    box(M.wallW, -0.85, 0, 10.0, -0.45, 2.6, 10.4, 0.8, 0.87, { base: 0 }); box(M.wallW, 3.45, 0, 10.0, 3.85, 2.6, 10.4, 0.8, 0.87, { base: 0 });
    for (let i = 0; i < 13; i++) box(M.metal, -0.4 + i * 0.3, 0.12, 10.22, -0.34 + i * 0.3, 1.9, 10.28, 0.89 + i * 0.002, 0.94 + i * 0.002, { anim: 'rise' });
    box(M.frame, -0.45, 0.12, 10.2, 3.5, 0.2, 10.3, 0.88, 0.93, { anim: 'sweepX' }); box(M.frame, -0.45, 1.85, 10.2, 3.5, 1.93, 10.3, 0.88, 0.93, { anim: 'sweepX' });

    /* --- piscine, margelles, plage, transats --- */
    box(M.deck, -9.9, 0, 1.9, -2.9, 0.08, 7.2, 0.86, 0.93, { anim: 'sweepX' });
    box(M.poolFloor, -9.0, 0.08, 2.6, -4.2, 0.12, 6.6, 0.88, 0.93, { anim: 'sweepX' });
    [[-9.25, 2.6, -8.75, 6.6], [-4.45, 2.6, -3.95, 6.6]].forEach((p) => box(M.poolTile, p[0], 0.08, p[1], p[2], 0.52, p[3], 0.88, 0.94, { anim: 'rise', base: 0.08 }));
    [[-8.75, 2.35, -4.45, 2.85], [-8.75, 6.35, -4.45, 6.85]].forEach((p) => box(M.poolTile, p[0], 0.08, p[1], p[2], 0.52, p[3], 0.88, 0.94, { anim: 'rise', base: 0.08 }));
    [[-8.2, 0.62], [-7.2, 0.62]].forEach((p) => {
      box(M.lounger, p[0] - 0.35, 0.08, 7.25 - 0.2, p[0] + 0.35, 0.28, 7.25 + 1.55, 0.94, 1.0, { anim: 'grow' });
      box(M.lounger, p[0] - 0.35, 0.3, 7.1, p[0] + 0.35, 0.42, 7.5, 0.95, 1.0, { anim: 'grow', rx: 0.7 });
    });

    /* ---------- instanciation ---------- */
    const unit = new THREE.BoxGeometry(1, 1, 1);
    const groups = new Map();
    els.forEach((e) => { if (!groups.has(e.mat)) groups.set(e.mat, []); groups.get(e.mat).push(e); });
    const noShadow = new Set([M.railGlass]);
    groups.forEach((list, mat) => {
      const m = new THREE.InstancedMesh(unit, mat, list.length);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      m.castShadow = !noShadow.has(mat);
      m.receiveShadow = !noShadow.has(mat) && mat !== M.glass;
      if (mat === M.glass || mat === M.railGlass) m.renderOrder = 2;
      list.forEach((e, i) => { e.mesh = m; e.idx = i; });
      root.add(m);
    });
    const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
    function place(e, p) {
      let t = clamp((p - e.t0) / (e.t1 - e.t0));
      if (e.out0 !== undefined) t = Math.min(t, 1 - clamp((p - e.out0) / (e.out1 - e.out0)));
      else if (e.rev) t = 1 - t;
      const w = e.x1 - e.x0, h = e.y1 - e.y0, d = e.z1 - e.z0;
      let px = (e.x0 + e.x1) / 2, py = (e.y0 + e.y1) / 2, pz = (e.z0 + e.z1) / 2, sx = w, sy = h, sz = d;
      if (t <= 0) { sx = sy = sz = 0; }
      else switch (e.anim) {
        case 'rise': { const k = easeOutCubic(t); py = e.base + (py - e.base) * k; sy = h * k; break; }
        case 'drop': { const k = easeOutCubic(t), s = clamp(t * 6); py += (1 - k) * 3.4; sx *= s; sy *= s; sz *= s; break; }
        case 'grow': { const k = easeOutBack(t); sx *= k; sy *= k; sz *= k; break; }
        case 'sweepX': { const k = easeOutCubic(t); sx = w * k; px = e.x0 + sx / 2; break; }
        case 'sweepZ': { const k = easeOutCubic(t); sz = d * k; pz = e.z0 + sz / 2; break; }
        default: break;
      }
      _p.set(px, py, pz); _e.set(e.rx, e.ry, e.rz); _q.setFromEuler(_e);
      _s.set(Math.max(sx, 1e-4), Math.max(sy, 1e-4), Math.max(sz, 1e-4));
      _m.compose(_p, _q, _s);
      e.mesh.setMatrixAt(e.idx, _m);
    }

    /* ------------------------------------------------------------------ */
    /* Éléments « organiques » : arbres, piscine, personnage, repère GPS   */
    /* ------------------------------------------------------------------ */
    const extras = [];    // { obj, t0, t1, rev, out0, out1, s }
    const addExtra = (obj, t0, t1, o) => { o = o || {}; obj.userData.s = obj.scale.x; extras.push(Object.assign({ obj: obj, t0: t0, t1: t1 }, o)); root.add(obj); return obj; };
    const shadowed = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

    function palm(x, z, h, seed, t0) {
      const g = new THREE.Group(), r = rng(seed);
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3((r() - 0.5) * 0.3, h * 0.35, 0.2), new THREE.Vector3((r() < 0.5 ? -1 : 1) * (0.2 + r() * 0.3), h * 0.7, 0.1), new THREE.Vector3((r() - 0.5) * 0.5, h, (r() - 0.5) * 0.4)]);
      const tub = new THREE.TubeGeometry(curve, 14, 0.17, 8, false), tp = tub.attributes.position;
      for (let i = 0; i < tp.count; i++) {
        const c = curve.getPointAt(Math.floor(i / 9) / 14), k = 1 - 0.38 * (Math.floor(i / 9) / 14);
        tp.setXYZ(i, c.x + (tp.getX(i) - c.x) * k, c.y + (tp.getY(i) - c.y) * k, c.z + (tp.getZ(i) - c.z) * k);
      }
      tub.computeVertexNormals();
      g.add(shadowed(new THREE.Mesh(tub, M.palmTrunk)));
      const top = curve.getPointAt(1), fg = makeFrondGeometry(2.7, 9), fronds = new THREE.Group();
      fronds.position.copy(top);
      for (let k = 0; k < 11; k++) {
        const f = shadowed(new THREE.Mesh(fg, M.leaf));
        f.rotation.y = (k / 11) * Math.PI * 2 + r() * 0.4; f.rotation.z = (r() - 0.5) * 0.35; f.scale.setScalar(0.8 + r() * 0.45);
        fronds.add(f);
      }
      g.add(fronds); g.userData.fronds = fronds;
      g.position.set(x, 0, z);
      palms.push(g);
      return addExtra(g, t0, t0 + 0.07);
    }
    function baobab(x, z, s) {
      const g = new THREE.Group();
      const prof = [[0.001, 0], [1.0, 0], [1.2, 0.5], [1.12, 1.3], [0.9, 2.3], [0.72, 3.1], [0.62, 3.7], [0.001, 3.8]].map((p) => new THREE.Vector2(p[0], p[1]));
      g.add(shadowed(new THREE.Mesh(new THREE.LatheGeometry(prof, 24), M.trunk)));
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + 0.3, len = 1.9 + (k % 3) * 0.35, tilt = 0.9 + (k % 2) * 0.25;
        const br = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, len, 7), M.trunk));
        br.position.set(Math.cos(a) * Math.sin(tilt) * len * 0.5, 3.5 + Math.cos(tilt) * len * 0.5, Math.sin(a) * Math.sin(tilt) * len * 0.5);
        br.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
        g.add(br);
        const lf = shadowed(new THREE.Mesh(blobGeometry(0.95 + (k % 3) * 0.12, 2, 40 + k, 0.12), k % 2 ? M.leafLight : M.leafDark));
        lf.position.set(Math.cos(a) * Math.sin(tilt) * len * 1.0, 3.5 + Math.cos(tilt) * len * 1.0 + 0.1, Math.sin(a) * Math.sin(tilt) * len * 1.0);
        lf.scale.set(1.25, 0.62, 1.25); g.add(lf);
      }
      const top = shadowed(new THREE.Mesh(blobGeometry(1.3, 2, 77, 0.1), M.leafDark)); top.position.y = 4.9; top.scale.set(1.3, 0.6, 1.3); g.add(top);
      g.position.set(x, 0, z); g.scale.setScalar(s);
      return addExtra(g, -0.1, 0.01);
    }
    function shrub(x, z, r, mat, t0, y) {
      const m = shadowed(new THREE.Mesh(blobGeometry(r, 2, Math.floor(x * 13 + z * 7 + 99), 0.12), mat));
      m.position.set(x, y === undefined ? r * 0.55 : y, z); m.scale.y = 0.75;
      return addExtra(m, t0, t0 + 0.06);
    }
    const palms = [];
    baobab(8.4, -3.8, 0.78);
    palm(-8.6, 8.4, 6.0, 1, 0.9); palm(9.1, 3.9, 5.4, 2, 0.93); palm(-9.2, 0.6, 5.0, 3, 0.95); palm(-1.0, -9.0, 5.8, 4, 0.91);
    [[-9.5, 9.0, 0.7], [-8.6, 9.3, 0.55], [9.4, 9.0, 0.62], [9.5, -8.8, 0.7], [-9.4, -6.0, 0.55], [-9.3, -3.0, 0.6]].forEach((s, i) => shrub(s[0], s[1], s[2], i % 3 === 0 ? M.leafLight : M.leafDark, 0.94 + i * 0.006));
    [[9.4, 8.2, 0.5], [-9.4, 8.2, 0.42], [9.4, -1.0, 0.5]].forEach((s, i) => shrub(s[0], s[1], s[2], M.bloom, 0.97 + i * 0.006, 0.55));

    // monticule de sable (retiré avant les finitions)
    {
      const g = new THREE.ConeGeometry(1.7, 1.25, 28, 8), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + 0.07 * Math.sin(x * 3 + z * 2.2 + y * 4); p.setXYZ(i, x * k, y, z * k); }
      g.computeVertexNormals();
      const m = shadowed(new THREE.Mesh(g, M.sandPile)); m.position.set(-6.2, 0.62, 5.6);
      addExtra(m, 0.04, 0.12, { out0: 0.66, out1: 0.74 });
    }

    // piscine : plan d'eau qui monte
    const water = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 4.0), M.water);
    water.rotation.x = -Math.PI / 2; water.position.set(-6.6, 0.3, 4.6); water.renderOrder = 3; root.add(water);

    // superviseur de chantier (casque blanc, gilet orange) qui contrôle avec son téléphone
    const worker = (function () {
      const g = new THREE.Group();
      const cyl = (rt, rb, h, mat, x, y, z) => { const m = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 14), mat)); m.position.set(x, y, z); g.add(m); return m; };
      cyl(0.1, 0.085, 0.86, M.navy, -0.1, 0.43, 0); cyl(0.1, 0.085, 0.86, M.navy, 0.1, 0.43, 0);
      cyl(0.2, 0.17, 0.64, M.hivis, 0, 1.17, 0);
      cyl(0.205, 0.205, 0.05, M.helmet, 0, 1.08, 0); cyl(0.2, 0.2, 0.05, M.helmet, 0, 1.28, 0);
      const head = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.135, 18, 14), M.skin)); head.position.y = 1.64; g.add(head);
      const hat = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.155, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.helmet)); hat.position.y = 1.66; g.add(hat);
      const brim = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 18), M.helmet)); brim.position.set(0, 1.665, 0.02); g.add(brim);
      const arm = cyl(0.045, 0.04, 0.5, M.hivis, 0.26, 1.28, 0.18); arm.rotation.set(-1.0, 0, -0.15);
      const arm2 = cyl(0.045, 0.04, 0.5, M.hivis, -0.26, 1.15, 0.02); arm2.rotation.set(0, 0, 0.12);
      const ph = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.012), M.frame)); ph.position.set(0.3, 1.46, 0.4); ph.rotation.set(-0.25, 0, 0); g.add(ph);
      g.position.set(4.2, 0, 6.6); g.rotation.y = -2.55;
      return addExtra(g, 0.3, 0.38);
    })();

    // repère GPS : épingle terracotta et onde au sol
    const pin = new THREE.Group();
    {
      const head = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 20), M.pin)); head.position.y = 1.15;
      const tip = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.2, 28), M.pin)); tip.rotation.x = Math.PI; tip.position.y = 0.38;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), M.pinDot); dot.position.set(0, 1.15, 0.5);
      pin.add(head, tip, dot);
    }
    pin.position.set(-1.9, 3.0, 6.4); root.add(pin);
    const ringMat = new THREE.MeshBasicMaterial({ color: lin('#c1622d'), transparent: true, opacity: 0.6, depthWrite: false, toneMapped: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.05, 56), ringMat);
    ring.rotation.x = -Math.PI / 2; ring.position.set(-1.9, 0.03, 6.4); root.add(ring);
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.05, 56), ringMat.clone());
    ring2.rotation.x = -Math.PI / 2; ring2.position.set(-1.9, 0.03, 6.4); root.add(ring2);
    const pinDisc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), new THREE.MeshBasicMaterial({ color: lin('#c1622d'), transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }));
    pinDisc.rotation.x = -Math.PI / 2; pinDisc.position.set(-1.9, 0.03, 6.4); root.add(pinDisc);

    /* ------------------------------------------------------------------ */
    /* Avancement, caméra, rendu                                           */
    /* ------------------------------------------------------------------ */
    let progress = 0;
    const sunCol0 = lin('#fff3e4'), sunCol1 = lin('#ffd2a0'), tmpCol = new THREE.Color();
    function setProgress(p) {
      progress = clamp(p, 0, 1);
      for (let i = 0; i < els.length; i++) place(els[i], progress);
      groups.forEach((list) => { list[0].mesh.instanceMatrix.needsUpdate = true; });
      extras.forEach((x) => {
        let t = clamp((progress - x.t0) / (x.t1 - x.t0));
        if (x.out0 !== undefined) t = Math.min(t, 1 - clamp((progress - x.out0) / (x.out1 - x.out0)));
        x.obj.visible = t > 0;
        x.obj.scale.setScalar(Math.max(1e-4, x.obj.userData.s * (x.rev ? 1 : easeOutBack(t))));
      });
      paint.value = lerp(-1.5, 9.8, smooth((progress - 0.66) / 0.17));
      finMat.opacity = smooth((progress - 0.78) / 0.12);
      finMat.visible = finMat.opacity > 0.001;
      const wt = clamp((progress - 0.86) / 0.08);
      water.visible = wt > 0; water.position.y = lerp(0.1, 0.3, easeOutCubic(wt));
      const late = smooth((progress - 0.62) / 0.38);
      sunAz = lerp(-42, -60, late); sunEl = lerp(50, 33, late);
      tmpCol.copy(sunCol0).lerp(sunCol1, late); sun.color.copy(tmpCol);
      sun.intensity = lerp(base.sun, base.sunLate, late);
      M.glass.emissiveIntensity = 0.3 * smooth((progress - 0.9) / 0.1);
      renderer.toneMappingExposure = lerp(base.exposure, base.exposureLate, late);
      applyLight();
      renderer.shadowMap.needsUpdate = true;
    }
    let sunAz = -42, sunEl = 50;
    function applyLight() {
      const az = sunAz * Math.PI / 180, el = sunEl * Math.PI / 180;
      sun.position.set(Math.sin(az) * Math.cos(el) * 70, Math.sin(el) * 70 + 1, Math.cos(az) * Math.cos(el) * 70);
    }

    const pose = { az: 38, el: 24, dist: 52, ty: 0.3, tx: 0, tz: 0, fov: 22, zoom: 1, half: 14.6 };
    let aspect = 1;
    function applyPose() {
      const az = pose.az * Math.PI / 180, el = pose.el * Math.PI / 180;
      // distance minimale pour que la largeur utile de la maquette (≈ 27 m) tienne dans le cadre
      const need = (pose.half || 13.5) / (Math.tan(pose.fov * Math.PI / 360) * aspect);
      const d = Math.max(need, pose.dist) * (pose.zoom || 1);
      camera.position.set(pose.tx + Math.sin(az) * Math.cos(el) * d, pose.ty + Math.sin(el) * d, pose.tz + Math.cos(az) * Math.cos(el) * d);
      camera.fov = pose.fov; camera.lookAt(pose.tx, pose.ty, pose.tz); camera.updateProjectionMatrix();
    }
    function setPose(p) { Object.assign(pose, p || {}); applyPose(); }
    function setSize(w, h, dpr) {
      renderer.setPixelRatio(dpr || 1); renderer.setSize(w, h, false);
      aspect = w / h; camera.aspect = aspect; applyPose();
    }

    function render(time) {
      time = time || 0;
      const ph1 = (time % 2.4) / 2.4, ph2 = ((time + 1.2) % 2.4) / 2.4;
      pin.position.y = 3.0 + Math.sin(time * 2.2) * 0.14; pin.rotation.y = Math.sin(time * 0.9) * 0.35;
      ring.scale.setScalar(0.6 + ph1 * 2.6); ring.material.opacity = 0.55 * (1 - ph1) * (1 - ph1);
      ring2.scale.setScalar(0.6 + ph2 * 2.6); ring2.material.opacity = 0.55 * (1 - ph2) * (1 - ph2);
      palms.forEach((g, i) => { g.userData.fronds.rotation.y = Math.sin(time * 0.7 + i * 1.7) * 0.05; g.userData.fronds.rotation.z = Math.sin(time * 1.1 + i) * 0.015; });
      renderer.render(scene, camera);
    }
    function snapshot(o) {
      o = o || {};
      const w = o.width || 800, h = o.height || 800;
      setSize(w, h, 1); render(o.time || 0.4);
      return canvas.toDataURL(o.type || 'image/png', o.quality || 0.9);
    }
    function project(x, y, z, w, h) {
      const v = new THREE.Vector3(x, y, z).project(camera);
      return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
    }

    function tune(o) {
      Object.assign(base, o || {});
      hemi.intensity = base.hemi; rim.intensity = base.rim;
      Object.keys(M).forEach((k) => { const m = M[k]; if (m.envMapIntensity !== undefined) { if (m.userData.env0 === undefined) m.userData.env0 = m.envMapIntensity; m.envMapIntensity = m.userData.env0 * base.env; } });
      setProgress(progress);
    }
    applyPose(); setProgress(0);
    return {
      tune: tune,
      renderer: renderer, scene: scene, camera: camera,
      setProgress: setProgress, getProgress: () => progress,
      setPose: setPose, getPose: () => Object.assign({}, pose),
      setSize: setSize, render: render, snapshot: snapshot, project: project,
    };
  }

  global.KSScene = { create: create, version: '1.0' };
})(window);
