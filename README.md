# Вопросы для двоих — GitHub Pages

Готовая версия для деплоя на **GitHub Pages**.

## Быстрый запуск через GitHub

1. Создай новый репозиторий на GitHub.
2. Залей в него все файлы из этой папки.
3. Открой **Settings → Pages**.
4. В разделе **Build and deployment** выбери:
   - **Source**: `GitHub Actions`
5. Запушь изменения в ветку `main`.
6. GitHub сам соберёт и опубликует сайт.

После деплоя сайт будет доступен по адресу вида:

`https://USERNAME.github.io/REPO-NAME/`

## Важно

- Все пути уже сделаны относительными, поэтому сайт работает в подпапке GitHub Pages.
- `questions.json` загружается через `fetch`, поэтому локально проект тоже нужно открывать через сервер.
- Для локальной проверки:

```bash
python -m http.server 8000
```

Потом открой:

```text
http://localhost:8000
```

## Telegram Mini App

Если захочешь использовать тот же проект в Telegram Mini App, укажи в BotFather ссылку на опубликованный GitHub Pages сайт.
