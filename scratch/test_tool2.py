import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv("../backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

def get_current_weather(location: str) -> str:
    """Gets the current weather for a given location."""
    print(f"--> Tool called for location: {location}")
    return f"The weather in {location} is 72 degrees and sunny."

client = genai.Client(api_key=api_key)
try:
    chat = client.chats.create(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            tools=[get_current_weather],
            temperature=0.0
        )
    )
    response = chat.send_message("What is the weather like in Tokyo?")
    print("Final text:", response.text)
except Exception as e:
    print("Error:", e)
