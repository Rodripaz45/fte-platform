FROM node:22-bookworm-slim

WORKDIR /app

# Dependencias nativas para chartjs-node-canvas (reportes PDF)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
