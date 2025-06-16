ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.11.0

# ---- Builder Stage ----
FROM node:${NODE_VERSION} AS builder

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

# Copy workspace files
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .

# Copy package-specific files needed for install
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/

# Install all client dependencies
RUN pnpm install --filter client

# Copy the entire monorepo source code
COPY . .

# Build the client application
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
