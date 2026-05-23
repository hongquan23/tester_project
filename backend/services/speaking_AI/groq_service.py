from groq import Groq
import os
from core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

MODEL = "llama-3.1-8b-instant"

def send_message(prompt: str) -> str:
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return completion.choices[0].message.content
