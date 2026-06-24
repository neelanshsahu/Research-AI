import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv("backend/.env")

def get_current_weather(location: str) -> str:
    """Gets the current weather for a given location."""
    print(f"--> Tool called for location: {location}")
    return f"The weather in {location} is 72 degrees and sunny."

client = genai.Client()
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="What is the weather like in Tokyo?",
        config=types.GenerateContentConfig(
            tools=[get_current_weather],
            temperature=0.0
        )
    )
    print("Response text:", response.text)
    if response.function_calls:
        print("Function calls:", response.function_calls)
except Exception as e:
    print("Error:", e)
