# Changelog - SW Rune Optimizer


## [v1.1.0] - 2026-05-18
### Changement
- Renommage définitif de tous les fichiers d'icônes en minuscules pour éviter les problèmes de casse.

## [v1.0.5] - 2026-05-18
### Correction
- Réparation des icônes des sets (problème de casse : utilisation du nom exact du set, sans `toLowerCase()`).
- Les icônes sont désormais chargées en respectant la casse (ex: `Energy_Rune_Icon.webp` au lieu de `energy_Rune_Icon.webp`).

## [v1.0.4] - 2026-05-17
### Ajout
- Dossier `/icons` intégré dans l’image Docker.
- Fonction `getSetIcon` adaptée pour utiliser les fichiers `.webp` locaux.

## [v1.0.3] - 2026-05-17
### Sécurité
- Correction du certificat TLS via Let's Encrypt (HTTP-01 challenge).
- Mise en place d’un `Issuer` local pour éviter les erreurs Cloudflare.

## [v1.0.2] - 2026-05-17
### Amélioration
- Remplacement temporaire des icônes par des cercles CSS (en attendant les images).

## [v1.0.1] - 2026-05-17
### Ajout
- Première version publique avec déploiement Kubernetes.
- Filtres par décision (Keep, Sell, Gem, etc.).
- Mode avancé (affichage des colonnes supplémentaires).

## [v1.0.0] - 2026-05-16
### Initial
- Version de base issue du développement local.