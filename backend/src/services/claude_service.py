from anthropic import Anthropic, APIConnectionError, RateLimitError
from fastapi import HTTPException
from src.core.config import settings

client = Anthropic(api_key=settings.CLAUDE_API_KEY)

async def ask_claude(prompt: str) -> str:
    """Gets response from Claude"""

    try:
        response = client.messages.create(
            model = settings.CLAUDE_MODEL,
            max_tokens = settings.CLAUDE_MAX_TOKENS,
            messages = [{
                "role": "user",
                "content": prompt
            }]
        )
        return response.content[0].text
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    except APIConnectionError:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))