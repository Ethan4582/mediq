import httpx
import time

def generate_embeddings(
    texts: list[str], 
    mistral_api_key: str,
    batch_size: int = 32
) -> list[list[float]]:
    
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        
        for attempt in range(3):
            try:
                response = httpx.post(
                    "https://api.mistral.ai/v1/embeddings",
                    headers={
                        "Authorization": f"Bearer {mistral_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "mistral-embed",
                        "input": batch
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                batch_embeddings = [item["embedding"] for item in data["data"]]
                all_embeddings.extend(batch_embeddings)
                break
            except Exception as e:
                if attempt == 2:
                    raise
                time.sleep(2)
    
    return all_embeddings
