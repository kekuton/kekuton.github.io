# kekuton.github.io

## Автосохранение на GitHub после каждого коммита

Чтобы каждый новый `git commit` автоматически пушился в GitHub:

1. Добавь `origin` (если еще не добавлен):

```bash
git remote add origin https://github.com/<user>/<repo>.git
```

2. Включи авто‑push hooks:

```bash
./scripts/setup-auto-push.sh
```

После этого локальный hook `.githooks/post-commit` будет выполнять `git push` после каждого коммита.

### Что делает hook

- Если `origin` не настроен — выводит предупреждение и ничего не ломает.
- Если для текущей ветки еще нет upstream — делает первый push как `git push -u origin <branch>`.
- Для всех следующих коммитов в этой ветке делает обычный `git push`.

### Важно

- Для работы нужен доступ к GitHub (SSH key или token).
- Hook работает локально в этом репозитории после запуска `./scripts/setup-auto-push.sh`.
