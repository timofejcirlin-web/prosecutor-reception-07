# Structure

- `client/src/App.tsx` — корневой роут.
- `client/src/pages/Home.tsx` — экран игры и игровой state machine.
- `client/src/index.css` — визуальная система: кабинет, бумага, стол, печати и адаптивность.
- `client/src/assets` — не используется для крупных файлов; фон подключается через `/manus-storage/...`.
- `PLAN.md`, `ASSETS.md`, `MEMORY.md` — контекст пайплайна.

Gameplay state machine: `playing` → `feedback` → `playing`, либо `finished`. Решения — `prosecute` / `dismiss`; факты и правильные ответы задаются массивом дел.
