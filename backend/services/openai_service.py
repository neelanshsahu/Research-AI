"""
OpenAI Service — Same interface as gemini_service.
Uses the openai Python SDK v1+ (responses API).
Structured JSON output via response_format for reliable parsing.
"""
import os
import json
import re
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_MODEL_CHAIN = [
    "gpt-4o-mini",   # cheapest, very capable
    "gpt-4o",        # more powerful if mini fails
    "gpt-3.5-turbo", # legacy fallback
]


async def call_llm(prompt: str, use_tools: bool = False) -> dict:
    """
    Executes a generic LLM prompt via OpenAI. Expects JSON back.
    Uses a tolerant parsing strategy: ask the model to return JSON but accept
    plain-text responses and attempt to extract JSON by stripping code fences.
    This avoids strict SDK validation errors like "The string did not match the expected pattern.".
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key in ("", "your_openai_api_key_here"):
        raise ValueError("No OpenAI API key configured. Set OPENAI_API_KEY in .env or via Settings.")

    preferred = os.getenv("OPENAI_MODEL", "")
    chain = ([preferred] + [m for m in OPENAI_MODEL_CHAIN if m != preferred]) if preferred else OPENAI_MODEL_CHAIN

    client = AsyncOpenAI(api_key=api_key)
    last_error = None

    for model in chain:
        try:
            print(f"[OpenAIService] Trying model: {model}")
            # Do not use strict response_format — request plain text and parse it ourselves.
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert AI research assistant. Always output purely valid JSON data, matching the schema requested by the user. Do not use markdown blocks."},
                    {"role": "user",   "content": prompt},
                ],
                temperature=0.7,
                max_tokens=4096,
            )

            raw = response.choices[0].message.content.strip()
            # Strip surrounding markdown code fences if present
            raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
            raw = re.sub(r"\s*```$", "", raw)

            try:
                result = json.loads(raw)
                print(f"[OpenAIService] Success with model: {model}")
                return result
            except json.JSONDecodeError:
                # Include a short preview of the model output to aid debugging
                preview = raw[:500].replace('\n', ' ')
                raise RuntimeError(f"OpenAI model returned invalid JSON. Preview: {preview}")

        except Exception as e:
            err_str = str(e)
            # Rate limit or quota — try next model
            if "429" in err_str or "rate_limit" in err_str.lower() or "quota" in err_str.lower():
                print(f"[OpenAIService] {model} rate-limited, trying next...")
                last_error = e
                await asyncio.sleep(1)
                continue
            # Model doesn't exist — try next
            if "model_not_found" in err_str.lower() or "does not exist" in err_str.lower():
                print(f"[OpenAIService] {model} not found, trying next...")
                last_error = e
                continue
            # Any other error — raise immediately so coordinator can surface it
            raise

    raise RuntimeError(
        f"All OpenAI models are unavailable: {chain}. "
        f"Last error: {last_error}"
    )
