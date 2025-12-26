from typing import List, Literal, Optional
from pydantic import BaseModel
from src.models.graph import Node, Edge

class MindMapRequest(BaseModel):
    prompt: str
    current_nodes: Optional[List[Node]] = []
    current_edges: Optional[List[Edge]] = []

class ExportRequest(BaseModel):
    format: Literal["deck", "document"]
    title: str
    nodes: List[Node]
    edges: List[Edge]