from pydantic import BaseModel

class Node(BaseModel):
    id: int
    label: str
    x: float
    y: float
    z: float

class Edge(BaseModel):
    from_id: int
    to_id: int

class GraphResponse