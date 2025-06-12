#!/bin/bash

# couleurs  messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 Démarrage des tests de l'environnement de production..."

# Chargement des variables d'environnement
if [ -f .env.prod ]; then
    echo "📝 Chargement des variables d'environnement depuis .env.prod..."
    set -a
    source .env.prod
    set +a
else
    echo "📝 Création du fichier .env.prod..."
    cat > .env.prod << EOL
# Database
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecodeli_db
DB_HOST=postgres
DB_PORT=5432

# App
NODE_ENV=production
PORT=4000

# JWT
JWT_SECRET=your_jwt_secret

# Optional services (can be configured later)
# DATADOG_API_KEY=your_datadog_api_key
# STRIPE_SECRET_KEY=your_stripe_secret_key
# SENDGRID_API_KEY=your_sendgrid_api_key
# RECAPTA_SECRET_KEY=your_recaptcha_secret_key
# SENDGRID_FROM_EMAIL=your_sendgrid_from_email
EOL
    echo -e "${GREEN}✅ Fichier .env.prod créé${NC}"
    set -a
    source .env.prod
    set +a
fi

# Vérification des variables d'environnement requises
required_vars=("DB_USERNAME" "DB_PASSWORD" "DB_DATABASE" "DB_HOST" "DB_PORT")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Variables d'environnement manquantes :${NC}"
    for var in "${missing_vars[@]}"; do
        echo -e "${RED}  - $var${NC}"
    done
    exit 1
fi

echo -e "${GREEN}✅ Variables d'environnement chargées avec succès${NC}"

# Vérification des prérequis
echo -e "\n📋 Vérification des prérequis..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Vérifier si Docker est en cours d'exécution
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas en cours d'exécution${NC}"
    
    # Essayer de démarrer Docker sur macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🔄 Tentative de démarrage de Docker..."
        open -a Docker
        sleep 10
        if ! docker info &> /dev/null; then
            echo -e "${RED}❌ Impossible de démarrer Docker${NC}"
            exit 1
        fi
    else
        exit 1
    fi
fi

echo -e "${GREEN}✅ Prérequis vérifiés${NC}"

# Test du build de production
echo -e "\n🏗️  Test du build de production..."
echo "🏗️  Build de l'image de production..."
docker-compose -f docker-compose.prod.yml build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi${NC}"
else
    echo -e "${RED}❌ Le build de production a échoué${NC}"
    exit 1
fi

# Test du démarrage de l'environnement de production
echo -e "\n🚀 Test du démarrage de l'environnement de production..."
echo "🚀 Démarrage de l'environnement de production..."
docker-compose -f docker-compose.prod.yml up -d
if [ $? -eq 0 ]; then
    echo "✅ Environnement de production démarré !"
    echo -e "${GREEN}✅ Démarrage réussi${NC}"
else
    echo -e "${RED}❌ Le démarrage de l'environnement de production a échoué${NC}"
    exit 1
fi

# Vérification des conteneurs
echo "🔍 Vérification des conteneurs..."
for i in {1..3}; do
    echo "Tentative $i/3 : Attente du démarrage des conteneurs..."
    sleep 5
    
    # Vérification de l'état des conteneurs
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        echo "✅ Les conteneurs sont en cours d'exécution"
        exit 0
    fi
done

echo "❌ Les conteneurs ne sont pas en cours d'exécution"
echo "État des conteneurs :"
docker-compose -f docker-compose.prod.yml ps
exit 1

# 5. Test de la base de données
echo "\n💾 Test de la connexion à la base de données..."
if ! docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres; then
    echo "${RED}❌ La base de données n'est pas accessible${NC}"
    exit 1
fi
echo "${GREEN}✅ Base de données accessible${NC}"

# 6. Test de l'API
echo "\n🌐 Test de l'API..."
sleep 2 # Attendre que l'API démarre
if ! curl -s http://localhost:4000/health > /dev/null; then
    echo "${RED}❌ L'API n'est pas accessible${NC}"
    exit 1
fi
echo "${GREEN}✅ API accessible${NC}"

# 7. Test des sauvegardes
echo "\n💾 Test des sauvegardes..."
if ! make backup; then
    echo "${RED}❌ La sauvegarde a échoué${NC}"
    exit 1
fi
echo "${GREEN}✅ Sauvegarde réussie${NC}"

# 8. Nettoyage
echo "\n🧹 Nettoyage..."
make stop
echo "${GREEN}✅ Nettoyage terminé${NC}"

echo "\n${GREEN}✅ Tous les tests sont passés avec succès !${NC}"
echo "L'environnement de production est prêt à être déployé sur votre VPS."

make prod-status 