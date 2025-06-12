#.PHONY : cibles ne sont pas des fichiers
#conflits avec des fichiers de même nom
# problèmes de cache avec make

.PHONY: help dev prod logs status stop clean backup restore restart db-restart app-restart db-logs prod-build prod-up test-prod prod-status


DOCKER_COMPOSE_LOCAL = docker-compose -f docker-compose.local.yml
DOCKER_COMPOSE_PROD = docker-compose --env-file .env.prod -f docker-compose.prod.yml
BACKUP_DIR = ./backups

# charger les variables environnement
load-env:
	@if [ -f .env.prod ]; then \
		echo "variables d'environnement depuis .env.prod..."; \
		set -a; \
		source .env.prod; \
		set +a; \
	else \
		echo "Fichier .env.prod non trouvé"; \
		exit 1; \
	fi


help:
	@echo " Commandes disponibles :"
	@echo "  make dev          - Démarre l'environnement de développement"
	@echo "  make prod         - Démarre l'environnement de production"
	@echo "  make logs         - Affiche les logs de tous les conteneurs"
	@echo "  make status       - Affiche l'état des conteneurs"
	@echo "  make stop         - Arrête tous les conteneurs"
	@echo "  make clean        - Nettoie les conteneurs et volumes"
	@echo "  make backup       - Crée une sauvegarde de la base de données"
	@echo "  make restore      - Restaure une sauvegarde"
	@echo "  make restart      - Redémarre tous les conteneurs"
	@echo "  make db-restart   - Redémarre uniquement la base de données"
	@echo "  make app-restart  - Redémarre uniquement l'application"
	@echo "  make db-logs      - Affiche les logs de la base de données"
	@echo "  make prod-build   - Build l'image de production"
	@echo "  make prod-up      - Démarre l'environnement de production"
	@echo "  make test-prod    - Exécute les tests de l'environnement de production"
	@echo "  make prod-status  - Affiche l'état des conteneurs de production"

dev:
	@echo "Démarrage de l'environnement de développement..."
	$(DOCKER_COMPOSE_LOCAL) up -d
	@echo "Environnement de développement démarré !"

prod: prod-build prod-up

prod-build: load-env
	@echo " Build de l'image de production..."
	$(DOCKER_COMPOSE_PROD) build

prod-up: load-env
	@echo "Démarrage de l'environnement de production..."
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "Environnement de production démarré !"

logs:
	@echo " Affichage des logs"
	$(DOCKER_COMPOSE_LOCAL) logs -f

db-logs:
	@echo " affichage des logs de la base de données."
	$(DOCKER_COMPOSE_LOCAL) logs -f postgres

status:
	@echo "État des conteneurs :"
	$(DOCKER_COMPOSE_LOCAL) ps

stop:
	@echo " Arrêt des conteneurs..."
	$(DOCKER_COMPOSE_LOCAL) down
	@echo " Conteneurs arrêtés !"

clean:
	@echo "🧹 Nettoyage des conteneurs et volumes..."
	$(DOCKER_COMPOSE_LOCAL) down -v
	@echo " Nettoyage terminé !"

backup:
	@echo " Création d'une sauvegarde..."
	@mkdir -p $(BACKUP_DIR)
	$(DOCKER_COMPOSE_LOCAL) exec postgres pg_dump -U postgres ecodeli_db > $(BACKUP_DIR)/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo " Sauvegarde créée !"

restore:
	@echo " Restauration de la dernière sauvegarde..."
	@ls -t $(BACKUP_DIR)/*.sql | head -n1 | xargs -I {} $(DOCKER_COMPOSE_LOCAL) exec -T postgres psql -U postgres ecodeli_db < {}
	@echo "Restauration terminée !"

restart:
	@echo " Redémarrage de tous les conteneurs..."
	$(DOCKER_COMPOSE_LOCAL) restart
	@echo " Redémarrage terminé !"

db-restart:
	@echo " Redémarrage de la base de données..."
	$(DOCKER_COMPOSE_LOCAL) restart postgres
	@echo " Redémarrage terminé !"

app-restart:
	@echo " Redémarrage de l'application..."
	$(DOCKER_COMPOSE_LOCAL) restart app
	@echo " Redémarrage terminé !"

test-prod:
	@echo " Exécution des tests de production..."
	@chmod +x scripts/test-prod.sh
	@./scripts/test-prod.sh

prod-status: load-env
	@echo " État des conteneurs de production :"
	@echo "----------------------------------------"
	$(DOCKER_COMPOSE_PROD) ps
	@echo "\n Logs des conteneurs :"
	@echo "----------------------------------------"
	@echo "Application :"
	$(DOCKER_COMPOSE_PROD) logs --tail=20 app
	@echo "\nBase de données :"
	$(DOCKER_COMPOSE_PROD) logs --tail=20 postgres 