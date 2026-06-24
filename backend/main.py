"""FastAPI main application — AI Multi-Agent Research Assistant"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from typing import Optional
from models.schemas import ResearchRequest, TaskResponse
from agents.coordinator import create_task, stream_research, tasks
from services.comparison_service import run_comparison

app = FastAPI(
    title="AI Multi-Agent Research Assistant",
    description="A FastAPI backend that orchestrates a multi-agent AI research pipeline.",
    version="2.0.0",
)

# In-memory runtime settings (overrides .env without restart)
_runtime_settings: dict = {}

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic models for settings ──────────────────────────────────────────────
class SettingsRequest(BaseModel):
    provider:      Optional[str] = None   # "gemini" | "openai"
    api_key:       Optional[str] = None   # Gemini key
    model:         Optional[str] = None   # Gemini model
    openai_api_key: Optional[str] = None  # OpenAI key
    openai_model:  Optional[str] = None   # OpenAI model


class CompareRequest(BaseModel):
    topic_a:  str
    topic_b:  str
    report_a: dict
    report_b: dict   # OpenAI model


# ── Utility: resolve effective setting (runtime > env) ────────────────────────
def get_setting(key: str, env_key: str, default: str = "") -> str:
    return _runtime_settings.get(key) or os.getenv(env_key, default)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "AI Multi-Agent Research Assistant API", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/config")
async def config():
    """Returns runtime config visible to the frontend (no secrets)."""
    demo = os.getenv("DEMO_MODE", "false").lower() == "true"
    provider     = get_setting("provider", "PROVIDER", "gemini")
    api_key      = get_setting("api_key", "GEMINI_API_KEY")
    active_model = get_setting("model", "GEMINI_MODEL", "gemini-2.5-flash")
    openai_key   = get_setting("openai_api_key", "OPENAI_API_KEY")
    openai_model = get_setting("openai_model", "OPENAI_MODEL", "gpt-4o-mini")
    return {
        "demo_mode":         demo,
        "provider":          provider,
        "api_key_set":       bool(api_key),
        "active_model":      active_model,
        "openai_key_set":    bool(openai_key),
        "openai_model":      openai_model,
    }


@app.post("/api/settings")
async def update_settings(request: SettingsRequest):
    """Update runtime settings without restarting the server."""
    if request.provider is not None:
        _runtime_settings["provider"] = request.provider
        os.environ["PROVIDER"] = request.provider

    if request.api_key is not None:
        pass # Ignored: always use .env key as requested by user
        # _runtime_settings["api_key"] = request.api_key
        # os.environ["GEMINI_API_KEY"] = request.api_key

    if request.model is not None:
        _runtime_settings["model"] = request.model
        os.environ["GEMINI_MODEL"] = request.model

    if request.openai_api_key is not None:
        _runtime_settings["openai_api_key"] = request.openai_api_key
        os.environ["OPENAI_API_KEY"] = request.openai_api_key

    if request.openai_model is not None:
        _runtime_settings["openai_model"] = request.openai_model
        os.environ["OPENAI_MODEL"] = request.openai_model

    return {"status": "ok", "message": "Settings updated successfully."}


@app.post("/api/settings/test")
async def test_settings(request: SettingsRequest):
    """Test API key + model combination. Works for both Gemini and OpenAI."""
    provider = request.provider or get_setting("provider", "PROVIDER", "gemini")

    if provider == "openai":
        # ── Test OpenAI ──
        from openai import AsyncOpenAI
        api_key = request.openai_api_key or get_setting("openai_api_key", "OPENAI_API_KEY")
        model   = request.openai_model or get_setting("openai_model", "OPENAI_MODEL", "gpt-4o-mini")

        if not api_key:
            return {"success": False, "error": "No OpenAI API key provided."}

        try:
            client = AsyncOpenAI(api_key=api_key)
            resp = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Reply with exactly one word: OK"}],
                max_tokens=10,
            )
            return {"success": True, "model": model, "response": resp.choices[0].message.content.strip()}
        except Exception as e:
            err = str(e)
            if "401" in err or "invalid_api_key" in err.lower():
                return {"success": False, "error": "Invalid OpenAI API key. Check your key at platform.openai.com"}
            if "429" in err or "rate_limit" in err.lower():
                return {"success": False, "error": f"Rate limit hit for {model}. Try again in a moment."}
            if "model_not_found" in err.lower() or "does not exist" in err.lower():
                return {"success": False, "error": f"Model '{model}' not found or not accessible with this key."}
            return {"success": False, "error": err[:200]}

    else:
        # ── Test Gemini ──
        from google import genai
        from google.genai import types

        from dotenv import dotenv_values
        env_dict = dotenv_values(".env")
        api_key = env_dict.get("GEMINI_API_KEY", "")
        model   = request.model or get_setting("model", "GEMINI_MODEL", "gemini-2.5-flash")

        if not api_key:
            return {"success": False, "error": "No Gemini API key provided."}

        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=model,
                contents="Reply with exactly one word: OK",
                config=types.GenerateContentConfig(max_output_tokens=10),
            )
            return {"success": True, "model": model, "response": response.text.strip()}
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                return {"success": False, "error": f"Quota exhausted for {model}. Try a different model or wait 24h."}
            if "401" in err or "403" in err or "API_KEY_INVALID" in err:
                return {"success": False, "error": "Invalid API key. Please check and try again."}
            return {"success": False, "error": err[:200]}


@app.post("/api/research/start", response_model=TaskResponse)
async def start_research(request: ResearchRequest):
    """Create a new research task and return its task_id."""
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    topic = request.topic.strip()
    task_id = create_task(topic)
    return TaskResponse(task_id=task_id, topic=topic, status="pending")


@app.get("/api/research/stream/{task_id}")
async def research_stream(task_id: str):
    """SSE endpoint — streams agent progress events to the frontend."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found.")
    return EventSourceResponse(stream_research(task_id))


@app.post("/api/research/compare")
async def compare_research(request: CompareRequest):
    """AI-powered comparison of two research reports."""
    if not request.topic_a.strip() or not request.topic_b.strip():
        raise HTTPException(status_code=400, detail="Both topics are required.")
    try:
        result = await run_comparison(
            request.topic_a, request.topic_b,
            request.report_a, request.report_b,
        )
        return {"success": True, "comparison": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/research/status/{task_id}")
async def research_status(task_id: str):
    """Polling fallback — returns current task status and result."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found.")
    task = tasks[task_id]
    return {
        "task_id": task_id,
        "status": task["status"],
        "result": task.get("result"),
        "error": task.get("error"),
    }
