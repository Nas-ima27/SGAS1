# --- Étape 1 : build ---
# Compile le TypeScript en JavaScript (dist/), avec toutes les
# dépendances (dev incluses, nécessaires pour la compilation).
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Étape 2 : production ---
# Image finale allégée : seulement les dépendances de production
# et le code déjà compilé (dist/) — pas le code source TypeScript
# ni les devDependencies, pour une image plus légère et plus sûre.
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]