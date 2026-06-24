"""
Gemini Service — Single structured API call that powers all 4 agents.
Tries multiple models in a fallback chain so quota on one model
doesn't break the whole app.

Model priority (all on free tier, separate quota buckets):
  1. gemini-2.0-flash         — fastest, newest
  2. gemini-1.5-flash         — very capable, separate quota
  3. gemini-1.5-flash-8b      — highest free-tier RPD (1500/day)
  4. gemini-1.5-pro           — separate quota bucket
"""
import os
import json
import re
import asyncio
from google import genai
from google.genai import types
from dotenv import load_dotenv
from services.tools import search_web

load_dotenv()

# Model fallback chain — tested and confirmed working with this key type
# gemini-2.0-flash variants are quota-exhausted; 2.5 models have separate buckets
MODEL_CHAIN = [
    "gemini-2.5-flash-lite",  # Fastest and has higher daily limits. Put first to avoid huge 429 delays.
    "gemini-2.5-flash",       
    "gemini-2.0-flash",       
]


def get_model_chain() -> list:
    """Return model list, putting the user's preferred model first."""
    preferred = os.getenv("GEMINI_MODEL", "")
    if preferred and preferred in MODEL_CHAIN:
        rest = [m for m in MODEL_CHAIN if m != preferred]
        return [preferred] + rest
    if preferred:
        return [preferred] + MODEL_CHAIN
    return MODEL_CHAIN



async def _call_model(client: genai.Client, model: str, prompt: str, use_tools: bool) -> dict:
    """Attempt a model call using an interactive chat with Tool Calling if enabled. Raises on any error."""
    tools_list = [search_web] if use_tools else []
    chat = client.chats.create(
        model=model,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=4096,
            tools=tools_list if tools_list else None
        )
    )
    # Send message; google-genai SDK automatically executes tools if needed
    response = chat.send_message(prompt)
    
    raw = response.text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


async def call_llm(prompt: str, use_tools: bool = False) -> dict:
    """
    Executes a generic LLM prompt and expects a JSON dict returned.
    Try each model in MODEL_CHAIN until one succeeds.
    """
    import os
    api_key = os.environ.get("GEMINI_API_KEY", "")

    if not api_key or api_key in ("demo", "your_gemini_api_key_here", ""):
        raise ValueError("No API key configured — add your Gemini key in Settings.")

    client = genai.Client(api_key=api_key)
    chain = get_model_chain()
    errors = []

    for model in chain:
        retries = 0
        while retries < 5:
            try:
                print(f"[GeminiService] Trying model: {model} (Attempt {retries + 1})")
                result = await _call_model(client, model, prompt, use_tools)
                print(f"[GeminiService] Success with model: {model}")
                return result

            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "503" in err_str or "UNAVAILABLE" in err_str:
                    print(f"[GeminiService] {model} hit rate limit/503. Sleeping 10s...")
                    await asyncio.sleep(10)
                    retries += 1
                    continue
                elif "NOT_FOUND" in err_str or "not found" in err_str.lower():
                    print(f"[GeminiService] {model} not found / unavailable, trying next...")
                    errors.append(f"{model}: {err_str[:80]}")
                    break # Skip to next model immediately
                elif "PERMISSION_DENIED" in err_str:
                    print(f"[GeminiService] {model} permission denied, trying next...")
                    errors.append(f"{model}: {err_str[:80]}")
                    break # Skip to next model immediately
                else:
                    print(f"[GeminiService] {model} error: {err_str[:120]}, trying next...")
                    errors.append(f"{model}: {err_str[:80]}")
                    break # Skip to next model immediately
        else:
            # If we exhausted all 3 retries for 429s
            errors.append(f"{model}: Exhausted retries after 429 Rate Limit")

    raise RuntimeError(
        f"All Gemini models failed. Tried: {chain}. "
        f"Last error: {errors[-1] if errors else 'unknown'}. "
        "Try a different model in Settings, or check your API key."
    )

