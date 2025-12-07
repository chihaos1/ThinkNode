from anthropic import Anthropic, APIConnectionError, RateLimitError
from fastapi import HTTPException
from src.core.config import settings
from src.core.prompts import MIND_MAP_SYSTEM_PROMPT
from src.models.graph import Node, Edge, GraphResponse

client = Anthropic(api_key=settings.CLAUDE_API_KEY)

async def ask_claude(prompt: str) -> str:
    """Gets response from Claude"""

    try:
        response = client.messages.create(
            model = settings.CLAUDE_MODEL,
            max_tokens = settings.CLAUDE_MAX_TOKENS,
            system = MIND_MAP_SYSTEM_PROMPT,
            tools = [
                {
                    "name": "add_node",
                    "description": "Add a concept node with 3D position based on relationships",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "node_id": {
                                "type": "number",
                                "description": "The unique node ID for the node"
                            },
                            "label": {
                                "type": "string",
                                "description": "Short concept name (2-4 words)"
                            },
                            "description": {
                                "type": "string",
                                "description": "Detailed explanation (2-4 sentences)"
                            },
                            "x": {
                                "type": "number",
                                "description": "X coordinate (-10 to +10)"
                            },
                            "y": {
                                "type": "number",
                                "description": "Y coordinate (-10 to +10)"
                            },
                            "z": {
                                "type": "number",
                                "description": "Z coordinate (-10 to +10)"
                            },
                            "connected_nodes": {
                                "type": "array",
                                "items": {"type": "integer"},
                                "description": "A list of child node IDs connected the this node."
                            }
                        },
                        "required": ["node_id", "label", "description", "x", "y", "z", "connected_nodes"]
                    }
                }
            ],
            tool_choice = {"type": "tool", "name": "add_node"},
            messages = [{
                "role": "user", "content": f"""
                
                Create a comprehensive 3D mind map for the topic: "{prompt}" 
                
                Think about all the related topics.
                
                Create exactly:
                - 10-12 nodes
                - 8-10 edges

                Use add_node for EACH concept.

                """
            }]
        )

        nodes_data = []

        for block in response.content:
            if block.type == "tool_use":
                if block.name == "add_node":
                    nodes_data.append({
                        "node_id": int(block.input["node_id"]),
                        "label": block.input["label"],
                        "description": block.input["description"],
                        "x": float(block.input["x"]),
                        "y": float(block.input["y"]),
                        "z": float(block.input["z"]),
                        "connected_nodes": block.input.get("connected_nodes", [])
                    })

        # Parsing the Nodes and Node Coordinates
        nodes = []
        node_coords = {}
        for node_data in nodes_data:
            node = Node(
                node_id = node_data["node_id"],
                label = node_data["label"],
                description = node_data["description"],
                x = node_data["x"],
                y = node_data["y"],
                z = node_data["z"],
            )
            nodes.append(node)
            node_coords[node_data["node_id"]] = (node_data["x"], node_data["y"], node_data["z"])

        # Parsing the Edges based on the Node Coordinates
        edges = []
        for node_data in nodes_data:
            from_id = node_data["node_id"]
            from_coords = node_coords[from_id]   
            
            for to_id in node_data["connected_nodes"]:
                to_coords = node_coords[to_id]
                edge = Edge(
                        source = list(from_coords),
                        target = list(to_coords)
                    )
                edges.append(edge)

        return GraphResponse(
            nodes = nodes,
            edges = edges
        )
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    except APIConnectionError:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))