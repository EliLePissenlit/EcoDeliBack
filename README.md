# EcoDeli Backend

Backend de l'application EcoDeli, une plateforme de livraison écologique.

## 🏗️ Structure du Projet

```
src/
├── config/         # Configuration (base de données, etc.)
├── controllers/    # Logique des contrôleurs
├── middleware/     # Middlewares Express
├── models/         # Modèles Sequelize
├── routes/         # Routes de l'API
├── scripts/        # Scripts utilitaires
├── seeds/          # Données de test
├── types/          # Types TypeScript
└── utils/          # Utilitaires
```

## 🚀 Installation

1. Cloner le projet :
```bash
git clone [url-du-repo]
cd EcoDeliBack
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer l'environnement :
```bash
cp .env.example .env
# Modifier les variables dans .env selon votre environnement
```

4. Initialiser la base de données :
```bash
# Créer la base de données
npx ts-node src/scripts/resetDatabase.ts

# Exécuter les migrations
npx ts-node src/scripts/runMigrations.ts

# Insérer les données de test
npx ts-node src/seeds/index.ts
```

5. Démarrer le serveur :
```bash
npm run dev
```

## 📡 Routes API

### Authentification
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/me` - Profil de l'utilisateur connecté
- `PUT /api/users/me` - Mise à jour du profil
- `DELETE /api/users/me` - Suppression du compte

### Administration (requiert des droits admin)
- `GET /api/users` - Liste tous les utilisateurs
- `GET /api/users/:id` - Détails d'un utilisateur
- `PUT /api/users/:id/role` - Modifie le rôle d'un utilisateur
- `PUT /api/users/:id/admin` - Modifie le statut admin
- `DELETE /api/users/:id` - Supprime un utilisateur

## 🛠️ Technologies Utilisées

### Base
- **TypeScript** : Langage de programmation typé
- **Node.js** : Runtime JavaScript
- **Express** : Framework web

### Base de données
- **PostgreSQL** : Base de données relationnelle
- **Sequelize** : ORM pour la gestion de la base de données

### Sécurité
- **bcryptjs** : Hachage des mots de passe
- **jsonwebtoken** : Gestion des tokens d'authentification
- **cors** : Protection CORS

### Validation & Types
- **yup** : Validation des données
- **express-async-handler** : Gestion des erreurs asynchrones

## 👥 Utilisateurs de Test

```json
{
  "admin": {
    "email": "admin@ecodeli.com",
    "password": "admin123"
  },
  "client": {
    "email": "client@ecodeli.com",
    "password": "client123"
  },
  "livreur": {
    "email": "livreur@ecodeli.com",
    "password": "livreur123"
  },
  "commercant": {
    "email": "commercant@ecodeli.com",
    "password": "commercant123"
  }
}
```

## 📝 Scripts NPM

- `npm run dev` : Démarre le serveur en mode développement
- `npm run build` : Compile le projet TypeScript
- `npm start` : Démarre le serveur en production
- `npm run test:db` : Teste la connexion à la base de données

## 🔐 Variables d'Environnement

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecodeli
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=24h
``` 