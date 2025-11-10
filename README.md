## Quick local dev (backend + frontend)

### Backend

cd terracotta/backend
npm install

# create Postgres DB and run migrations (or use docker-compose)

# run migrations (requires DATABASE_URL in .env)

cp .env.example .env

# edit .env if needed

npm run migrate
npm run create-admin
npm run dev

### Frontend

cd terracotta
npm install

# set REACT_APP_API_BASE in .env to http://localhost:4000/api

npm run dev

## Run everything with Docker Compose (recommended for consistent env)

# from project root

docker-compose up --build

# backend available at http://localhost:4000

# frontend available at http://localhost:3000
