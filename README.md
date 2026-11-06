# financialwork

**Live demo:** https://finwork.prooood.ru. It runs on a home server and redeploys itself on every push to `main` ([how deploys work](deploy/home/README.md)).

## Local setup with Nginx and HTTPS

1. Generate a self‑signed certificate:

```bash
./nginx/generate-self-signed.sh
```

2. Start the services:

```bash
docker compose up --build
```

Nginx will expose HTTPS on port 443 and proxy requests to the frontend and backend containers. You can use tools like `ngrok` on port 443 to expose the application publicly.

The Telegram login widget requires HTTPS, so using this setup allows it to work correctly with a self-signed certificate during development.

## Frontend

Frontend перенесён на Next.js App Router, React, Tailwind CSS и FSD.

```sh
npm ci
npm --prefix frontend ci
npm run dev
```

Открыть http://localhost:4173. Backend ожидается на http://localhost:8000.
Архитектура, конфигурация API и проверки: [frontend/README.md](frontend/README.md).
Визуальная система: [DESIGN.md](DESIGN.md).
