# Suivi Guide Prioritaire et Dernieres Modifications

Date: 2026-03-19

## Position actuelle dans le guide prioritaire

Etat le plus probable:
- Le projet est encore dans `Priorite 1 - Corriger les bugs existants`.
- Plus precisement, il est dans `Phase 1 - Stabilisation`.
- Et il correspond encore a `Sprint 1 - Bugs`.

Pourquoi:
- les fichiers modifies touchent surtout l'auth, Prisma, layout/offline, communaute, sprechen et plusieurs pages critiques;
- ce sont exactement les zones listees dans `GUIDE_PRIORITES_DEVELOPPEMENT.md` comme travail a faire avant toute nouvelle grosse feature;
- je ne vois pas encore de preuve claire que le projet est passe a `Sprint 2 - Gamification`.

Conclusion pratique:
- on n'est pas encore dans une vraie phase "nouvelles features";
- on est encore en stabilisation de l'existant, avec du frontend, du backend et du contenu cours en cours d'ajustement.

## Rappel du guide a suivre maintenant

Priorites du guide:
1. Ne rien casser
2. Corriger les bugs existants
3. Stabiliser auth, base de donnees, offline/layout, communaute et sprechen
4. Ensuite seulement passer aux fonctionnalites coeur

Zones critiques du guide deja ciblees par les modifications:
- `src/context/AuthContext.jsx`
- `src/pages/Communaute.jsx`
- `src/pages/Sprechen.jsx`
- `backend/prisma/client.js`
- `src/layouts/MainLayout.jsx`

## Base documentaire deja presente

Le fichier existant `CHANGES_EAM.md` documente surtout une session datee du `2026-03-17`.

Ce qu'il indique deja:
- mise en place du systeme de langue MG/FR/MIX;
- correction de plusieurs pages critiques;
- remplacement de placeholders sur Communaute et Sprechen;
- ajout d'une navigation mobile;
- centralisation auth via `authAPI`;
- branchement du hook offline;
- stabilisation Prisma;
- ajout de donnees de cours en JSON.

## Dernieres modifications visibles aujourd'hui

Etat observe via Git:
- beaucoup de fichiers sont modifies mais non finalises dans le working tree;
- les changements sont toujours concentres sur la stabilisation du site;
- le build `dist/` a aussi ete modifie, ce qui montre qu'un rebuild ou une regeneration partielle a eu lieu.

### Backend modifie

- `backend/package.json`
- `backend/package-lock.json`
- `backend/prisma/client.js`
- `backend/prisma/initDb.js`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `backend/routes/auth.routes.js`
- `backend/server.js`
- `backend/socket/chat.socket.js`

Lecture rapide:
- auth et serveur encore en evolution;
- Prisma et la base sont encore en train d'etre ajustes;
- le chat socket a recu des modifications recentes.

### Frontend modifie

- `src/context/AuthContext.jsx`
- `src/layouts/MainLayout.jsx`
- `src/hooks/useOffline.js`
- `src/services/api.js`
- `src/components/BottomNav.jsx`
- `src/components/navbar/Navbar.jsx`
- `src/pages/Communaute.jsx`
- `src/pages/Sprechen.jsx`
- `src/pages/Cours.jsx`
- `src/pages/Lecon.jsx`
- `src/pages/Home.jsx`
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/MonProfil.jsx`

Composants fortement touches:
- chat: `ChatRoom`, `EmojiPicker`, `MessageInput`, `MessageList`, `UserOnline`, `Guide`
- cours: plusieurs composants `Exercice*`
- sprechen: `MicrophoneRecorder`, `PartnerMatcher`, `SessionSprechen`, `ScoreSprechen`, `CorrectionFeedback`

Lecture rapide:
- le frontend est encore en phase de remise en etat globale;
- les pages critiques et les composants interactifs sont en train d'etre consolides;
- cela confirme encore la phase de stabilisation du guide.

### Build / fichiers generes modifies

- `dist/index.html`
- `dist/assets/*` avec de nombreuses suppressions et au moins un asset regenere

Lecture rapide:
- le dossier de build ne semble pas propre/stable pour l'instant;
- il faudra probablement refaire un build propre plus tard pour figer l'etat final.

## Lecture d'avancement

Ce qui semble deja engage:
- correction auth;
- correction Prisma / backend;
- rebranchement Communaute;
- rebranchement Sprechen;
- travail mobile/layout/offline;
- enrichissement des cours et exercices.

Ce qui n'est pas encore clairement valide dans les fichiers consultes:
- tests de non-regression;
- verification complete du parcours utilisateur;
- confirmation qu'on peut clore `Sprint 1`.

## Prochaine logique avant de passer a autre chose

Ordre recommande:
1. verifier et finir la stabilisation en cours;
2. nettoyer l'etat Git si necessaire;
3. valider frontend + backend + build;
4. seulement apres, ouvrir `Sprint 2 - Gamification`.

## Note

Ce fichier est un point de situation.
Il ne remplace pas `GUIDE_PRIORITES_DEVELOPPEMENT.md` ni `CHANGES_EAM.md`.
