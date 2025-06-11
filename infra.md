# Infrastructure EcoDeli Backend

## Architecture Docker

L'application utilise une architecture Docker avec deux conteneurs principaux :

1. **Conteneur Application** (`app`)

   - Image : Node.js 20 Alpine
   - Port : 4000
   - Environnement : Production
   - Dépendances : Python3, Make, G++ (pour bcrypt)
   - Multi-stage build pour optimiser la taille de l'image

2. **Conteneur Base de Données** (`postgres`)
   - Image : PostgreSQL 16 Alpine
   - Port : 5432
   - Volume : `ecodeli-postgres-data`
   - Configuration via variables d'environnement

## Configuration Docker

### Dockerfile.prod

```dockerfile
# Stage de build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage de production
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY .env.prod .env
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### docker-compose.prod.yml

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - '4000:4000'
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    volumes:
      - ecodeli-postgres-data:/var/lib/postgresql/data

volumes:
  ecodeli-postgres-data:
```

### docker-compose.local.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:latest
    container_name: ecodeli-postgres
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Scripts et Commandes

### Scripts NPM

```json
{
  "scripts": {
    "start": "ts-node src/index.ts",
    "dev": "nodemon --exec \"ts-node --files --transpile-only\" src/index.ts",
    "build": "tsc",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all"
  }
}
```

### Commandes Docker Utiles

#### Développement

```bash
# Démarrer l'environnement de développement
docker-compose -f docker-compose.local.yml up -d

# Voir les logs
docker-compose -f docker-compose.local.yml logs -f

# Arrêter l'environnement
docker-compose -f docker-compose.local.yml down
```

#### Production

```bash
# Construction et démarrage
docker-compose -f docker-compose.prod.yml up -d --build

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Reconstruire et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build
```

### Base de Données

```bash
# Connexion à la base de données
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d ecodeli_db

# Sauvegarde
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres ecodeli_db > backup.sql

# Restauration
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d ecodeli_db
```

## Configuration de l'Environnement

### Variables d'Environnement (.env.prod)

```env
# Base de données
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecodeli_db
DB_HOST=postgres
DB_PORT=5432

# Application
NODE_ENV=production
PORT=4000
JWT_SECRET=your_jwt_secret

# Services externes (optionnels)
# DATADOG_API_KEY=your_datadog_api_key
# STRIPE_SECRET_KEY=your_stripe_secret_key
# SENDGRID_API_KEY=your_sendgrid_api_key
# RECAPTA_SECRET_KEY=your_recaptcha_secret_key
# SENDGRID_FROM_EMAIL=your_sendgrid_from_email
```

## Bonnes Pratiques

### Sécurité

- Ne jamais commiter les fichiers `.env`
- Utiliser des secrets pour les clés API
- Limiter les ports exposés
- Utiliser des images Alpine pour réduire la surface d'attaque

### Performance

- Utiliser le multi-stage build pour réduire la taille des images
- Optimiser les layers Docker
- Nettoyer régulièrement les ressources non utilisées
- Utiliser des volumes nommés pour la persistance des données

### Maintenance

- Mettre à jour régulièrement les images de base
- Sauvegarder régulièrement la base de données
- Monitorer l'utilisation des ressources
- Maintenir les dépendances à jour

## Dépannage

### Problèmes Courants

1. **Conteneur en redémarrage constant**

   ```bash
   # Vérifier les logs
   docker-compose -f docker-compose.prod.yml logs app
   ```

2. **Erreur de connexion à la base de données**

   - Vérifier les variables d'environnement dans `.env.prod`
   - Vérifier que le conteneur postgres est en cours d'exécution
   - Vérifier les logs de postgres

3. **Problèmes de build**

   ```bash
   # Nettoyer le cache Docker
   docker builder prune -f
   # Reconstruire l'image
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

4. **Problèmes de mémoire**
   ```bash
   # Vérifier l'utilisation des ressources
   docker stats
   # Nettoyer les ressources non utilisées
   docker system prune -f
   ```
