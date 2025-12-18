FROM node:18-bullseye

WORKDIR /app

# Installer MongoDB et les dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    && wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-org \
    && rm -rf /var/lib/apt/lists/*

# Créer le répertoire pour les données MongoDB
RUN mkdir -p /data/db

# Copier les fichiers du serveur
COPY server ./server

# Installer les dépendances du serveur
WORKDIR /app/server
RUN npm install --production

# Créer un script de démarrage
RUN echo '#!/bin/bash\n\
mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db\n\
echo "Attente du démarrage de MongoDB..."\n\
sleep 5\n\
node src/scripts/seed.js\n\
echo "Démarrage du serveur..."\n\
node server.js' > /app/start.sh && chmod +x /app/start.sh

# Exposer les ports
EXPOSE 9898 27017

# Définir les variables d'environnement
ENV MONGO_URI=mongodb://localhost:27017/tron
ENV PORT=9898

# Démarrer MongoDB et le serveur
CMD ["/bin/bash", "/app/start.sh"]
