# ⚡ SkinRadar — CS2 Skin Price Comparator

Telegram Mini App для сравнения цен на скины CS2 между площадками.

## Площадки
- Skinport (реальный API)
- Waxpeer (реальный API)
- Steam Market (реальный API)
- DMarket (расчётные цены)
- CS.Money (расчётные цены)

## Запуск локально

\`\`\`bash
npm install
npm run dev
\`\`\`

## Деплой на Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

После деплоя вставь URL в BotFather → Menu Button → URL

## Структура

\`\`\`
skinradar/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
└── src/
    ├── main.jsx
    └── App.jsx
\`\`\`

## Следующие шаги
- [ ] Подключить DMarket API (нужен ключ)
- [ ] Telegram алерты через бота
- [ ] История цен (графики)
- [ ] Авторизация через Telegram
