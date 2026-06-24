from services.research_router import call_llm
import json

class ReportAgent:
    def __init__(self):
        self.prompt_template = """
You are an expert AI Report Agent. Your sole responsibility is to compile an executive report and recommendations based on the previous agent's summary.

TOPIC: "{topic}"

EXECUTIVE SUMMARY & INSIGHTS (from Summary Agent):
{summary_data}

Compile a final report with a forward-looking conclusion and actionable recommendations.
Respond ONLY with a valid JSON object in exactly this structure:
{{
  "conclusion": "A thorough 3-4 sentence conclusion synthesizing all findings with a forward-looking perspective.",
  "recommendations": [
    "Actionable recommendation #1 based on the research",
    "Actionable recommendation #2 based on the research",
    "Actionable recommendation #3 based on the research"
  ]
}}
"""

    async def run(self, topic: str, summary_data: dict) -> dict:
        prompt = self.prompt_template.format(
            topic=topic, 
            summary_data=json.dumps(summary_data, indent=2)
        )
        return await call_llm(prompt, use_tools=False)
