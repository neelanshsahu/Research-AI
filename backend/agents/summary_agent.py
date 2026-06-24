from services.research_router import call_llm
import json

class SummaryAgent:
    def __init__(self):
        self.prompt_template = """
You are an expert AI Summary Agent. Your sole responsibility is to synthesize concise insights from verified data.

TOPIC: "{topic}"

VERIFIED FACTS (from Fact Check Agent):
{fact_check_data}

Synthesize the verified facts into an executive summary and extract key insights.
Respond ONLY with a valid JSON object in exactly this structure:
{{
  "executive_summary": "A comprehensive 3-4 sentence executive summary of the topic. Be specific, insightful, and data-driven where possible.",
  "key_insights": [
    "Key insight #1 that goes beyond surface-level understanding",
    "Key insight #2 that reveals a non-obvious pattern or trend",
    "Key insight #3 that has practical implications",
    "Key insight #4 about future trajectory or impact"
  ]
}}
"""

    async def run(self, topic: str, fact_check_data: dict) -> dict:
        prompt = self.prompt_template.format(
            topic=topic, 
            fact_check_data=json.dumps(fact_check_data, indent=2)
        )
        return await call_llm(prompt, use_tools=False)
