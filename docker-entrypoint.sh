#!/bin/sh
# Exécuté automatiquement au démarrage du conteneur backend (voir
# Dockerfile — CMD remplacé par ce script). Enchaîne : migrations,
# puis les 3 seeds (idempotents, donc sans risque à chaque redémarrage),
# puis lance enfin l'application elle-même.
set -e

echo "-> Execution des migrations..."
node_modules/.bin/typeorm migration:run -d dist/config/data-source.js

echo "-> Seed : compte Admin..."
node dist/seeds/create-admin.seed.js

echo "-> Seed : compte Encadrant..."
node dist/seeds/create-encadrant-user.seed.js

echo "-> Seed : compte Stagiaire..."
node dist/seeds/create-stagiaire-user.seed.js

echo "-> Demarrage de l'application..."
exec node dist/main