# Empower Canvasser App

[![Tech: NestJS](https://img.shields.io/badge/Backend-NestJS-ea2845?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Tech: React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tech: Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Built with: pnpm](https://img.shields.io/badge/Built%20with-pnpm-f69220?style=flat-square&logo=pnpm)](https://pnpm.io/)

Empower Canvasser App is a full-stack monorepo application designed to help political canvassers manage and track their list of voters. It features a modern, responsive frontend built with React and a robust, scalable backend powered by NestJS.

## ✨ Features

- **Full-Stack Application:** Monorepo architecture using `pnpm` workspaces for clean separation of client and server code.
- **User Authentication:** Secure registration and login for canvassers using JWT.
- **Voter Management:**
  - Create new voters.
  - View a list of all assigned voters.
  - Search voters by name or notes in real-time.
  - Edit voter notes inline.
- **Data Export:** Export the voter list to a CSV file.
- **Modern UI/UX:**
  - Built with React, Vite, and TypeScript.
  - Styled with Tailwind CSS and shadcn/ui components.
  - Responsive design for both desktop and mobile use.
- **Scalable Backend:**
  - Built with NestJS and TypeScript.
  - Uses TypeORM with a MySQL database.
  - Includes a database migration system for schema management.
- **Containerized:** Fully containerized with Docker and Docker Compose for consistent development and production environments.

## 🛠️ Tech Stack

| Category           | Technology                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Frontend**       | [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)                |
| **UI Components**  | [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), [Sonner](https://sonner.emilkowal.ski/) |
| **Data Fetching**  | [TanStack Query](https://tanstack.com/query/latest)                                                                    |
| **Forms**          | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)                                               |
| **Routing**        | [React Router](https://reactrouter.com/)                                                                               |
| **Backend**        | [NestJS](https://nestjs.com/)                                                                                          |
| **Database**       | [MySQL](https://www.mysql.com/), [TypeORM](https://typeorm.io/)                                                        |
| **Authentication** | [@nestjs/jwt](https://github.com/nestjs/jwt)                                                                           |
| **Testing**        | [Jest](https://jestjs.io/), [Cypress](https://www.cypress.io/)                                                          |
| **DevOps**         | [Docker](https://www.docker.com/), [Nginx](https://www.nginx.com/), [Railway](https://railway.app/)                    |
| **Tooling**        | [pnpm](https://pnpm.io/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)                              |

## 📂 Project Structure

This project is a monorepo managed with `pnpm` workspaces.

```
/
├── packages/
│   ├── client/       # React (Vite) Frontend
│   └── server/       # NestJS Backend
├── docker-compose.yaml # Production Docker services
├── docker-compose.dev.yaml # Development Docker services
├── start.sh        # Helper script for development
└── package.json    # Root package.json
```

## 🚀 Getting Started

Follow these instructions to get the application running locally for development.

### Prerequisites

Make sure you have the following tools installed on your system:

- **Node.js**: `v22.x` or later
- **pnpm**: `v10.x` or later
- **Docker** and **Docker Compose**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) is recommended.

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd empower-interview-canvasser-app
    ```

2.  **Install dependencies from the root directory:**
    This command will install dependencies for all workspaces (`client` and `server`).

    ```bash
    pnpm install
    ```

3.  **Start the development environment:**
    This script will start the server, client, and database containers using `docker-compose`. The client and server will be running in development mode with hot-reloading enabled.

    ```bash
    ./start.sh
    ```

    - **Backend API** will be available at `http://localhost:3001`
    - **Frontend App** will be available at `http://localhost:3005`
    - **MySQL Database** will be available on port `3306`

4.  **Run Database Migrations:**
    Once the containers are running, open a new terminal window and run the database migrations. This command executes the TypeORM CLI inside the running `server` container to set up the database schema.
    ```bash
    docker-compose exec server pnpm --filter server run migration:run
    ```

You should now be able to access the application at `http://localhost:3005`, register a new user, and start using the app!

## 🧪 Running Tests

This project includes unit tests for the server and end-to-end (E2E) tests for the client application.

### Server Unit Tests

Unit tests for the NestJS server are located in the `packages/server` directory and use Jest.

To run the server tests:

```bash
pnpm --filter server run test
```

### Client End-to-End Tests

The client application uses Cypress for end-to-end testing to simulate real user scenarios.

**To run the E2E tests, you must have the development environment running in a separate terminal:**

```bash
# In terminal 1: Start the application
./start.sh
```

**Then, in a second terminal, you can run Cypress:**

- **Interactive Mode (Recommended for development):**
  Opens the Cypress Test Runner UI where you can watch tests run in real-time.
  ```bash
  # From the project root
  pnpm --filter client run cy:open
  ```
- **Headless Mode (For CI/automation):**
  Runs all tests in the terminal without launching a browser UI.
  ```bash
  # From the project root
  pnpm --filter client run cy:run
  ```

## 📜 Available Scripts

### Root Workspace

- `pnpm build:server`: Builds the production-ready server application.
- `pnpm start:server`: Starts the production server from the `dist` folder.
- `pnpm build:client`: Builds the production-ready client application.
- `pnpm serve:client`: Serves the built client application for preview.

### Server Workspace (`packages/server`)

To run these scripts, you can either `cd packages/server` or use the `pnpm --filter` command from the root (e.g., `pnpm --filter server run lint`).

- `pnpm run build`: Compiles the TypeScript source to JavaScript.
- `pnpm run format`: Formats the code using Prettier.
- `pnpm run start`: Starts the application.
- `pnpm run start:dev`: Starts the application in watch mode (hot-reloading).
- `pnpm run start:prod`: Starts the production build of the application.
- `pnpm run lint`: Lints the codebase.
- `pnpm run test`: Runs unit tests.
- `pnpm run migration:generate <path/to/migrationName>`: Generates a new migration file.
- `pnpm run migration:run`: Applies all pending migrations.
- `pnpm run migration:revert`: Reverts the last applied migration.

### Client Workspace (`packages/client`)

- `pnpm run dev`: Starts the Vite development server.
- `pnpm run build`: Builds the client application for production.
- `pnpm run lint`: Lints the codebase.
- `pnpm run preview`: Previews the production build locally.

## 📦 Production

To build and run the application in a production-like environment, use the main `docker-compose.yaml` file.

1.  **Build the production Docker images:**

    ```bash
    docker-compose -f docker-compose.yaml build
    ```

2.  **Run the production containers:**
    ```bash
    docker-compose -f docker-compose.yaml up -d
    ```
    The application will be available at `http://localhost:3005`.

## 📖 API Endpoints

The backend server provides the following RESTful API endpoints. All routes under `/voters` are protected and require a valid JWT `Bearer` token.

| Method  | Endpoint              | Description                                     |
| ------- | --------------------- | ----------------------------------------------- |
| `GET`   | `/health`             | Health check for the service and DB connection. |
| `POST`  | `/auth/register`      | Register a new canvasser account.               |
| `POST`  | `/auth/login`         | Log in and receive a JWT token.                 |
| `GET`   | `/voters`             | Get all voters for the authenticated user.      |
| `GET`   | `/voters?search=term` | Search voters by name or notes.                 |
| `POST`  | `/voters`             | Create a new voter.                             |
| `PATCH` | `/voters/:id`         | Update a voter's details (e.g., notes).         |
| `GET`   | `/voters/export/csv`  | Export all of the user's voters to a CSV file.  |

## 🤖 AI Tools Used

This project was developed with the assistance of the following AI tools:

- Windsurf Cascade (Gemini 2.5 Pro)
- Google AI Studio (Gemini 2.5 Pro Preview)
