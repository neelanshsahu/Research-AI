from services.research_router import call_llm
import json

class ResearchAgent:
    def __init__(self):
        self.prompt_template = """
You are an expert AI Research Agent. Your sole responsibility is to gather factual data on the following topic.
TOPIC: "{topic}"

**IMPORTANT: You have access to a `search_web` tool. You MUST use this tool to search the internet for real-time information, recent developments, or specific facts before writing your response.**

Respond ONLY with a valid JSON object in exactly this structure:
{{
  "key_information": [
    "Detailed fact or finding #1 about the topic",
    "Detailed fact or finding #2 about the topic",
    "Detailed fact or finding #3 about the topic",
    "Detailed fact or finding #4 about the topic",
    "Detailed fact or finding #5 about the topic"
  ],
  "sources_summary": "A 2-3 sentence description of what types of sources and domains of knowledge were consulted."
}}
"""

    async def run(self, topic: str) -> dict:
        prompt = self.prompt_template.format(topic=topic)
        return await call_llm(prompt, use_tools=True)
