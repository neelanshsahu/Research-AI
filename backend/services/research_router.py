"""
Research Router — Single entry point that dispatches to either Gemini or OpenAI
based on the PROVIDER env var (set at runtime via /api/settings).

Usage in coordinator:
    from services.research_router import run_research
"""
import os
from services.gemini_service import call_llm as _gemini_call
from services.openai_service import call_llm as _openai_call

async def call_llm(prompt: str, use_tools: bool = False) -> dict:
    """
    Route the LLM call to Gemini or OpenAI depending on PROVIDER env var.
    Falls back to Gemini if PROVIDER is not set.
    """
    provider = os.getenv("PROVIDER", "gemini").lower().strip()
    # print(f"[ResearchRouter] Provider = {provider!r}")

    if provider == "openai":
        return await _openai_call(prompt, use_tools)
    else:
        return await _gemini_call(prompt, use_tools)
