from pydantic import BaseModel, Field
from typing import List

class Node(BaseModel):
    """Defines a single concept/node in the 3D mind map."""
    node_id: int = Field(..., description="A unique integer ID for the node.")
    label: str = Field(..., description="The short name or title of the concept.")
    description: str = Field(..., description="A brief explanation of the concept.")
    x: float = Field(..., description="X-coordinate for 3D positioning.")
    y: float = Field(..., description="Y-coordinate for 3D positioning (Y-axis is hierarchy).")
    z: float = Field(..., description="Z-coordinate for 3D positioning.")

class Edge(BaseModel):
    """Defines a connection between two nodes using their coordinates"""
    source: List[float] = Field(..., description="The coordinates of the source (prerequisite) node.")
    target: List[float] = Field(..., description="The coordinates of the target (dependent) node.")

    class Config:
        json_schema_extra = {
            "example": {
                "source": [0.0, 5.0, 0.0],
                "target": [0.0, 0.0, 0.0]
            }
        }

class GraphResponse(BaseModel):
    """The final structure containing all nodes and edges for the mind map."""
    nodes: List[Node]
    edges: List[Edge]