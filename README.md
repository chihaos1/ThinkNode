# ThinkNode

An AI-powered 3D mind mapping website that transforms ideas into interactive spatial visualization. ThinkNode can structure user questions and thoughts into connected concept nodes for exploration, navigation, and export. 

## Features

###  🧠 AI-Powered Mind Mapping
ThinkNode uses Claude AI to break down complex topics into structured concept hierarchies. Describe what you want to explore and Claude generates a comprehensive mind map with properly organized nodes and relationships.

###  🎮 Immersive 3D Visualization
ThinkNode is built with **React Three Fiber** and **Three.js**, allowing ideas to render in an interactive 3D space. Users can navigate through concepts with camera controls to rotate, pan, and zoom in/out the mind map.

### 🔗 Smart Node Connections
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

###  ✏️ Interactive Editing
- **Drag and Drop** - Move nodes freely in 3D space.
- **Add Components** - Add nodes and lines to create custom relationships between concepts.
- **Delete Components** - Delete nodes and lines to refine relationships in your mind map.
- **Node Details** - Click any node to view and edit its title and description.

###  📊 Intelligent Export
- **PowerPoint Presentations** - Generate slide decks with proper hierarchy and flow.
- **Word Documents** - Create structured reports with headings and paragraphs.

### 💾 Persistent Storage
Mind maps can be saved and loaded, allowing users to jump back into their maps anytime.

### 🔐 Secure Authentication
User authentication powered by Supabase Auth ensures your mind maps remain private and accessible only to you.
