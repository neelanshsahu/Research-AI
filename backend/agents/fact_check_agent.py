from services.research_router import call_llm
import json

class FactCheckAgent:
    def __init__(self):
        self.prompt_template = """
You are an expert AI Fact Checker. Your sole responsibility is to validate the findings provided by the Research Agent.

TOPIC: "{topic}"

RAW RESEARCH DATA:
{research_data}

Review the provided research data. Extract and verify the facts. 
Respond ONLY with a valid JSON object in exactly this structure:
{{
  "verified_facts": [
    "Verified and confirmed fact #1",
    "Verified and confirmed fact #2",
    "Verified and confirmed fact #3",
    "Verified and confirmed fact #4"
  ],
  "confidence_score": 0.92,
  "caveats": [
    "Any important caveat or limitation to be aware of",
    "Another caveat if applicable"
  ]
}}
"""

    async def run(self, topic: str, research_data: dict) -> dict:
        prompt = self.prompt_template.format(
            topic=topic, 
            research_data=json.dumps(research_data, indent=2)
        )
        return await call_llm(prompt, use_tools=False)
