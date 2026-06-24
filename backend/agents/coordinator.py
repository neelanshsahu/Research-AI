"""
Coordinator — Orchestrates the 4-agent pipeline and streams SSE events.
Calls Gemini once, then emits events per agent with staged delays to
create the visual multi-agent execution effect.

Compatible with sse-starlette 3.x (yields dicts, not raw strings).
"""
import asyncio
import json
import uuid
from typing import AsyncGenerator

from agents.research_agent import ResearchAgent
from agents.fact_check_agent import FactCheckAgent
from agents.summary_agent import SummaryAgent
from agents.report_agent import ReportAgent

# In-memory task store
tasks: dict = {}

AGENT_SEQUENCE = [
    ("research",   "Research Agent",    "Extracting key information and data points..."),
    ("fact_check", "Fact Check Agent",  "Validating findings and cross-referencing sources..."),
    ("summary",    "Summary Agent",     "Synthesizing concise insights from verified data..."),
    ("report",     "Report Agent",      "Compiling executive report and recommendations..."),
]

def create_task(topic: str) -> str:
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "topic": topic,
        "status": "pending",
        "result": None,
        "error": None,
    }
    return task_id


def _event(event_name: str, data: dict) -> dict:
    """Return a dict compatible with sse-starlette 3.x EventSourceResponse."""
    return {"event": event_name, "data": json.dumps(data)}


async def stream_research(task_id: str) -> AsyncGenerator[dict, None]:
    """
    Async generator that executes each agent sequentially and streams progress.
    """
    if task_id not in tasks:
        yield _event("error", {"message": "Task not found"})
        return

    task = tasks[task_id]
    topic = task["topic"]

    # Signal overall start
    yield _event("start", {"task_id": task_id, "topic": topic})
    await asyncio.sleep(0.3)

    yield _event("agent_update", {
        "agent": "coordinator",
        "status": "running",
        "message": "Task created. Dispatching agents sequentially...",
    })
    await asyncio.sleep(0.3)

    task["status"] = "running"
    
    # Initialize agents
    research_agent = ResearchAgent()
    fact_check_agent = FactCheckAgent()
    summary_agent = SummaryAgent()
    report_agent = ReportAgent()

    agent_outputs = {}

    try:
        # 1. Research Agent
        yield _event("agent_update", {
            "agent": "research", "status": "running", "message": "Extracting key information and data points..."
        })
        research_result = await research_agent.run(topic)
        agent_outputs["research"] = research_result
        yield _event("agent_update", {
            "agent": "research", "status": "done", "message": "Research Agent completed successfully.", "output": research_result
        })

        # 2. Fact Check Agent
        yield _event("agent_update", {
            "agent": "fact_check", "status": "running", "message": "Validating findings and cross-referencing sources..."
        })
        fact_check_result = await fact_check_agent.run(topic, research_result)
        agent_outputs["fact_check"] = fact_check_result
        yield _event("agent_update", {
            "agent": "fact_check", "status": "done", "message": "Fact Check Agent completed successfully.", "output": fact_check_result
        })

        # 3. Summary Agent
        yield _event("agent_update", {
            "agent": "summary", "status": "running", "message": "Synthesizing concise insights from verified data..."
        })
        summary_result = await summary_agent.run(topic, fact_check_result)
        agent_outputs["summary"] = summary_result
        yield _event("agent_update", {
            "agent": "summary", "status": "done", "message": "Summary Agent completed successfully.", "output": summary_result
        })

        # 4. Report Agent
        yield _event("agent_update", {
            "agent": "report", "status": "running", "message": "Compiling executive report and recommendations..."
        })
        report_result = await report_agent.run(topic, summary_result)
        agent_outputs["report"] = report_result
        yield _event("agent_update", {
            "agent": "report", "status": "done", "message": "Report Agent completed successfully.", "output": report_result
        })

        # Final unified result
        task["result"] = agent_outputs

    except Exception as e:
        yield _event("error", {"message": f"Agent Pipeline Error: {str(e)}"})
        task["status"] = "error"
        task["error"] = str(e)
        return

    # Final complete event
    task["status"] = "complete"
    yield _event("agent_update", {
        "agent": "coordinator",
        "status": "done",
        "message": "All agents completed successfully.",
    })
    
    yield _event("complete", {
        "topic": topic,
        "research":   agent_outputs.get("research", {}),
        "fact_check": agent_outputs.get("fact_check", {}),
        "summary":    agent_outputs.get("summary", {}),
        "report":     agent_outputs.get("report", {}),
    })
