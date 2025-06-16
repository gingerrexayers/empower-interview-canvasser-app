ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.11.0

# ---- Builder Stage ----
FROM node:${NODE_VERSION} AS builder

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

# Copy the entire monorepo source code
COPY . .

# Install all server dependencies (including devDependencies for build)
RUN pnpm install --filter server

# Build the server application
RUN pnpm --filter server run build

# ---- Production Stage ----
FROM node:${NODE_VERSION} AS production

ARG PNPM_VERSION=10.11.0

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy dependency definition files from the builder stage
COPY --from=builder /usr/src/app/pnpm-lock.yaml .
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/packages/server/package.json .

# Install ONLY production dependencies
RUN pnpm install --prod

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/packages/server/dist ./dist

# Expose the port the server will listen on
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/main.js"]
