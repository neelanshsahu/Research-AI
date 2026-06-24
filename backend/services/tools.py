"""
Backend tools for the LLM agents to execute.
Currently implements a web search tool using DuckDuckGo.
"""
from duckduckgo_search import DDGS

def search_web(query: str) -> str:
    """Searches the web for the given query and returns a summary of the top results. Use this when you need real-time, up-to-date, or specific information that you do not already know."""
    print(f"[Tool: search_web] Executing query: '{query}'")
    try:
        results = DDGS().text(query, max_results=3)
        if not results:
            return "No results found on the web."
        
        snippets = []
        for r in results:
            title = r.get("title", "No Title")
            snippet = r.get("body", "No Snippet")
            link = r.get("href", "")
            snippets.append(f"Title: {title}\nSnippet: {snippet}\nSource: {link}")
            
        return "\n\n---\n\n".join(snippets)
    except Exception as e:
        print(f"[Tool: search_web] Error: {str(e)}")
        return f"Web search failed with error: {str(e)}"
