"""
Comparison Service — Takes two completed research reports and uses AI to
generate a structured differences analysis between them.
Routes to Gemini or OpenAI based on the PROVIDER env var (same as research_router).
"""
import os
import json
import re
import asyncio
from dotenv import load_dotenv

load_dotenv()

COMPARE_PROMPT = """\
You are an expert comparative analyst. Two research topics have been investigated:

TOPIC A: "{topic_a}"
TOPIC B: "{topic_b}"

REPORT A SUMMARY: {summary_a}
REPORT A KEY FINDINGS: {findings_a}
REPORT A CONCLUSION: {conclusion_a}

REPORT B SUMMARY: {summary_b}
REPORT B KEY FINDINGS: {findings_b}
REPORT B CONCLUSION: {conclusion_b}

Produce a deep, intelligent comparison. Respond ONLY with valid JSON (no markdown):

{{
  "similarities": [
    "What both topics share in common #1",
    "What both topics share in common #2",
    "What both topics share in common #3"
  ],
  "key_differences": [
    {{
      "dimension": "Short label (e.g. Scale, Approach, Impact, Timeline)",
      "topic_a": "How Topic A differs on this dimension",
      "topic_b": "How Topic B differs on this dimension"
    }},
    {{
      "dimension": "Second dimension",
      "topic_a": "Topic A on this",
      "topic_b": "Topic B on this"
    }},
    {{
      "dimension": "Third dimension",
      "topic_a": "Topic A on this",
      "topic_b": "Topic B on this"
    }},
    {{
      "dimension": "Fourth dimension",
      "topic_a": "Topic A on this",
      "topic_b": "Topic B on this"
    }}
  ],
  "topic_a_strengths": [
    "Where Topic A clearly excels or is stronger #1",
    "Where Topic A clearly excels or is stronger #2"
  ],
  "topic_b_strengths": [
    "Where Topic B clearly excels or is stronger #1",
    "Where Topic B clearly excels or is stronger #2"
  ],
  "verdict": "A concise 2-3 sentence synthesis comparing the two topics — what each is best suited for, and the key takeaway from comparing them."
}}

Be specific and analytical. No generic filler. Ground your comparison in the actual content provided.
"""


async def _call_gemini_compare(prompt: str) -> dict:
    from google import genai
    from google.genai import types

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("No Gemini API key set.")

    # Build model chain with preferred model first, deduplicated
    preferred = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    raw_chain = [preferred, "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]
    seen = set()
    chain = []
    for m in raw_chain:
        if m not in seen:
            seen.add(m)
            chain.append(m)

    client = genai.Client(api_key=api_key)
    errors = []
    for model in chain:
        try:
            print(f"[CompareService] Trying model: {model}")
            resp = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.5, max_output_tokens=2048),
            )
            raw = resp.text.strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            print(f"[CompareService] Success with model: {model}")
            return json.loads(raw)
        except Exception as e:
            print(f"[CompareService] {model} failed: {str(e)[:100]}, trying next...")
            errors.append(f"{model}: {str(e)[:80]}")
            await asyncio.sleep(0.5)
            continue
    raise RuntimeError(f"All Gemini models failed for comparison. Last error: {errors[-1] if errors else 'unknown'}")


async def _call_openai_compare(prompt: str) -> dict:
    from openai import AsyncOpenAI

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise ValueError("No OpenAI API key set.")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = AsyncOpenAI(api_key=api_key)
    resp = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a comparative analyst. Output valid JSON only."},
            {"role": "user",   "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.5,
        max_tokens=2048,
    )
    return json.loads(resp.choices[0].message.content)


async def run_comparison(topic_a: str, topic_b: str, report_a: dict, report_b: dict) -> dict:
    """Generate an AI-powered comparison between two research reports."""

    def extract(report: dict):
        return {
            "summary": report.get("summary", {}).get("executive_summary", "N/A"),
            "findings": "; ".join(report.get("research", {}).get("key_information", [])[:3]),
            "conclusion": report.get("report", {}).get("conclusion", "N/A"),
        }

    a = extract(report_a)
    b = extract(report_b)

    prompt = COMPARE_PROMPT.format(
        topic_a=topic_a, topic_b=topic_b,
        summary_a=a["summary"],   findings_a=a["findings"],   conclusion_a=a["conclusion"],
        summary_b=b["summary"],   findings_b=b["findings"],   conclusion_b=b["conclusion"],
    )

    provider = os.getenv("PROVIDER", "gemini").lower()
    if provider == "openai":
        return await _call_openai_compare(prompt)
    else:
        return await _call_gemini_compare(prompt)
