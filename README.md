# TuneTrack

**TuneTrack** est une application web fullstack permettant de rechercher des artistes et des morceaux, gérer des playlists et des favoris, avec un système d’authentification utilisateur.

L’objectif est de démontrer les opérations CRUD sur MongoDB via un backend Flask en Python, et de générer des rapports analytiques avec visualisation des données.

---

## Structure du projet

- `spotify-back` : backend Python Flask, gestion de l’API, base MongoDB, authentification, logique métier  
- `spotify-front` : frontend React, interface utilisateur, appels API

---

## Fonctionnalités

- Recherche d’artistes et de morceaux via l’API Spotify  
- Gestion des playlists : création, modification, suppression  
- Ajout et gestion des artistes favoris  
- Système d’authentification (inscription, connexion)  
- CRUD complet sur MongoDB (insertion, mise à jour, suppression)  
- Requêtes d’agrégation pour analyses et rapports  
- Visualisation graphique de la popularité des artistes/morceaux dans le temps

---

## Installation & Lancement

### Backend

1. Aller dans le dossier backend :  
   ```bash
   cd spotify-back
   ```
2. Installer les dépendances :  
   ```bash
   pip install -r requirements.txt
   ```
3. Configurer les variables d’environnement (`client_id` et `client_secret` Spotify) dans un fichier `.env` ou directement dans le code.  
4. Lancer MongoDB (vérifier que le service MongoDB est actif).  
5. Démarrer le serveur Flask :  
   ```bash
   python main.py
   ```

### Frontend

1. Aller dans le dossier frontend :  
   ```bash
   cd ../spotify-front
   ```
2. Installer les dépendances :  
   ```bash
   npm install
   ```
3. Lancer l’application React :  
   ```bash
   npm start
   ```

---

## Usage

- Accéder à l’application via [http://localhost:3000](http://localhost:3000)  
- Utiliser les fonctionnalités de recherche, gestion playlists, favoris, etc.  
- Consulter les rapports analytiques et visualisations

---
