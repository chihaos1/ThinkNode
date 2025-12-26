from pathlib import Path

from anthropic import Anthropic
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from src.core.config import settings
from src.models.graph import GraphResponse
from src.models.requests import ExportRequest, MindMapRequest
from src.services.claude_service import create_mindmap, update_mindmap
from src.services.export_service import generate_export

router = APIRouter()

client = Anthropic(api_key=settings.CLAUDE_API_KEY)

@router.post("/chat", 
            tags=["Chat"], 
            summary="Chat with Claude to Create or Update Mind Map",
            response_model=GraphResponse
            )
async def chat(request: MindMapRequest):
    """
    User sends prompt to get Claude's response
    """

    try:
        isUpdate = len(request.current_nodes) > 0
        if isUpdate:
            response = await update_mindmap(
                prompt = request.prompt,
                current_nodes = request.current_nodes,
                current_edges = request.current_edges
            )
        else:
            response = await create_mindmap(prompt = request.prompt)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export", 
            tags=["Export"], 
            summary="Exports Mind Map in the Desired Format",
            )
async def export_mindmap(request: ExportRequest, background_tasks: BackgroundTasks):
    """
    User exports Mind Map in the desired format
    """

    try:
        filepath, media_type, filename = await generate_export(request.format, request.nodes, request.edges, request.title)
        background_tasks.add_task(cleanup_file, filepath)

        return FileResponse(
            path = filepath,
            media_type = media_type,
            filename = filename,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def cleanup_file(filepath: str):
    """
    Delete temp file and its parent directory
    """
    
    try:
        file_path = Path(filepath)
        temp_dir = file_path.parent

        if file_path.exists():
            file_path.unlink()
        
        if temp_dir.exists() and not any(temp_dir.iterdir()):
            temp_dir.rmdir()

    except Exception as e:
        print(f"Cleanup error: {e}")
