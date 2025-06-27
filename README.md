# EcoDeli Backend

Backend API avec TypeScript, Node.js, Express.js et PostgreSQL.

## Stack Technique

- **Runtime**: Node.js (v20+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Base de données**: PostgreSQL
- **ORM**: Sequelize
- **Documentation**: Swagger
- **Authentification**: JWT

## Architecture

Le backend suit une architecture structurée :

- **Routes** : Définissent les endpoints de l'API
- **Controllers** : Gèrent les requêtes HTTP et les réponses
- **Services** : Contiennent la logique métier
- **Models** : Définissent les modèles de données avec Sequelize
- **Middlewares** : Gèrent l'authentification, la validation, etc.

## Prérequis

- Node.js (v20 ou supérieur)
- Docker et Docker Compose
- PostgreSQL (via Docker)

## Installation

1. Cloner le repository :

```bash
git clone [repository-url]
cd ecodeli-backend
```

2. Installer les dépendances :

```bash
npm install
```

3. Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecodeli_db
DB_HOST=localhost
DB_PORT=5432
NODE_ENV=development
JWT_SECRET=your_jwt_secret
PORT=4000
DATADOG_API_KEY=your_datadog_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
RECAPTA_SECRET_KEY=your_recaptcha_secret_key
SENDGRID_FROM_EMAIL=your_sendgrid_from_email

```

4. Démarrer la base de données PostgreSQL avec Docker :

```bash
docker-compose up -d
```

5. Exécuter les migrations :

```bash
npm run migrate
```

6. Démarrer le serveur en mode développement :

```bash
npm run dev
```

## Structure du Projet

```
└── 📁src
    └── 📁constants
        └── roles.ts
    └── 📁controllers
        └── 📁admin
            └── admin-user.controller.ts
        └── 📁auth
            └── auth.controller.ts
        └── 📁user
            └── user.controller.ts
    └── 📁database
        └── 📁config
            └── config.js
            └── config.ts
            └── sequelize.ts
        └── 📁migrations
            └── 20240320000000-create-users.ts
            └── 20240321000000-add-user-fields.ts
        └── 📁models
            └── User.ts
        └── 📁seeds
            └── 20240321000000-seed-users.ts
    └── 📁external-services
        └── 📁stripe
            └── index.ts
    └── 📁middlewares
        └── 📁auth
            └── auth.middleware.ts
    └── 📁routes
        └── 📁admin
            └── admin-user.routes.ts
        └── 📁auth
            └── auth.routes.ts
        └── index.ts
        └── 📁user
            └── user.routes.ts
    └── 📁services
        └── 📁auth
            └── auth.service.ts
        └── 📁user
            └── user.service.ts
    └── 📁types
        └── 📁auth
            └── auth.types.ts
        └── 📁user
            └── user.types.ts
    └── 📁utils
        └── 📁auth
            └── auth.utils.ts
        └── logger.ts
    └── index.ts
```

## Commandes Disponibles

- `npm start` : Démarre le serveur
- `npm run dev` : Démarre le serveur en mode développement avec hot-reload
- `npm run build` : Compile le TypeScript
- `npm run lint` : Vérifie le code avec ESLint
- `npm run lint:fix` : Corrige automatiquement les erreurs ESLint
- `npm run format` : Formate le code avec Prettier
- `npm run migrate` : Exécute les migrations
- `npm run migrate:undo` : Annule la dernière migration
- `npm run seed` : Exécute les seeders

## Documentation API

La documentation de l'API est disponible via Swagger (en dev) à l'adresse :
`http://localhost:4000/api-docs`

## Développement

```bash
docker-compose -f docker-compose.local.yml up -d
npm run dev
```

## Déploiement en Production

### Prérequis pour la Production

- Docker et Docker Compose installés sur le serveur
- Un fichier `.env` configuré avec les variables d'environnement de production
- Un domaine configuré (optionnel, pour HTTPS)

### Configuration du Fichier .env en Production

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Configuration de la base de données
DB_USERNAME=your_prod_db_username
DB_PASSWORD=your_secure_prod_db_password
DB_DATABASE=ecodeli_db

# Variables sensibles (à configurer directement dans l'environnement du serveur)
JWT_SECRET=your_secure_jwt_secret
DATADOG_API_KEY=your_datadog_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
RECAPTA_SECRET_KEY=your_recaptcha_secret_key
SENDGRID_FROM_EMAIL=your_sendgrid_from_email
```

> **Note de sécurité importante** : Les variables sensibles (JWT_SECRET, API keys, etc.) ne doivent pas être stockées dans le fichier `.env` en production. Il est recommandé de les configurer directement dans l'environnement du serveur ou d'utiliser un gestionnaire de secrets comme Vault ou AWS Secrets Manager.

### Déploiement avec Docker Compose

1. Clonez le repository sur votre serveur :

```bash
git clone [repository-url]
cd ecodeli-backend
```

2. Configurez le fichier `.env` avec les variables de production

3. Démarrez les services en production :

```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. Pour voir les logs :

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Commandes Utiles en Production

- Arrêter les services :

```bash
docker-compose -f docker-compose.prod.yml down
```

- Reconstruire et redémarrer les services :

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

- Voir le statut des conteneurs :

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Mise à Jour de l'Application

Pour mettre à jour l'application en production :

1. Récupérer les derniers changements :

```bash
git pull origin main
```

2. Reconstruire et redémarrer les services :

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Sauvegarde de la Base de Données

Pour sauvegarder la base de données :

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $DB_USERNAME $DB_DATABASE > backup.sql
```

Pour restaurer une sauvegarde :

```bash
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U $DB_USERNAME $DB_DATABASE
```

### Sécurité en Production

- Assurez-vous que toutes les variables d'environnement sont correctement configurées
- Utilisez des mots de passe forts pour la base de données
- Configurez un pare-feu pour limiter l'accès aux ports nécessaires
- Considérez l'utilisation d'un reverse proxy (comme Nginx) pour gérer le SSL/TLS
- Activez la journalisation des erreurs avec Datadog
