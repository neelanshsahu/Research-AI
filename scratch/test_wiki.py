import urllib.request
import urllib.parse
import json

def search_wikipedia(query: str) -> str:
    """Searches Wikipedia for the given query and returns a summary."""
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&utf8=&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        results = data.get('query', {}).get('search', [])
        if not results:
            return "No results found."
        
        snippets = []
        for res in results[:3]:
            # Simple HTML tag removal
            import re
            clean_snippet = re.sub('<[^<]+>', '', res['snippet'])
            snippets.append(f"Title: {res['title']}\nSnippet: {clean_snippet}")
        return "\n\n".join(snippets)
    except Exception as e:
        return f"Error: {e}"

print(search_wikipedia("Quantum Computing"))
