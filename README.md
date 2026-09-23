# Wine Shop

A small full-stack web shop: a React single-page frontend and a Kotlin/Ktor REST backend,
with registration, JWT login and OAuth sign-in through Google and GitHub.

Originally built for an e-business course at Jagiellonian University and later extracted
into its own repository, cleaned up and covered with tests.

## Stack

- **Frontend:** React 19, React Router, Context API, plain CSS
- **Backend:** Kotlin, Ktor, JWT (auth0), BCrypt
- **Tests:** Cypress (end-to-end and API), React Testing Library
- **Infrastructure:** Docker, Docker Compose, GitHub Actions

Products and users are kept in memory, so the data resets whenever the backend restarts.

## Running it

Copy the example environment file and set a JWT secret:

```bash
cp backend/.env.example backend/.env
```

`JWT_SECRET` is required. The Google and GitHub credentials are optional - without them
everything works except OAuth sign-in.

### With Docker

```bash
docker compose up --build
```

The frontend is served on http://localhost:3000, the backend on http://localhost:8000.

### Without Docker

Requires JDK 21 and Node.js.

```bash
cd backend && ./gradlew run      # http://localhost:8000
cd frontend && npm install && npm start   # http://localhost:3000
```

## Tests

Both services have to be running first.

```bash
cd frontend
npm test              # React Testing Library
npm run cypress:open  # Cypress, interactive
npm run test:e2e      # Cypress, headless
```

## Deployment

`.github/workflows/docker.yml` documents how the project was deployed: both images were
built and pushed to Docker Hub, then pulled and started over SSH on two separate cloud VMs,
one for the frontend and one for the backend.

The workflow is kept for reference and is manual-trigger only — the VMs, the secrets and the
published images no longer exist.