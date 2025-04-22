# Stage 1: Generate package-lock.json if it doesn't exist
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json if exists
COPY package.json ./
#COPY package-lock.json .  # Optional: only if it already exists

# Generate or update package-lock.json with legacy-peer-deps to avoid peer conflict
RUN npm install --package-lock-only --legacy-peer-deps

# Stage 2: Install dependencies and build the app
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/package.json /app/package-lock.json ./

# Install dependencies with legacy-peer-deps to avoid ERESOLVE errors
RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]

