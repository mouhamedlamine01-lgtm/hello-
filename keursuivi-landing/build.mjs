// Assemble la landing page KeurSuivi.
//   node build.mjs                 -> index.html (page autonome, prête à héberger)
//   node build.mjs --artifact FILE -> version « fragment » pour la publication en artefact
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const root = path.dirname(url.fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const argv = process.argv.slice(2);
const artifactOut = argv.includes('--artifact') ? argv[argv.indexOf('--artifact') + 1] : null;

const cfg = JSON.parse(read('config.json'));
const inject = (t) => t.replaceAll('{{WA}}', cfg.whatsapp).replaceAll('{{WA_TEXT}}', cfg.whatsappDisplay).replaceAll('{{EMAIL}}', cfg.email);
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&family=Sora:wght@600;700;800&display=swap';
const DESC = 'KeurSuivi : suivi de chantier à distance au Sénégal. Un superviseur local indépendant visite votre chantier ; vous recevez photos datées et géolocalisées, rapport et dépenses justifiées.';
const TITLE = 'KeurSuivi : suivi de chantier au Sénégal';

// images calculées (affiche 3D, photos d'exemple, icônes 3D) : intégrées en data URI
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
const assets = {};
const dir = path.join(root, 'assets');
if (fs.existsSync(dir)) {
  for (const f of fs.readdirSync(dir)) {
    const ext = path.extname(f);
    if (mime[ext]) assets[path.basename(f, ext)] = 'data:' + mime[ext] + ';base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');
  }
}
const PX = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const missing = new Set();
const body = inject(read('src/body.html'))
  .replace('{{map}}', read('src/map.svg'))
  .replace(/\{\{asset:([\w-]+)\}\}/g, (m, k) => { if (!assets[k]) missing.add(k); return assets[k] || PX; });
const css = read('src/style.css');
const scene = read('src/scene.js');
const app = inject(read('src/app.js'));
for (const [n, code] of [['scene.js', scene], ['app.js', app]]) {
  if (/<\/script/i.test(code)) throw new Error(n + ' contient </script');
}

const favicon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#1E2A38"/><path d="M13 29V12h3.4v7.2L22.4 12h4.2l-6.2 7.1L27 29h-4.2l-4.6-7.4-1.8 2V29z" fill="#F7EFE3"/><path d="M15.4 9.6L20 5.7l4.6 3.9" fill="none" stroke="#C1622D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">`;
const scripts = `<script src="${THREE_URL}"></script>
<script>
${scene}
</script>
<script>
${app}
</script>`;

if (artifactOut) {
  // le conteneur d'artefacts ajoute lui-même doctype, html, head et body
  const fragment = `<title>KeurSuivi</title>
${fonts}
<style>
${css}
</style>
${body}
${scripts}
`;
  fs.mkdirSync(path.dirname(artifactOut), { recursive: true });
  fs.writeFileSync(artifactOut, fragment);
  console.log('artefact :', artifactOut, (fragment.length / 1024).toFixed(0) + ' Ko');
} else {
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${TITLE}</title>
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#F7EFE3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101820" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_SN">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<link rel="icon" href="${favicon}">
${fonts}
<style>
${css}
</style>
</head>
<body>
${body}
${scripts}
</body>
</html>
`;
  fs.writeFileSync(path.join(root, 'index.html'), html);
  console.log('index.html :', (html.length / 1024).toFixed(0) + ' Ko');
}
if (missing.size) console.log('images absentes (remplacées par un pixel transparent) :', [...missing].join(', '));
