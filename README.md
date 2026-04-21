# ft_transcendence

A 42 school project

## Prerequisites

- Docker
- pnpm

## Getting Started

Run the development server:

```bash
pnpm install # run this at root of git directory to install dependecies
pnpm run dev
```

Note: this does not start a database

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To run it in production, create a `.env` file from `.env.example` and the run

```bash
make run
```

### make scripts

- `make run` - start everything with building images freshly
- `make down` - stop
- `make reset` - stop and reset everything inlcuding volumes

### pnpm scripts

- `pnpm run dev` - run development server with hot reload
- `pnpm run dev:db` - dev server with db
- `pnpm run build` - build
- `pnpm run start` - run the project after `pnpm build`
- `pnpm run lint` - check eslint
- `pnpm run format:check` - check the fromatting without writing
- `pnpm run format` - format all files with writing and saving

## Modules

| Modul                         | Points |
| ----------------------------- | ------ |
| Full Stack Framework          | 2      |
| real-time feature (websocket) | 2      |
| ORM                           | 1      |
| additional Browsers           | 1      |
| game statistics & history     | 1      |
| OAth 2.0 (42 intra)           | 1      |
| 2FA                           | 1      |
| Complete Web based Game       | 2      |
| Remote players                | 2      |
| Multiplayer                   | 2      |
| TOTAL                         | 15     |

## Project Structure

- **nextjs/** - Next.js frontend and backend API
  - **nextjs/src/app/** - file-system based App Router
  - **nextjs/public/** - static assets
- **game-server/** - Real-time game server using Socket.IO
- **tests/** - [playwright tests](#tests)

## The Stack

- **[Next.js](https://nextjs.org/docs)** - React framework for frontend and backend
- **Docker** - Containerization
- **TypeScript** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/docs/installation)** - Styling
- **Socket.IO** - Real-time bidirectional communication for game logic

## Tests

There are end-to-end tests with playwright in `./tests/`:

- `pnpm --filter tests exec playwright install` to install playwright
- `pnpm test` to execute them
- `pnpm test:ui` to see what the tests are doing

It will be much apreciated if you write tests for everything you implement!
