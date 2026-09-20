# Projet Maison Douceur

Boutique de desserts en pot, préparés chaque matin à **Hamo 4, Guédiawaye** et livrés
dans tout Dakar.

- **Contact** : +221 77 467 14 93 · +221 78 525 96 41 (le premier sert de numéro WhatsApp)
- **Carte** : 12 pots de 180 ml, de 2 500 à 4 000 F, répartis en quatre familles
- **Coffrets** : 4 pots pour 12 000 F, 6 pots pour 17 000 F, parfums choisis par le client
- **Événement** : sur devis à partir de 20 pots
- **Paiement** : Wave, Orange Money, espèces à la livraison
- **Livraison** : frais réglés directement avec le livreur, selon le quartier
- Toute la carte est **halal**

## Contenu du dossier

| Chemin | Rôle |
|---|---|
| `data/produits.json` | Source unique : marque, familles, produits, coffrets, offre événement, livraison |
| `prototype/index.html` | Prototype complet du site, autonome, sans dépendance à installer |

Le prototype est publié ici : https://claude.ai/artifact/VoXT3eKH6WTmqC6nioJLLt

Pour l'ouvrir en local, il suffit d'ouvrir `prototype/index.html` dans un navigateur.
Le fichier est écrit au format attendu par les artifacts Claude : il n'a ni `<!doctype>`
ni `<html>`, que le navigateur ajoute de lui-même.

## Ce que le prototype fait déjà

- Catalogue filtrable par famille, pots dessinés en SVG avec étiquette de marque
- Panier avec quantités, persistant dans le navigateur
- Coffret composé parfum par parfum par le client
- Formulaire de commande (nom, téléphone, quartier, adresse, date, créneau) qui ouvre
  WhatsApp avec le message déjà rédigé
- Demande de devis événement, également via WhatsApp
- « Mode gérant » en bas de page pour marquer un parfum épuisé

## Limites connues

- Le mode gérant n'agit que sur le navigateur du gérant : les visiteurs ne voient pas
  les ruptures. Il faut une vraie base de données pour que ce soit partagé.
- Les pots sont des illustrations. Des photos réelles restent le plus gros levier
  de conversion.
- Aucune commande n'est enregistrée : tout passe par WhatsApp.

## Suite prévue

Site Next.js + Tailwind lisant `data/produits.json`, avec une petite administration
pour les ruptures du jour et l'enregistrement des commandes.
