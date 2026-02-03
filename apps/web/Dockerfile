FROM node:24-bullseye

WORKDIR /usr/src/app

# Install dependencies with caching; reuses layer unless lock changes
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source
COPY . .

RUN npm run build

EXPOSE 3000

# Default CMD is production start
CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p 3000"]
