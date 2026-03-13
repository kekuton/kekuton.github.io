# Couples App v4 Monetized

Что внутри:
- базовые бесплатные категории
- вопрос дня
- premium подписка
- 3 дня trial
- разовые покупки паков: Hard Talk, 18+, Психология+
- premium AI-анализ
- premium share-card PNG
- premium архив вопросов
- свайпы как в Tinder

Запуск локально:

```bash
cd couples_app_v4_monetized
python -m http.server 8000
```

Открыть:

```text
http://localhost:8000
```

Важно:
Сейчас покупки работают как demo-логика через localStorage.
Для реальной монетизации в Telegram Mini App это место нужно связать с Telegram Payments или backend.
