# app.py — Qwen версия
from flask import Flask, request, jsonify
import requests
import os
import re
import time
from collections import defaultdict

app = Flask(__name__)

# Получаем API-ключ из переменной окружения
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")
QWEN_MODEL = "qwen-max"  # или "qwen-plus", "qwen-turbo" (см. ниже)

# Rate-limit
request_counts = defaultdict(list)
RATE_LIMIT = 5  # 5 запросов за 60 сек

def is_rate_limited(ip):
    now = time.time()
    request_counts[ip] = [t for t in request_counts[ip] if now - t < 60]
    if len(request_counts[ip]) >= RATE_LIMIT:
        return True
    request_counts[ip].append(now)
    return False

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)

    if is_rate_limited(client_ip):
        return jsonify({"error": "Слишком много запросов. Подождите 1 минуту."}), 429

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Требуется JSON"}), 400

        topic = data.get('topic', 'отношения')
        count = min(data.get('count', 1), 5)
        topic = re.sub(r'[^\w\sа-яА-ЯёЁ\-]', '', str(topic))[:50]

        prompt = f"""
Ты — дружелюбный и чуткий психолог, специализирующийся на парных отношениях.
Сгенерируй {count} глубоких, уважительных и открытых вопроса для пары на тему «{topic}».
Вопросы должны быть:
- На русском языке
- В виде прямого вопроса (заканчиваться знаком «?»)
- Без пояснений, нумерации и префиксов
- Эмоционально безопасными и поддерживающими

Каждый вопрос с новой строки.
        """.strip()

        # Запрос к Qwen API
        response = requests.post(
            "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
            headers={
                "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": QWEN_MODEL,
                "input": {
                    "messages": [
                        {"role": "user", "content": prompt}
                    ]
                },
                "parameters": {
                    "result_format": "message",
                    "max_tokens": 300,
                    "temperature": 0.85,
                    "top_p": 0.8
                }
            },
            timeout=15
        )

        if response.status_code != 200:
            error_msg = response.json().get("message", "Неизвестная ошибка Qwen")
            print(f"Ошибка Qwen: {response.status_code} - {error_msg}")
            raise Exception("Ошибка генерации")

        result = response.json()
        text = result["output"]["choices"][0]["message"]["content"].strip()

        # Обработка ответа
        questions = []
        for line in text.split('\n'):
            q = line.strip()
            if q and '?' in q and len(q) > 5:
                q = re.sub(r'^\s*\d+[\.\)\-]?\s*', '', q)
                questions.append(q)

        if not questions:
            questions = ["Что для тебя значит настоящая близость в отношениях?"]

        return jsonify({"questions": questions[:count]})

    except Exception as e:
        print("Ошибка сервера:", str(e))
        return jsonify({"questions": ["Расскажи партнёру о чём-то важном для тебя."]}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)