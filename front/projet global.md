# Projet Global - EAM

Date de mise a jour: 2026-03-19

## Vision produit

EAM reste une plateforme d'apprentissage de l'allemand orientee resultat pour les Malgaches qui preparent:
- Ausbildung
- Au Pair
- FSJ / BFD
- etudes ou depart vers l'Allemagne

## Direction produit actuelle

Les priorites restent:
- parler avant ecrire;
- mobile avant desktop;
- simple avant complexe;
- utile avant decoratif;
- progression avant gadget.

## Direction design actuelle

Le frontend a migre vers Tailwind CSS.

Reference visuelle officielle:
- fond blanc et bleu clair;
- textes vert profond et brun chaud;
- interface claire premium;
- responsive mobile-first;
- `Outfit` pour les titres;
- `Source Sans 3` pour le texte courant.

## Regles frontend

- ne plus creer de `*.module.css` dans `src`;
- utiliser `tailwind.config.js` comme source de verite des tokens;
- utiliser `src/index.css` pour la base globale Tailwind;
- utiliser `src/utils/ui.js` pour les variantes partagees;
- garder la logique metier existante intacte pendant les refontes UI.

## Pages critiques a toujours verifier

- accueil
- login / register
- dashboard
- cours / lecon
- communaute
- sprechen
- guide Allemagne

## Etat d'avancement

Le projet est encore dans une phase de stabilisation produit, mais la couche visuelle frontend a ete refondue et standardisee sur Tailwind.
