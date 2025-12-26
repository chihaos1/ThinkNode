from typing import Dict, List

from anthropic import Anthropic, APIConnectionError, RateLimitError
from fastapi import HTTPException

from src.core.config import settings
from src.core.prompts.export import EXPORT_MINDMAP_AS_DECK
from src.models.graph import Node, Edge
from src.utils.generate_docx import generate_docx
from src.utils.generate_pptx import generate_pptx

client = Anthropic(api_key=settings.CLAUDE_API_KEY)

async def generate_export(format: str, nodes: List[Node], edges: List[Edge], title: str):
    
    try:
        if format == "deck":
            slide_content = await generate_slide_content(nodes, edges)
            print("Completed generating slide contents")
            slide_filepath = await generate_pptx(slide_content, title)
            print("Completed generating slides")
            media_type =  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            filename = f"{title.replace(' ', '_')}.pptx"

            return slide_filepath, media_type, filename

        elif format == "document":
            document_content = await generate_document_content(nodes, edges)
            print("Completed generating document contents")
            document_filepath = await generate_docx(document_content, title)
            print("Completed generating document")
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"{title.replace(' ', '_')}.docx"

            return document_filepath, media_type, filename
    
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    except APIConnectionError:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def generate_slide_content(nodes: List[Node], edges: List[Edge]) -> List[Dict]:
    """
    Calls the Claude API to generate the slide structure for the deck
    
    Args:
        nodes (List[Node]): A list of Nodes that contains the label and descriptions to be used to generate slide structure.
        edges (List[Edge]): A list of Edges that contains data on how the nodes are connected. Used to determine relationship of nodes.
    
    Return:
        slide_content (List[Dict]): A list of slide content determined by Claude based on the nodes and edges.
        
    """
    
    response = client.messages.create(
            model = settings.CLAUDE_MODEL,
            max_tokens = settings.CLAUDE_MAX_TOKENS,
            system = EXPORT_MINDMAP_AS_DECK,
            tools = [
                {
                    "name": "create_slide",
                    "description": "Create a content slide with title and body text. Call this tool once for each slide you want to create in the presentation.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "slide_number": {
                                "type": "integer",
                                "description": "The sequence number of this slide (1, 2, 3, etc.). Determines the order of slides in the presentation."
                            },
                            "title": {
                                "type": "string",
                                "description": "The slide title. Should be concise and descriptive (3-8 words). This appears at the top of the slide."
                            },
                            "body": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Bullet points for the slide body. Each item is one bullet point. Keep bullet points concise (1-2 sentences each). Maximum 5-6 bullets per slide for readability."
                            },
                            "notes": {
                                "type": "string",
                                "description": "Speaker notes for this slide. Additional context, talking points, or explanations that don't fit on the slide itself. Optional but recommended."
                            }
                        },
                        "required": ["slide_number", "title", "body"]
                    }
                }
            ],
            tool_choice = {"type": "tool", "name": "create_slide"},
            messages = [{
                "role": "user",
                "content": f"""

                Create a presentation based on this mind map:
                
                Topic: {nodes[0].label if nodes else "Mind Map"}
                
                Nodes ({len(nodes)} total):
                {chr(10).join([f"- {node.label}: {node.description}" for node in nodes])}
                
                Connections: {len(edges)} edges showing relationships
                
                Instructions:
                - Create 8-12 content slides
                - Use node labels and descriptions as content
                - Follow the relationships shown by edges
                - Start with foundational concepts (high-level nodes)
                - Progress to advanced topics
                - Each slide should have 4-6 clear, concise bullet points
                """
            }])

    slide_content = [block.input for block in response.content if block.type == "tool_use"]
    slide_content.sort(key=lambda x: x["slide_number"])

    return slide_content

async def generate_document_content(nodes: List[Node], edges: List[Edge]) -> List[Dict]:
    """
    Calls the Claude API to generate the content structure for the document
    
    Args:
        nodes (List[Node]): A list of Nodes that contains the label and descriptions to be used to generate slide structure.
        edges (List[Edge]): A list of Edges that contains data on how the nodes are connected. Used to determine relationship of nodes.
    
    Return:
        document_content (List[Dict]): A list of document content determined by Claude based on the nodes and edges.
        
    """

    response = client.messages.create(
            model = settings.CLAUDE_MODEL,
            max_tokens = settings.CLAUDE_MAX_TOKENS,
            system = EXPORT_MINDMAP_AS_DECK,
            tools = [
                {
                    "name": "create_paragraph",
                    "description": "Add a paragraph or section to the document. Call this tool for each distinct piece of content (heading + paragraphs). Content appears in the order created.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "order": {
                                "type": "integer",
                                "description": "Sequence number determining position in document (1, 2, 3, etc.)"
                            },
                            "heading": {
                                "type": "string",
                                "description": "Section heading (3-10 words). Use null for paragraphs without headings."
                            },
                            "heading_level": {
                                "type": "integer",
                                "enum": [1, 2, 3],
                                "description": "Heading level: 1 (major section), 2 (subsection), 3 (sub-subsection). Only used if heading is provided."
                            },
                            "content": {
                                "type": "string",
                                "description": "The main text content. Write in complete paragraphs (2-5 sentences). Use professional, clear language."
                            }
                        },
                        "required": ["order", "content"]
                    }
                }
            ],
            tool_choice = {"type": "tool", "name": "create_paragraph"},
            messages = [{
                "role": "user",
                "content": f"""

                Create a document based on this mind map:
    
                Topic: {nodes[0].label if nodes else "Mind Map"}
                
                Nodes ({len(nodes)} total):
                {chr(10).join([f"- {node.label}: {node.description}" for node in nodes])}
                
                Connections: {len(edges)} edges
                
                Instructions:
                - Create 10-15 paragraphs/sections covering the mind map
                - Use heading_level 1 for major topics, 2 for subtopics, 3 for details
                - Each section should have a clear heading and 2-4 sentences of content
                - Follow the logical flow shown by node connections
                - Write in clear, professional language

                """
            }])
    
    document_content = [block.input for block in response.content if block.type == "tool_use"]
    document_content.sort(key=lambda x: x["order"])

    return document_content