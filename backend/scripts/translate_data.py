"""One-time batch translation of guide texts PT -> EN/ES. Run: python scripts/translate_data.py"""
import asyncio
import json
import os
import re
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402
from guide_data import load_all, collect_strings  # noqa: E402

OUT = ROOT / "data" / "translations.json"
LANGS = {"en": "English", "es": "Spanish (neutral Latin American)"}
BATCH_CHARS = 5000
SEM = asyncio.Semaphore(8)


def batches(strings):
    cur, size = [], 0
    for s in strings:
        if cur and size + len(s) > BATCH_CHARS:
            yield cur
            cur, size = [], 0
        cur.append(s)
        size += len(s)
    if cur:
        yield cur


async def translate_batch(batch, lang_name):
    payload = {str(i): s for i, s in enumerate(batch)}
    system = (f"You are a professional video game localizer. Translate Brazilian Portuguese RPG texts (anime crossover: Jujutsu Kaisen, "
              f"Naruto, Demon Slayer, Bleach, One Piece, Hellsing) into {lang_name}. Keep character names, Japanese technique names, "
              "numbers, emojis, symbols and formatting unchanged. Translate generic Portuguese words in names (e.g. 'Espada', 'Armadura', 'Técnica'). "
              "Return ONLY a valid JSON object with exactly the same keys, each mapped to its translation.")
    async with SEM:
        for attempt in range(3):
            try:
                chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=str(uuid.uuid4()), system_message=system).with_model("openai", "gpt-5.4-mini")
                raw = await chat.send_message(UserMessage(text=json.dumps(payload, ensure_ascii=False)))
                m = re.search(r"\{.*\}", raw, re.S)
                res = json.loads(m.group(0))
                return {batch[int(k)]: v for k, v in res.items() if k.isdigit() and int(k) < len(batch) and isinstance(v, str)}
            except Exception as e:  # noqa: BLE001
                print("retry", attempt, e, flush=True)
        return {}


async def main():
    data = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    strings = sorted(collect_strings(load_all()))
    for code, name in LANGS.items():
        done = data.setdefault(code, {})
        todo = [s for s in strings if s not in done]
        print(code, "todo", len(todo), flush=True)
        tasks = [translate_batch(b, name) for b in batches(todo)]
        for i, coro in enumerate(asyncio.as_completed(tasks)):
            done.update(await coro)
            OUT.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
            print(code, f"batch {i + 1}/{len(tasks)}", len(done), flush=True)


if __name__ == "__main__":
    asyncio.run(main())
