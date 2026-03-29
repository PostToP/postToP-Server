# PostTop Server

Backend service for PostTop. Provides REST APIs, WebSocket support, PostgreSQL access, and Swagger docs.

## Stack

- Node.js + TypeScript
- Express
- PostgreSQL + Kysely
- WebSocket (`ws`)
- Swagger (`/docs`)

## Requirements

- Node.js 20+
- PostgreSQL

## Environment Variables

Create a `.env` file in the project root.


- `DATABASE_URL` - PostgreSQL connection string
- `JWT_TOKEN` - JWT signing secret
- `AI_MODEL_URL` - Is-Music Classifier model endpoint
- `AI_MODEL_URL_NER` - NER model endpoint
- `AI_MODEL_URL_GENRE` - genre model endpoint
- `YT_API_KEY` - YouTube API key
- `LOG_LEVEL` - logger level (default: `debug`)

## Run

```bash
npm install
npm run dev
```

Server starts on `http://localhost:8000`.

## Scripts

- `npm run dev` - run in development with `ts-node` + `nodemon`
- `npm run build` - build TypeScript output to `dist`
- `npm run serve` - run compiled build from `dist`
- `npm run lint` - run Biome checks
- `npm run format` - format code with Biome
- `npm run kysely` - generate Kysely types

## Docker

```bash
docker build -t posttop-server .
docker run --env-file .env -p 8000:8000 posttop-server
```