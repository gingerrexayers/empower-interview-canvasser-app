# packages/client/Dockerfile

ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.11.0

# ---- Builder Stage ----
FROM node:${NODE_VERSION} AS builder

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

# 1. Copy only the dependency definition files first
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY packages/client/package.json ./packages/client/

# 2. Install dependencies for the client
# This layer will be cached as long as the lockfile doesn't change
RUN pnpm install --filter client

# 3. Copy the client package source code
COPY packages/client ./packages/client/

# 4. Build the client application
RUN pnpm --filter client run build

# ---- Production Stage ----
FROM nginx:stable-alpine AS production

# Copy the built static assets from the builder stage
COPY --from=builder /usr/src/app/packages/client/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]