from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from enum import Enum


class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    DONE = "done"
    ERROR = "error"


class ResearchRequest(BaseModel):
    topic: str


class TaskResponse(BaseModel):
    task_id: str
    topic: str
    status: str


class ResearchFindings(BaseModel):
    key_information: List[str]
    sources_summary: str


class FactCheckResult(BaseModel):
    verified_facts: List[str]
    confidence_score: float
    caveats: Optional[List[str]] = []


class SummaryResult(BaseModel):
    executive_summary: str
    key_insights: List[str]


class ReportResult(BaseModel):
    conclusion: str
    recommendations: List[str]


class FullReport(BaseModel):
    topic: str
    research: ResearchFindings
    fact_check: FactCheckResult
    summary: SummaryResult
    report: ReportResult


class AgentEvent(BaseModel):
    agent: str
    status: AgentStatus
    output: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
