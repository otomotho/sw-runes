# Changelog - SW Rune Optimizer

## [v1.2] - 2026-05-17
### Ajustement taille et centrage des ic�nes de set

## [v1.2] - 2026-05-17
### Ajustement taille et centrage des ic�nes de set

## [v1.2] - 2026-05-17
### Correction
- Réduction de la taille de l'icône du set et recentrage sur l'image du slot.

## [v1.1.7] - 2026-05-17
### Affichage combine slot+set avec images de dimensions variables

## [v1.1.7] - 2026-05-17
### Amélioration
- Affichage combiné : image du slot en fond et icône du set par-dessus (comme sur swrunebuilder.com).

## [v1.1.6] - 2026-05-17
### Correction du bouton de modification des seuils et rajout des fonts de runes intangible et seal

## [v1.1.6] - 2026-05-17
### Correction du bouton de modification des seuils et rajout des fonts de runes intangible et seal

## [v1.1.6] - 2026-05-17
### Correction
- Réparation du bouton "Modifier les seuils" (réintégration des fonctions de gestion du modal).
- Aucune autre modification fonctionnelle.

## [v1.1.5] - 2026-05-17
### Ajout des icones de sets via police personnalisee

## [v1.1.4] - 2026-05-17
### Ajout colonne Origine, credit, version en top bar pas footer, reduction espacements

## [v1.1.3] - 2026-05-17
### Ajout colonne Origine, credit, version, reduction espacements

## [v1.1.3] - 2026-05-17
### Ajout colonne Origine, credit, version, reduction espacements

## [v1.1.3] - 2026-05-17
### Ajout
- Colonne "Origine" affichant l'emplacement de la rune (Inventory / Talisman).
- Footer avec crédit (Made by otomotho) et numéro de version.

### Modification
- Réduction des espacements dans le tableau pour un affichage plus compact.

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