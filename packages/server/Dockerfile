ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.11.0

# ---- 1. Builder Stage ----
FROM node:${NODE_VERSION} AS builder

RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/

# First, install dependencies for the server.
RUN pnpm install --filter server

# Next, copy the server project source.
COPY packages/server ./packages/server/

# Run the build. This is needed for the production stage.
RUN pnpm --filter server run build


# ---- 2. Production Stage ----
FROM node:${NODE_VERSION} AS production

ARG PNPM_VERSION=10.11.0
RUN npm install -g pnpm@${PNPM_VERSION}
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apk add --no-cache curl
RUN addgroup -S node && adduser -S node -G node

# Copy only the necessary manifests for a production install.
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/

# Install ONLY production dependencies.
RUN pnpm install --filter server --prod

# Copy the compiled code from the builder stage.
COPY --from=builder /usr/src/app/packages/server/dist ./dist

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]