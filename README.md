# Прокуратура · Приёмная № 07

Браузерная игра на React, TypeScript и Vite.

## Локальный запуск

Требуется Node.js и pnpm 10.4.1 (проект использует Corepack).

```powershell
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Откройте адрес, который Vite выведет в терминале (обычно http://localhost:3000).

## Production-сборка

```powershell
pnpm build
pnpm preview
```

Готовый статический сайт находится в `dist/public`.

## Публикация на Vercel

В репозитории есть `vercel.json` с настройками:
- команда сборки: `pnpm build`;
- каталог публикации: `dist/public`;
- SPA-переадресация всех маршрутов на `index.html`.

Импортируйте репозиторий `timofejcirlin-web/prosecutor-reception-07` в Vercel. После подключения GitHub новые коммиты в `main` будут автоматически запускать сборку и публикацию.

## Ресурсы

Все изображения, фоны, музыка и звуковые эффекты игры находятся в `client/public/manus-storage` и доступны по адресу `/manus-storage/...`. Проект больше не требует Manus Storage Proxy для этих файлов.

## Основные файлы

- `client/src/pages/Home.tsx` — игровой процесс и состояние игры;
- `client/src/index.css` — стили и адаптивная компоновка;
- `client/public/manus-storage` — медиафайлы;
- `vite.config.ts` — конфигурация Vite;
- `vercel.json` — настройки статического деплоя.
