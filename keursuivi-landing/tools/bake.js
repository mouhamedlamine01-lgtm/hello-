// Fabrique les images de la page à partir de la scène 3D : affiche du héros, photos d'exemple, icônes.
//   node tools/bake.js [icons|poster|photos|all]
// Prérequis : npm i three@0.128.0 playwright-core (ou variables THREE_JS et CHROMIUM). Sortie : assets/*.webp
let chromium;
try { ({ chromium } = require('playwright-core')); } catch (e) { ({ chromium } = require('playwright')); }
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const THREE = process.env.THREE_JS || path.join(ROOT, 'node_modules/three/build/three.min.js');
const CHROMIUM = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = path.join(ROOT, 'assets');
const PREVIEW = process.env.PREVIEW_DIR || null;      // dossier facultatif de PNG de contrôle
const mode = process.argv[2] || 'all';

const save = (name, dataUrl, ext) => {
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name + '.' + ext), buf);
  console.log(name + '.' + ext, (buf.length / 1024).toFixed(1) + ' Ko');
};

(async () => {
  const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('console:', m.text().slice(0, 300)); });
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.setContent('<body style="margin:0;background:#F7EFE3"></body>');
  await page.addScriptTag({ content: fs.readFileSync(THREE, 'utf8') });
  await page.addScriptTag({ content: fs.readFileSync(path.join(ROOT, 'src/scene.js'), 'utf8') });
  await page.addScriptTag({ content: fs.readFileSync(path.join(ROOT, 'tools/icons.js'), 'utf8') });
  await page.evaluate(() => {
    window.shrink = (src, w, h, type, q) => {
      const o = document.createElement('canvas'); o.width = w; o.height = h;
      const x = o.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(src, 0, 0, w, h);
      return o.toDataURL(type, q);
    };
  });

  /* ----- icônes 3D : 944 px réduits à 236 px (suréchantillonnage x4) ----- */
  if (mode === 'icons' || mode === 'all') {
    const names = await page.evaluate(() => { const c = document.createElement('canvas'); window.__ic = KSIcons.create(c); window.__icc = c; return window.__ic.names; });
    for (const n of names) {
      const r = await page.evaluate((n) => { const c = window.__ic.render(n, 944); return { webp: shrink(c, 236, 236, 'image/webp', 0.9), png: shrink(c, 236, 236, 'image/png') }; }, n);
      save('ic-' + (n === 'chat' ? 'chat' : n), r.webp, 'webp');
      if (PREVIEW) { fs.mkdirSync(PREVIEW, { recursive: true }); fs.writeFileSync(path.join(PREVIEW, 'ic-' + n + '.png'), Buffer.from(r.png.split(',')[1], 'base64')); }
    }
  }

  /* ----- affiche du héros : même pose que la page au premier affichage, fond transparent ----- */
  if (mode === 'poster' || mode === 'all') {
    const r = await page.evaluate(() => {
      const c = document.createElement('canvas');
      const sc = KSScene.create(c, {});
      sc.setSize(2640, 2200, 1); sc.setProgress(1);
      sc.setPose({ az: 38, el: 24, ty: 0.2, zoom: 1 });
      sc.render(0);
      return { webp: shrink(c, 1320, 1100, 'image/webp', 0.86), png: shrink(c, 660, 550, 'image/png') };
    });
    save('hero', r.webp, 'webp');
    if (PREVIEW) fs.writeFileSync(path.join(PREVIEW, 'hero.png'), Buffer.from(r.png.split(',')[1], 'base64'));
  }

  /* ----- trois « photos de chantier » pour l'exemple de rapport ----- */
  if (mode === 'photos' || mode === 'all') {
    const shots = [
      { name: 'photo1', p: 0.31, pose: { az: 24, el: 17, ty: 1.2, tx: -0.5, tz: -3, dist: 8, half: 7.5, zoom: 1 } },
      { name: 'photo2', p: 0.56, pose: { az: 54, el: 13, ty: 3.2, tx: 0.6, tz: -2, dist: 8, half: 9, zoom: 1 } },
      { name: 'photo3', p: 0.86, pose: { az: 26, el: 10, ty: 3.4, tx: 0.4, tz: 0, dist: 8, half: 8.4, zoom: 1 } },
    ];
    for (const s of shots) {
      const r = await page.evaluate((s) => {
        const c = document.createElement('canvas');
        const sc = KSScene.create(c, {});
        sc.setSize(1440, 1440, 1); sc.setProgress(s.p); sc.setPose(s.pose); sc.render(0.3);
        const o = document.createElement('canvas'); o.width = o.height = 360;
        const x = o.getContext('2d');
        const g = x.createLinearGradient(0, 0, 0, 360);
        g.addColorStop(0, '#7fa9d2'); g.addColorStop(0.5, '#cfdcea'); g.addColorStop(0.66, '#eadfc9'); g.addColorStop(1, '#d4bf99');
        x.fillStyle = g; x.fillRect(0, 0, 360, 360);
        x.imageSmoothingQuality = 'high'; x.drawImage(c, 0, 0, 360, 360);
        // vignette douce et grain léger pour une allure de photo
        const v = x.createRadialGradient(180, 180, 120, 180, 180, 260);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,14,8,0.28)');
        x.fillStyle = v; x.fillRect(0, 0, 360, 360);
        const id = x.getImageData(0, 0, 360, 360), d = id.data;
        let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
        x.putImageData(id, 0, 0);
        return { webp: o.toDataURL('image/webp', 0.8), png: o.toDataURL('image/png') };
      }, s);
      save(s.name, r.webp, 'webp');
      if (PREVIEW) fs.writeFileSync(path.join(PREVIEW, s.name + '.png'), Buffer.from(r.png.split(',')[1], 'base64'));
    }
  }
  await browser.close();
})().catch((e) => { console.error('FAIL', e.stack || e.message); process.exit(1); });
