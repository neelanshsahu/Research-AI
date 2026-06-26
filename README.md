# 🧠 ResearchAI — AI Multi-Agent Research Assistant

**Live Demo:** [https://researchai-mc88.onrender.com](https://researchai-mc88.onrender.com)

A full-stack SaaS application that orchestrates a **4-agent AI research pipeline** powered by Google Gemini 2.0 Flash.

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Backend  | FastAPI + Python 3.11+        |
| AI       | Google Gemini 2.0 Flash       |
| Streaming| Server-Sent Events (SSE)      |

## Project Structure

```
.
├── frontend/     # React + Vite + Tailwind
└── backend/      # FastAPI + Gemini API
```

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at → **http://localhost:5173**

## Usage

1. Enter a research topic in the search bar
2. Watch the 4 AI agents process your request in real-time:
   - 🔬 **Research Agent** — Extracts key information
   - ✅ **Fact Check Agent** — Validates findings
   - 📝 **Summary Agent** — Creates executive insights
   - 📊 **Report Agent** — Generates final report
3. View results across 4 tabbed output sections
4. Export the full report as JSON

## Environment Variables

| Variable        | Description            |
|-----------------|------------------------|
| `GEMINI_API_KEY`| Your Gemini API key    |

Get your API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
