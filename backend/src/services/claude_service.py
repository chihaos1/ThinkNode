from typing import List

from anthropic import Anthropic, APIConnectionError, RateLimitError
from anthropic.types import ToolUseBlock
from fastapi import HTTPException

from src.core.config import settings
from src.core.prompts.mindmap import CREATE_MIND_MAP_SYSTEM_PROMPT, UPDATE_MIND_MAP_SYSTEM_PROMPT
from src.models.graph import Node, Edge, GraphResponse

client = Anthropic(api_key=settings.CLAUDE_API_KEY)

async def create_mindmap(prompt: str) -> GraphResponse:
    """Create a new Mind Map"""

    try:
        response = client.messages.create(
            model = settings.CLAUDE_MODEL,
            max_tokens = settings.CLAUDE_MAX_TOKENS,
            system = CREATE_MIND_MAP_SYSTEM_PROMPT,
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
                "role": "user", 
                "content": f"""
                
                Create a comprehensive 3D mind map for the topic: "{prompt}" 
                
                Think about all the related topics.
                
                Create exactly:
                - 15-20 nodes
                - 13-18 edges

                Use add_node for EACH concept.

                """
            }]
        )

        return _parse_response(response)
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    except APIConnectionError:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _parse_response(response: ToolUseBlock) -> GraphResponse:
    """Helper function for parsing response from Claude"""
    
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

async def update_mindmap(
    prompt: str,
    current_nodes: List[Node],
    current_edges: List[Edge]
) -> GraphResponse:
    """Update the mindmap based on the user's need"""
    try:
        node_summary = "\n".join([
            f" - NODE {node.node_id} - TITLE {node.label}: {node.description}. COORDS: [{node.x},{node.y},{node.z}]"
            for node in current_nodes
        ])

        edge_summary = "\n".join([
            f" - EDGE - SOURCE COORDS [{edge.source[0]},{edge.source[1]},{edge.source[2]}] \
                      - TARGET COORDS [{edge.target[0]},{edge.target[1]},{edge.target[2]}]"
            for edge in current_edges
        ])

        response = client.messages.create(
            model = settings.CLAUDE_MODEL,
            max_tokens = settings.CLAUDE_MAX_TOKENS,
            system = UPDATE_MIND_MAP_SYSTEM_PROMPT,
            tools = [
                {
                    "name": "add_nodes",
                    "description": "Add new nodes to the existing mind map",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "nodes": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "node_id": {"type": "number"},
                                        "label": {"type": "string"},
                                        "description": {"type": "string"},
                                        "x": {"type": "number"},
                                        "y": {"type": "number"},
                                        "z": {"type": "number"},
                                        "connected_nodes": {
                                            "type": "array",
                                            "items": {"type": "integer"}
                                        }
                                    },
                                    "required": ["node_id", "label", "description", "x", "y", "z", "connected_nodes"]
                                }
                            }
                        },
                        "required": ["nodes"]
                    }
                },
                {
                    "name": "delete_nodes",
                    "description": "Remove nodes from the mind map",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "node_ids": {
                                "type": "array",
                                "items": {"type": "integer"},
                                "description": "IDs of nodes to remove"
                            }
                        },
                        "required": ["node_ids"]
                    }
                },
                {
                    "name": "modify_nodes",
                    "description": "Update EXISTING nodes' labels or descriptions. Use this when the user wants to change/edit/rename/improve a node that already exists. DO NOT use this to add new nodes - only to modify current ones.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "modifications": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "node_id": {
                                            "type": "integer",
                                            "description": "The ID of the EXISTING node to modify (must match a node_id from current_nodes)"
                                        },
                                        "new_label": {
                                            "type": "string",
                                            "description": "New label/title for this existing node (optional)"
                                        },
                                        "new_description": {
                                            "type": "string",
                                            "description": "New or updated description for this existing node (optional)"
                                        }
                                    },
                                    "required": ["node_id"]
                                }
                            }
                        },
                        "required": ["modifications"]
                    }
                },
                {
                    "name": "replace_all",
                    "description": "Replace the entire mind map with a new topic",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "new_topic": {"type": "string"}
                        },
                        "required": ["new_topic"]
                    }
                }
            ],
            messages = [{
                "role": "user",
                "content": f"""

                Current mind map state:
                
                Nodes ({len(current_nodes)} total):
                {node_summary}
                
                Edges ({len(current_edges)} total):
                {edge_summary}
                
                User request: "{prompt}"
                
                Analyze the request and decide what to do:
                - Use add_nodes to add new related concepts
                - Use delete_nodes to remove concepts
                - Use modify_nodes to update existing concepts
                - Use replace_all if user wants a completely new topic
                
                Important:
                - Assign new node IDs starting from {max([n.node_id for n in current_nodes]) + 1 if current_nodes else 1}
                - Position new nodes near related existing nodes
                - Maintain spatial coherence
                """
            }]
        )

        updated_nodes = current_nodes.copy()
        updated_edges = current_edges.copy()
        operations = []

        for block in response.content:
            if block.type == "tool_use":

                # Add New Nodes
                if block.name == "add_nodes":
                    new_nodes = []
                    for node_data in block.input["nodes"]:
                        
                        # Add Nodes
                        node = Node(
                            node_id = int(node_data["node_id"]),
                            label = node_data["label"],
                            description = node_data["description"],
                            x = float(node_data["x"]),
                            y = float(node_data["y"]),
                            z = float(node_data["z"]),
                        )
                        new_nodes.append(node)

                        # Add Edges
                        for to_id in node_data.get("connected_nodes", []):
                            target_node = next((node for node in current_nodes + new_nodes if node.node_id == to_id), None)
                            if target_node:
                                edge = Edge(
                                    source = [node.x, node.y, node.z],
                                    target = [target_node.x, target_node.y, target_node.z]
                                )
                                updated_edges.append(edge)
                    updated_nodes.extend(new_nodes)
                    operations.append(f"Added {len(new_nodes)} nodes")
                
                # Delete Existing Nodes
                elif block.name == "delete_nodes":
                    
                    # Delete Nodes
                    deleted_node_ids = block.input["node_ids"]
                    updated_nodes = [node for node in updated_nodes if node.node_id not in deleted_node_ids]

                    # Delete Edges
                    deleted_node_coords = [(node.x, node.y, node.z) for node in current_nodes if node.node_id in deleted_node_ids]
                    updated_edges = [
                        edge for edge in updated_edges
                        if tuple(edge.source) not in deleted_node_coords and tuple(edge.target) not in deleted_node_coords
                    ]
                    operations.append(f"Deleted {len(deleted_node_ids)} nodes")

                # Modify Existing Nodes
                elif block.name == "modify_nodes":
                    for mod in block.input["modifications"]:
                        mod_node_id = mod["node_id"]
                        for node in updated_nodes:
                            if node.node_id == mod_node_id:
                                if "new_label" in mod:
                                    node.label = mod["new_label"]
                                if "new_description" in mod:
                                    node.description = mod["new_description"]
                    operations.append(f"Modified {len(block.input["modifications"])} nodes")
                
                elif block.name == "replace_all":
                    return await create_mindmap(block.input["new_topic"])

        print(f"Operations performed: {operations}")

        return GraphResponse(
            nodes = updated_nodes,
            edges = updated_edges
        )
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    except APIConnectionError:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    