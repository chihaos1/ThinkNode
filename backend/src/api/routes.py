from anthropic import Anthropic
from fastapi import APIRouter, HTTPException
from src.core.config import settings
from src.models.prompts import PromptRequest, PromptResponse
from src.services.claude_service import ask_claude

router = APIRouter()

client = Anthropic(api_key=settings.CLAUDE_API_KEY)

@router.post("/chat", 
            tags=["Claude"], 
            summary="Passes prompt to Claude",
            response_model=PromptResponse)
async def chat(request: PromptRequest):
    """
    User sends prompt to get Claude's response
    """

    try:
        response = await ask_claude(request.prompt)
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))