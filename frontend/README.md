# Financial Work frontend

React 19, Next.js 16 App Router, TypeScript и Tailwind CSS 4.

```sh
npm ci
npm run dev
```

Открыть http://localhost:4173. API по умолчанию проксируется на
http://localhost:8000. Для другого сервера задайте `API_PROXY_URL` в `.env.local`
и перезапустите Next.js. URL применяется при сборке production-версии.
Бот задаётся через `NEXT_PUBLIC_TELEGRAM_BOT`; Telegram требует HTTPS и разрешённый домен.

```sh
npm run typecheck
npm test
npm run build
npm start
```

Браузерные проверки: `npm run test:e2e` при запущенном frontend.
При первом запуске установите браузер: `npx playwright install chromium`.
Тесты подменяют API только внутри браузерной сессии; реальные операции не выполняются.

Node.js 24+ (включая встроенное выполнение TypeScript в unit-проверках).

## Feature-Sliced Design

- `app/` — тонкие маршруты, layout, metadata, глобальные стили Next.js.
- `src/views/` — слой страниц FSD; назван views, чтобы Next.js не создавал Pages Router.
- `src/widgets/` — оболочка приложения, история операций, карточка стратегии.
- `src/features/` — авторизация, Telegram, операции со счётом и паями.
- `src/entities/` — типы и API пользователей, стратегий, аналитики, платежей и расчётов.
- `src/shared/` — HTTP, форматирование, загрузка данных, UI-примитивы и графики.

Импорты направлены вниз по слоям через публичный `index.ts(x)` среза.
`shared/ui/chart` принимает нейтральные точки данных, без бизнес-логики.
Пароли не сохраняются в браузере; сессия проверяется сервером через `/users/me/`.
Доступ к админским операциям проверяет backend. Клиентское имя/email не даёт прав.
Старая ссылка `main.html#/dashboard` переводит на актуальный маршрут.

Дизайн и происхождение решений: [DESIGN.md](../DESIGN.md).
