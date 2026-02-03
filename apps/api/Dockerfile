FROM node:24-bullseye

WORKDIR /usr/src/app

# Install dependencies with caching; reuses layer unless lock changes
COPY package*.json ./
# Use npm install to avoid lockfile mismatch issues during Docker builds
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source
COPY . .

RUN npm run build

EXPOSE 5005

# Default CMD: run compiled Nest app
CMD ["node", "dist/src/main.js"]
