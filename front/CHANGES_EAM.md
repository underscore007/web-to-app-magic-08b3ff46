# Changements Realises Sur EAM

Date: 2026-03-17

Ce fichier explique ce qui a ete corrige/ajoute dans le projet EAM (frontend + backend) pendant cette session.

## 1) Objectif et regles du projet (projet global.md)

- Priorite: SIMPLE > Beau
- Priorite langue: MALAGASY > Francais > Anglais
- Priorite reseau: OFFLINE > Online
- Priorite device: MOBILE > Desktop

Le travail a donc ete oriente vers:
- corriger les crashs backend/frontend,
- remettre les pages critiques en etat fonctionnel,
- installer un systeme de langue MG/FR/MIX,
- brancher le chat et Sprechen (pas de placeholders),
- ajouter un mode mobile plus fluide (BottomNav),
- creer du contenu cours/lecons/exercices en JSON et l'afficher.

## 2) Corrections et ajouts Frontend

### 2.1 Systeme bilingue MG/FR/MIX

- Ajout d'un contexte de langue avec persistance localStorage (`eam_lang`).
  - Fichier: `src/context/LangContext.jsx`
  - API: `lang`, `setLang`, `t(mg, fr, { sep })`
  - `mix` affiche MG + FR, `mg` affiche MG, `fr` affiche FR.

- Activation globale:
  - `src/main.jsx` enveloppe l'app avec `LangProvider`.

### 2.2 Navbar (desktop + mobile)

- Ajout d'un switch MG / MIX / FR dans la navbar.
- Labels de navigation adaptes (MG/FR/MIX) via une table de traduction.
- Ajout du switch de langue aussi dans le menu mobile.
- Ajout des styles correspondants.

Fichiers:
- `src/components/navbar/Navbar.jsx`
- `src/components/navbar/Navbar.module.css`

### 2.3 Page Cours (liste des lecons)

- Stabilisation du format des donnees (evite `lecons.filter is not a function`).
- Support des titres bilingues `{ mg, fr }` pour l'affichage.

Fichier:
- `src/pages/Cours.jsx`

### 2.4 Page Lecon (support 50 exercices + nouveaux types)

Le projet avait deja 3 types d'exercices:
- QCM
- Traduction
- Fill blank (pontilles)

Ajouts realises:
- Nouveaux types d'exercices et composants:
  - `match` (relier)
  - `build` (construction de phrase)
  - `horen` (ecoute via AudioPlayer / TTS navigateur)
  - `sprechen` (micro via MicrophoneRecorder)

Mise a jour de la page lecon:
- Affichage des titres/description en MG/FR/MIX si ce sont des objets.
- Routage vers les nouveaux composants d'exercices.
- Design page lecon refait (topbar sticky, cartes, responsive).

Fichiers:
- `src/pages/Lecon.jsx`
- `src/pages/Lecon.module.css`
- `src/components/cours/ExerciceMatchPairs.jsx`
- `src/components/cours/ExerciceBuildPhrase.jsx`
- `src/components/cours/ExerciceHoren.jsx`
- `src/components/cours/ExerciceSprechen.jsx`

### 2.5 Communaute (Chat) - suppression des placeholders

- La page Communauté affichait des placeholders.
- Elle utilise maintenant:
  - `ChatRoom` (messages + input)
  - `UserOnline` (utilisateurs en ligne)

Fichiers:
- `src/pages/Communaute.jsx`
- `src/pages/Communaute.module.css` (zone message etiree)

### 2.6 Sprechen - suppression des placeholders

- La page Sprechen avait des imports commentes/placeholders.
- Elle utilise maintenant les vrais composants:
  - `MicrophoneRecorder`
  - `PartnerMatcher`
  - `SessionSprechen`
  - `ScoreSprechen`

Fichier:
- `src/pages/Sprechen.jsx`

### 2.7 CSS modules manquants (Sprechen)

Le build Vite cassait car plusieurs fichiers CSS modules n'existaient pas dans `src/components/sprechen`.
Ajout des fichiers:
- `src/components/sprechen/MicrophoneRecorder.module.css`
- `src/components/sprechen/PartnerMatcher.module.css`
- `src/components/sprechen/SessionSprechen.module.css`
- `src/components/sprechen/ScoreSprechen.module.css`
- `src/components/sprechen/CorrectionFeedback.module.css`

### 2.8 Mobile: BottomNav + page Profil

Depuis `projet global.md` (Partie Mobile):
- Ajout d'une bottom navigation sur mobile (<= 768px) pour acces rapide.
- Cachee sur `/sprechen` et `/communaute` (pages full width).
- Visible seulement si l'utilisateur est connecte.

Ajouts:
- `src/components/BottomNav.jsx`
- `src/components/BottomNav.module.css`

Profil minimal pour que le lien existe:
- `src/pages/MonProfil.jsx`
- `src/pages/MonProfil.module.css`
- route ajoutee: `/mon-profil` dans `src/App.jsx`

### 2.9 AuthContext: centralisation API (Bug critique #1 du doc)

`projet global.md` demande de ne pas utiliser axios direct dans AuthContext afin de profiter des intercepteurs de `src/services/api.js`.

Modification:
- AuthContext utilise maintenant `authAPI` (login/register/me).

Fichier:
- `src/context/AuthContext.jsx`

### 2.10 MainLayout: hook offline (Bug critique #5 du doc)

- Suppression du mini-hook inline.
- Utilisation de `useOffline`.
- Ajout d'une mini-banniere "Reconnecte" (3s) apres reconnexion.

Fichiers:
- `src/layouts/MainLayout.jsx`
- `src/layouts/MainLayout.module.css` (padding bas pour BottomNav)
- `src/hooks/useOffline.js` (deja existant)

## 3) Backend: stabilisation et nouvelles donnees cours

### 3.1 Prisma: singleton (Bug critique #4)

- Creation du singleton Prisma:
  - `backend/prisma/client.js`
- Mise a jour de plusieurs routes pour utiliser ce singleton:
  - `backend/routes/auth.routes.js`
  - `backend/routes/user.routes.js`
  - `backend/routes/chat.routes.js`
  - `backend/routes/sprechen.routes.js`
  - `backend/routes/progression.routes.js`
  - `backend/socket/chat.socket.js` (suppression du disconnect apres chaque message)

### 3.2 Cours/lecons/exercices en JSON (au moins 10 lecons par niveau)

Demande: creer au moins 10 lecons par niveau et 50 exercices par lecon.

- Generation des fichiers JSON:
  - `backend/data/cours/A1.json` (30 lecons)
  - `backend/data/cours/A2.json` (10 lecons)
  - `backend/data/cours/B1.json` (10 lecons)
  - `backend/data/cours/B2.json` (10 lecons)
  - `backend/data/cours/C1.json` (10 lecons)
- `backend/data/cours/C2.json` (10 lecons)

## 6) Migration Tailwind + refonte visuelle

Date: 2026-03-19

Ce qui a ete fait:
- installation de Tailwind CSS, PostCSS et Autoprefixer sur le frontend Vite;
- ajout de `tailwind.config.js` et `postcss.config.js`;
- remplacement de l'ancien design system CSS par une entree Tailwind unique dans `src/index.css`;
- ajout de helpers de design dans `src/utils/ui.js` et `src/components/cours/exerciseUi.js`;
- refonte visuelle complete en style clair premium:
  - fonds blanc et bleu clair,
  - textes vert profond et brun chaud,
  - typographies `Outfit` et `Source Sans 3`,
  - responsive mobile-first plus dense sur les pages de travail et plus aere sur les pages marketing.

Frontend refondu:
- coque applicative: navbar, bottom nav, layout principal, loader, barre XP;
- pages: Home, Login, Register, Dashboard, Cours, Lecon, Communaute, Sprechen, Guide, MonProfil, NotFound;
- composants chat: ChatRoom, MessageList, MessageInput, UserOnline, EmojiPicker, CanalSelector;
- composants cours: AudioPlayer et tous les composants `Exercice*`;
- composants sprechen: MicrophoneRecorder, PartnerMatcher, SessionSprechen, ScoreSprechen, CorrectionFeedback.

Nettoyage final:
- suppression des `*.module.css` restants dans `src`;
- Tailwind devient la seule source de verite stylistique du frontend.

- Script de generation:
  - `scripts/generateCoursJson.mjs`

- Route cours remplacee pour lire les JSON et renvoyer:
  - liste (metadonnees + progression) : `GET /api/cours/:niveau/lecons`
  - detail complet: `GET /api/cours/lecon/:leconId`

Fichier:
- `backend/routes/cours.routes.js`

## 4) IA / "model AI open source" sans cle API

Dans cette version:
- `Sprechen` et `Horen` s'appuient sur les capacites navigateur (TTS + Speech Recognition) deja utilisees par le projet.
- Aucun appel API externe ni cle API.

Si tu veux une IA 100% open-source offline (ex: Whisper/Vosk) il faudra choisir une integration:
- soit WebAssembly (dans le navigateur),
- soit un service local cote backend.

## 5) Commandes utiles

Frontend:
- `npm run dev`
- `npm run build`
- `npm run lint`

Backend:
- `cd backend`
- `npm run dev`

Generation des JSON cours:
- `node scripts/generateCoursJson.mjs`

