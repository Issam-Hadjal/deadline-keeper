# Deadline Keeper

Vos échéances importantes au même endroit, avec un rappel avant chaque date limite.

Ce dépôt est né du [modèle Next.js](https://github.com/Issam-Hadjal/modele-next). Les consignes des
agents, la pile et les commandes sont dans [AGENTS.md](AGENTS.md).

## En local

```bash
npm ci
npm run dev
```

Puis ouvrir http://localhost:3000. Les tests :

```bash
npm test
npx playwright install chromium   # une fois
npm run build && npm run test:e2e
```

## Mise en production

Vercel déploie la branche `production` ; chaque autre branche et chaque pull request a
sa préversion. `production` n’avance que lorsque le propriétaire y fusionne `main`.
