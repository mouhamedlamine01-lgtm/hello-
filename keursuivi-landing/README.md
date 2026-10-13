# KeurSuivi : landing page

Landing page bilingue (FR/EN) du service de suivi de chantier KeurSuivi, avec une maquette 3D qui se construit au fil du défilement. Elle reprend la charte du cahier des charges (marine `#1E2A38`, terracotta `#C1622D`, sable `#F7EFE3`, Sora et Inter) et existe en thème clair et sombre.

## Ce que contient le dossier

| Fichier | Rôle |
| --- | --- |
| `index.html` | La page finale, autonome (CSS, JS et images intégrés). À héberger telle quelle. |
| `config.json` | Numéro WhatsApp et adresse e-mail affichés sur la page. |
| `src/` | Sources : `body.html`, `style.css`, `app.js`, `scene.js` (la scène 3D), `map.svg`. |
| `assets/` | Images fabriquées à partir de la scène 3D : affiche du héros, trois photos d'exemple, six icônes. |
| `tools/` | `bake.js` et `icons.js` : fabriquent les images de `assets/`. |
| `build.mjs` | Assemble `src/` et `assets/` en `index.html`. |

## Commandes

```bash
node build.mjs                      # régénère index.html
node build.mjs --artifact page.html # version « fragment » pour une publication en artefact
npm install && npm run bake         # régénère les images 3D (Three.js r128 + Chromium)
```

## Changer le numéro WhatsApp ou l'e-mail

Modifier `config.json`, puis lancer `node build.mjs`. Les valeurs actuelles sont celles de la fiche d'identité du cahier des charges. Le numéro professionnel définitif et l'adresse sur le domaine restent à décider.

## Ce que la page fait, et ne fait pas

- La 3D (Three.js r128) et les polices (Google Fonts) se chargent depuis Internet. Sans WebGL ou sans réseau, la page affiche l'affiche 3D fixe et reste entièrement lisible.
- Le formulaire ne stocke rien. Il prépare un message WhatsApp que la personne envoie elle-même, comme les boutons de paiement de la phase 1. Brancher une vraie destination (e-mail ou tableur) reste à faire.
- Les prix sont ceux du cahier des charges. Les montants en FCFA et en euros ne correspondent pas (environ 22 % d'écart), c'est une décision ouverte.
- Le prix annuel est calculé à partir de « 12 mois payés en une fois, 2 mois offerts » : 10 mois facturés pour 12 mois de suivi.
- L'exemple de rapport est fictif et le dit. Ses dates se mettent à jour à chaque visite de la page.
- Aucun témoignage : il n'y a pas encore de client. À ajouter quand il y en aura de réels.

## Avant la mise en ligne

Acheter le nom de domaine, créer l'adresse e-mail professionnelle, brancher le formulaire, ajouter les liens Instagram et Facebook, une image de partage (`og:image`) et la politique de confidentialité.
