# Occupancy Rate Dashboard

## Description du Projet

Ce projet permet de gérer et d'afficher les données d'occupation et de surface des bâtiments en temps réel. Il utilise Vue.js et une API REST pour récupérer et présenter les données sous forme de graphiques et de tableaux interactifs.

### Fonctionnalités principales :
- Récupération des informations sur les bâtiments, étages, et salles.
- Affichage des données d'occupation (en pourcentage) par étage et par salle.
- Synchronisation des graphiques pour une meilleure analyse des données.
- Intégration avec des APIs pour gérer dynamiquement les données d'occupation.

---

## Structure du Projet

- **`App.vue`** : Composant principal de l'application.
- **`MainComponent.vue`** : Gère l'affichage des données et la coordination des graphiques.
- **`LineCard.vue`** : Composant pour les graphiques en ligne.
- **`BarCard.vue`** : Composant pour les graphiques en barres.
- **`FloorOccupancyDetail.vue`** : Détail de l'occupation par étage.
- **`index.js`** : Fichier central pour les requêtes API et les calculs métiers.

---

## Prérequis

- Node.js (v14+ recommandé)
- npm ou yarn
- Une API fonctionnelle pour gérer les données des bâtiments

---

## Installation

1. Clonez le dépôt :
   ```bash
   git clone <url_du_dépôt>
   cd <nom_du_dossier>
