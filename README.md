# Job Application Tracker

A full-stack job application tracker for saving job applications, searching by company or job title, filtering by status, viewing application details, and tracking status counts with a dashboard graph.

The app supports both REST and GraphQL APIs. The frontend uses REST by default, while the GraphQL endpoint is available for API clients.

## Tech Stack

- Frontend: React, TypeScript, Vite, CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Testing: Node.js built-in test runner
- Containerization: Docker, Docker Compose
- Deployment config: Render blueprint in `render.yaml`

## Prerequisites

- Node.js 22 or newer
- npm
- PostgreSQL, or Docker Desktop for the containerized setup
- Git

## Installation

Clone the project and install dependencies:

```bash
cd job-tracker
cd backend
npm install
cd ../frontend
npm install
```

Create environment files from the examples:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

On macOS/Linux, use:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Environment Variables

Backend variables:

```env
DATABASE_URL=postgres://job_tracker:job_tracker@localhost:5432/job_tracker
PORT=4000
```

Frontend variables:

```env
VITE_API_URL=http://localhost:4000
```

## Database Setup

The database schema is in:

```txt
backend/db/schema.sql
```

If you are running PostgreSQL locally, create a `job_tracker` database and run the SQL in `backend/db/schema.sql`.

If you are using Docker Compose, the schema is mounted into the Postgres container and runs when the database volume is first created.

## Run In Development Mode

Start the backend:

```bash
cd backend
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:4000/health`
- REST API: `http://localhost:4000/applications`
- GraphQL API: `http://localhost:4000/graphql`

## Run With Docker Compose

From the project root:

```bash
docker compose up --build
```

Docker URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

## Tests

Backend tests:

```bash
cd backend
npm test
```

Frontend typecheck:

```bash
cd frontend
npm run typecheck
```

Frontend production build:

```bash
cd frontend
npm run build
```

## API Docs

### REST

Base URL:

```txt
http://localhost:4000
```

Endpoints:

- `GET /health`
- `GET /applications?page=1&limit=5`
- `GET /applications?search=react`
- `GET /applications?status=Interviewing`
- `GET /applications/stats`
- `GET /applications/:id`
- `POST /applications`
- `PATCH /applications/:id`
- `DELETE /applications/:id`

Example create request:

```json
{
  "company_name": "Intern Sathi",
  "job_title": "Full Stack Developer",
  "job_type": "Full-time",
  "status": "Applied",
  "applied_date": "2026-06-18",
  "notes": "Scheduled the application"
}
```

### GraphQL

GraphQL endpoint:

```txt
http://localhost:4000/graphql
```

This project exposes a GraphQL-compatible JSON endpoint, but it does not include a built-in GraphQL Playground UI. You can test it with Postman, Insomnia, GraphQL clients, or `curl`.

Example query:

```graphql
query Applications($page: Int, $limit: Int) {
  applications(page: $page, limit: $limit) {
    data {
      id
      company_name
      job_title
      status
      notes
    }
    pagination {
      page
      limit
      totalCount
      totalPages
    }
  }
}
```

Example variables:

```json
{
  "page": 1,
  "limit": 5
}
```

## Screenshots / Demo

Add screenshots or a short demo video here before submission.

Suggested screenshots:

- Dashboard graph
- Application table with notes
- Add application popup
- Application details popup

Suggested paths:

```txt
docs/screenshots/dashboard.png
docs/screenshots/application-form.png
docs/screenshots/application-details.png
```

## Deployment

A Render blueprint is included:

```txt
render.yaml
```

It defines:

- Backend web service
- Frontend web service
- PostgreSQL database

Update the frontend `VITE_API_URL` build arg in `render.yaml` to match your deployed backend URL.

## About the Developer

Built by: Looneva Maharjan
GitHub: https://github.com/LoonevaMaharjan