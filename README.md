# ThinkNode

An AI-powered 3D mind mapping website that transforms ideas into interactive spatial visualization. ThinkNode can structure user questions and thoughts into connected concept nodes for exploration, navigation, and export. 

## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
  
## Features

####  🧠 AI-Powered Mind Mapping
ThinkNode uses Claude AI to break down complex topics into structured concept hierarchies. Describe what you want to explore and Claude generates a comprehensive mind map with properly organized nodes and relationships.

####  🎮 Immersive 3D Visualization
ThinkNode is built with **React Three Fiber** and **Three.js**, allowing ideas to render in an interactive 3D space. Users can navigate through concepts with camera controls to rotate, pan, and zoom in/out the mind map.

#### 🔗 Smart Node Connections
ThinkNode creates meaningful connections between related concepts and organizes them spatially. Physical proximity reveals conceptual relationships.
- **Y-axis (Abstraction)**
  - High (+): Abstract theories and foundational concepts.
  - Low (-): Concrete examples and practical tools.
- **X-axis (Themes)**
  - Different conceptual domains spread horizontally.
  - Related concepts cluster together in the same region.
-  **Z-axis (Relevance)**
  - High (+): Core concepts essential to the topic.
  - Low (-): Contextual or peripheral information.

####  ✏️ Interactive Editing
- **Drag and Drop** - Move nodes freely in 3D space.
- **Add Components** - Add nodes and lines to create custom relationships between concepts.
- **Delete Components** - Delete nodes and lines to refine relationships in your mind map.
- **Node Details** - Click any node to view and edit its title and description.

####  📊 Intelligent Export
- **PowerPoint Presentations** - Generate slide decks with proper hierarchy and flow.
- **Word Documents** - Create structured reports with headings and paragraphs.

#### 💾 Persistent Storage
Mind maps can be saved and loaded, allowing users to jump back into their maps anytime.

#### 🔐 Secure Authentication
User authentication powered by Supabase Auth ensures your mind maps remain private and accessible only to you.

## Demo

#### 1. Generate Mind Map
Type a prompt and ThinkNode uses Claude AI to create a 3D mind map with spatially positioned nodes.

![input-prompt](https://github.com/user-attachments/assets/987b9f0e-2241-47f0-abc7-5f9d8a70588e)

#### 2. Explore Nodes
Rotate and zoom to navigate the 3D space. Click any node to view its details. You can also edit the node's title and description.

![explore-mind-map](https://github.com/user-attachments/assets/35c2343e-f8a1-4101-9a17-c140f76d8d8d)

#### 3. Create Custom Relationships
Add new nodes or lines to define a new relationship. 

![add-node-lines](https://github.com/user-attachments/assets/796b6241-2032-41e1-bc8d-5745680b2341)

#### 4. Delete Unneeded Elements
Remove nodes or lines as you continue to refine your mind map.

![remove-node-lines](https://github.com/user-attachments/assets/2877d65f-fea8-4203-a5ac-3eba74164676)

#### 5. Refine with AI
Ask Claude follow-up questions to add new nodes, modify ore remove existing nodes, or create a completly new mind map.

![update-mind-map](https://github.com/user-attachments/assets/93ae4470-cb2e-4747-abfe-370138830fba)

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Three.js & React Three Fiber
- Vite

**Backend**
- FastAPI (Python)
- Claude AI (Anthropic)

**Infrastructure**
- Supabase (PostgreSQL + Auth)
- Vercel (Frontend)
- Railway (Backend)
