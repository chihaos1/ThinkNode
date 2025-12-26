import { useCallback, useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { supabase } from "./util/supabase-client"
import AuthModal from "./components/ui/Modals/AuthModal"
import ControlsGuide from "./components/ui/ControlsGuide/ControlsGuide"
import InputBox from "./components/ui/InputBox/InputBox"
import NavBar from "./components/ui/NavBar/NavBar"
import MindMapModal from "./components/ui/Modals/MindMapModal"
import Scene from "./components/3d/Scene"
import Spinner from "./components/ui/Spinner/Spinner"
import Toolkit from "./components/ui/Toolkit/Toolkit"
import UserGuide from "./components/ui/UserGuide/UserGuide"
import type { Coordinates, GraphNode, GraphEdge, GraphResponse, nodeDetail } from "./models/Graph"
import type { MindMapItem } from "./models/MindMap"
import type { Mode } from "./models/Mode"
import type { User } from "@supabase/supabase-js"
import * as THREE from "three"
import './App.css'

function App() {

  const [mode, setMode] = useState<Mode>("idle")
  
    // ---------- Listen for Session and Session Changes ----------
  
  const [user, setUser] = useState<User | null>(null)

  const fetchSession = async() => {
    const currentSession = await supabase.auth.getSession();
    setUser(currentSession.data.session?.user ?? null)
  }

  useEffect(() => {
    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // ---------- Show Auth Modal ----------

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [defaultTab, setDefaultTab] = useState<"login" | "signup">("login")

  const openLoginModal = () => {
    setDefaultTab("login")
    setShowAuthModal(true)
  }

  const openSignupModal = () => {
    setDefaultTab("signup")
    setShowAuthModal(true)
  }

  const closeModal = () => {
    setShowAuthModal(false)
    setShowMindMapModal(false)
  }

  // ---------- Show Mind Map Modal ----------
  
  const [showMindMapModal, setShowMindMapModal] = useState<boolean>(false)
  const [mindMapListData, setMindMapListData] = useState<MindMapItem[] | null>(null)
  
  const openMindMapList = async() => {
    const { data, error } = await supabase
      .from("mind_maps")
      .select("id, title, created_at")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false})
    
    setMindMapListData(data)

    if (error) {
        console.error("Supabase error:", error)
        alert("Saving Mind Map failed: " + error.message)
      }

    setShowMindMapModal(true)
  }

  useEffect(() => {
    setShowMindMapModal(false)
  }, [user])

  // ---------- Handle User Profile Dropdown Menu ----------
  
  const userProfileRef = useRef<HTMLDivElement | null>(null);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState<boolean>(false)
  
  const toggleUserProfileDropdown = () => {
    setUserProfileDropdownOpen(true)
  }
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userProfileRef.current && !userProfileRef.current.contains(e.target as Node))
        setUserProfileDropdownOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  },[])

  useEffect(() => {
    setUserProfileDropdownOpen(false)
  }, [user])

  // ---------- Prompt Passed to Backend ----------

  const [prompt, setPrompt] = useState<string>("")
  const [nodeData, setNodeData] = useState<GraphResponse | null >(null)

  const handleSubmit = async (prompt: string) => {
    
    setPrompt(prompt)
    
    try {

      if (mode === "idle") {
        setMode("thinking")
		    const response = await fetch("http://127.0.0.1:8002/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({"prompt": prompt})
        })
      
        if (!response.ok) {
          throw new Error (`HTTP ERROR: ${response.status}`)
        }
        const data = await response.json()

        setNodeData(data)
        setTitle("Untitled Mind Map")
        setMode("exploring")
		    setIsInputCollapsed(true)
      } 
      else if (mode === "exploring") {
        setMode("updating")
		    const response = await fetch("http://127.0.0.1:8002/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "prompt": prompt,
            "current_nodes": nodeData?.nodes,
            "current_edges": nodeData?.edges
			    })
        })
      
        if (!response.ok) {
          throw new Error (`HTTP ERROR: ${response.status}`)
        }
        const data = await response.json()

        setNodeData(data)
        setTitle(title)
        setMode("exploring")
      }
      

    } catch (error) {
      
      setMode("idle")
      const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again"
      alert(errorMessage)
    }
  }

  // ---------- Expanding or Collapse Input Bar in Mind Map ----------
  const [isInputCollapsed, setIsInputCollapsed] = useState(true)

  const handleToggleInput = () => {
    setIsInputCollapsed(prev => !prev)
  }

  // ---------- Update Node Position after Dragging ----------

  const handleUpdateNodePosition = (nodeId: string, newPos: THREE.Vector3) => {
    setNodeData(prev => {
      if (!prev) return prev

      // Get the Moved Node
      const movedNode = prev.nodes.find(n => n.node_id.toString() === nodeId)
      
      if (!movedNode) return prev

      // Get Old Coordinates
      const oldCoords: Coordinates = [movedNode.x, movedNode.y, movedNode.z]

      // Get New Coordinates
      const newCoords: Coordinates = [newPos.x, newPos.y, newPos.z]

      return {
        ...prev,

        // Update node positions
        nodes: prev.nodes.map(node =>
          node.node_id.toString() === nodeId 
            ? {...node, x: newPos.x, y: newPos.y, z: newPos.z}
            : node
        ),
        
        edges: prev.edges.map(edge => {
          const oldCoordsStr = oldCoords.join(",")
          const sourceStr  = edge.source.join(",")
          const targetStr  = edge.target.join(",")

          return {
            source: sourceStr === oldCoordsStr ? newCoords : edge.source,
            target: targetStr === oldCoordsStr ? newCoords : edge.target
          }
        })
      }
    })
  }

  // ---------- Node Select and Deselect ----------
  
  const [selectedNode, setSelectedNode] = useState<nodeDetail | null>(null)
  const [editableLabel, setEditableLabel] = useState<string>("")
  const [editableDescription, setEditableDescription] = useState<string>("")

  useEffect(() => {
    const handleNodeSelect = (e: any) => {
      setSelectedNode(e.detail)
      setEditableLabel(e.detail.label)
      setEditableDescription(e.detail.description)
    }
    window.addEventListener("node-clicked", handleNodeSelect)
    return () => window.removeEventListener("node-clicked", handleNodeSelect)
  }, [])

  const handleNodeDeselect = () => {
    setSelectedNode(null)
    setEditableLabel("")
    setEditableDescription("")
  }

  const updateNode = (nodeId: number, updates: Partial<GraphNode>) => {
    if (!nodeData) return

    const updatedNodes = nodeData.nodes.map(node =>
      node.node_id === nodeId
        ? {...node, ...updates}
        : node
    )

    setNodeData({
      ...nodeData,
      nodes: updatedNodes
    })
  }

  const handleLabelSubmit = () => {
    if (selectedNode) {
      const nodeId = parseInt(selectedNode.id)

      if (editableLabel !== selectedNode.label) {
        updateNode(nodeId, { label: editableLabel})
      }
    }
  }

  const handleDescriptionlSubmit = () => {
    if (selectedNode) {
      const nodeId = parseInt(selectedNode.id)

      if (editableDescription !== selectedNode.description) {
        updateNode(nodeId, { description: editableDescription})
      }
    }
  }

  // ---------- Add Node ----------

  const handleAddNode = (x: number, y: number, z: number) => {
    
    if (!nodeData) return
    
    const maxNodeId = nodeData.nodes.reduce((max, node) => {
      return node.node_id > max ? node.node_id : max
    }, 0)
    const newNodeId = maxNodeId + 1
    const newNode: GraphNode = {
      node_id: newNodeId,
      label: "New Node",
      description: "Add Description Here",
      x,
      y,
      z,
    }

    setNodeData(prev => {
      if (!prev) return null
      return {
        ...prev,
        nodes: [...prev.nodes, newNode]
      }
    })
  }

  // ---------- Add Line ----------

  const handleAddLine = ([startNode, endNode]: [GraphNode, GraphNode]) => {

    const newLines: GraphEdge = {
      source: [startNode.x, startNode.y, startNode.z],
      target: [endNode.x, endNode.y, endNode.z]
    }

    setNodeData(prev => {
      if (!prev) return null
      return {
        ...prev,
        edges: [...prev.edges, newLines]
      }
    })
  }

  // ---------- Delete Node and Line ----------

  const handleDeleteItems = (items: {nodes: GraphNode[], edges: GraphEdge[] }) => {

    setNodeData(prev => {
      if (!prev) return null
      
      // Get the Deleted Nodes Coords
      const deletedNodeCoords = items.nodes.map(node =>
        `${node.x},${node.y},${node.z}`
      )

      return {
        ...prev,
        nodes: prev.nodes.filter(n =>
          !items.nodes.some(delNode => delNode.node_id.toString() === n.node_id.toString())
        ),
        edges: prev.edges.filter(edge => {
          const edgeSourceStr = edge.source.join(",")
          const edgeTargetStr = edge.target.join(",")

          const isSelectedEdge = items.edges.some(e =>
            e.source.join(",") === edgeSourceStr &&
            e.target.join(",") === edgeTargetStr
          )

          if (isSelectedEdge) return false // Remove Edge

          const connectsToDeletedNode = deletedNodeCoords.some(coords => // Removes Line Attached to a Deleted Node
            edgeSourceStr === coords || edgeTargetStr === coords
          )

          return !connectsToDeletedNode

        })
      }
    })
  }

  // ---------- Set Mind Map Title----------

  const [title, setTitle] = useState<string>("Untitled Mind Map")

  // ---------- Save Mind Maps ----------
  
  const handleSaveMindMap = async() => {
    if (!user) {
      alert("Please log in before saving!")
      return
    }

    try {
      const { error } = await supabase
        .from("mind_maps")
        .upsert({
          user_id: user.id,
          title: title,
          prompt: prompt,
          nodes: nodeData?.nodes,
          edges: nodeData?.edges
        }, {
          onConflict: "user_id,title"
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        alert("Saving Mind Map failed: " + error.message)
      }

      alert("Mind map saved successfully!")

    } catch (error) {
      alert("Saving Mind Map failed:" + error)
    }
  }

  // ---------- Load Mind Maps ----------
  
  const [currentMindMapId, setCurrentMindMapId] = useState<string | null>(null)

  useEffect(() => {
    const fetchMindMap = async () => {
        if (!currentMindMapId) {
            return;
        }

        const { data, error } = await supabase
            .from("mind_maps")
            .select("*")
            .eq("id", currentMindMapId)
            .single();

        if (error) {
            console.error("Supabase error:", error);
            alert("Error fetching Mind Map: " + error.message);
            return;
        }

        if (data) {
			setNodeData(null)  
			
			setNodeData({
				nodes: data.nodes,
				edges: data.edges
				})
				
			setTitle(data.title)
			setShowMindMapModal(false)
			setSelectedNode(null)
			setMode("exploring");
			setIsInputCollapsed(true)
        }
    };

    fetchMindMap();

  }, [currentMindMapId])

  // ---------- Export Mind Maps ----------

  const exportMindMap = useCallback(async (format: string) => {
      setMode("exporting")

      try {
        const response = await fetch("http://127.0.0.1:8002/api/export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
              "format": format,
              "title": title,
              "nodes": nodeData?.nodes,
              "edges": nodeData?.edges
            })
          })
        
          if (!response.ok) {
            throw new Error (`HTTP ERROR: ${response.status}`)
          }
          
          // Create a Download Link
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${title || "mindmap"}.${format === "deck" ? "pptx" : "docx"}`
          document.body.appendChild(a)
          a.click()

          // Cleanup
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)

      } catch (error) {
        console.error("Export failed:", error)
        alert("Failed to export. Please try again.")
      } finally {
        setMode("exploring")
      }
    }, [title, nodeData, setMode])

  useEffect(() => { //Export Deck
    
    const handleExportDeck = () => exportMindMap("deck")

    window.addEventListener("startExportingDeck", handleExportDeck)
    return () => window.removeEventListener("startExportingDeck", handleExportDeck)
  }, [exportMindMap])

  useEffect(() => { //Export Document
    
    const handleExportDocument = () => exportMindMap("document")

    window.addEventListener("startExportingDocument", handleExportDocument)
    return () => window.removeEventListener("startExportingDocument", handleExportDocument)
  }, [exportMindMap])


  return (
    <>
      <div className="app">
        <NavBar mode={mode} 
                setMode={setMode}
                user={user} 
                onLoginClick={openLoginModal} 
                onSignupClick={openSignupModal} 
                userProfileDropdownOpen={userProfileDropdownOpen} 
                userProfileDropdownClick={toggleUserProfileDropdown} 
                userProfileRef={userProfileRef} 
                onMindMapClick={openMindMapList}
                title={title}
                setTitle={setTitle}
         />
        <main className={`main-section ${mode === "exploring" ? "exploring" : ""}`} 
              onContextMenu={(e) => {
                e.stopPropagation()
                if (selectedNode) {
                  handleNodeDeselect()
                  handleLabelSubmit()
                  handleDescriptionlSubmit()
                }
                e.nativeEvent.preventDefault()
              }}>
			{
				(mode === "exporting" || mode === "updating") && <Spinner mode={mode}/>
			}
			{ mode !== "exploring" && mode !== "updating" && mode !== "exporting" && (
				<h1 className={mode === "thinking" ? "slide-up" : ""}>ThinkNode</h1>
			)}
			<div className={`canvas-wrapper ${selectedNode ? "shrink" : ""}`} onClick={closeModal}>
				<Canvas 
				camera={{ position: [10, 0, 10], fov: 40 }}
				>
				<group scale={1.1}>
					<Scene  mode={mode} 
							nodeData={nodeData} 
							updateNodeCoords={handleUpdateNodePosition} 
							selectedNode={selectedNode} 
							currentMindMapId={currentMindMapId} 
							addNewNode={handleAddNode} 
							addNewLine={handleAddLine}
							deleteItems={handleDeleteItems} />
				</group>
				</Canvas>
			</div>
			{ showAuthModal && <AuthModal defaultTab={defaultTab} close={closeModal} />}
			{ showMindMapModal && <MindMapModal mindMapListData={mindMapListData} setMindMapListData={setMindMapListData} setCurrentMindMapId={setCurrentMindMapId} />}
			{ mode === "idle" && <UserGuide />}
			
			{ (mode === "exploring" || mode === "updating" || mode === "exporting") && !selectedNode && <Toolkit onSave={handleSaveMindMap} />}
			{ (mode === "exploring" || mode === "updating" || mode === "exporting") && <ControlsGuide mode={mode} selectedNode={selectedNode} />}
			
			<div className={`node-panel ${selectedNode ? "active" : ""}`}>
				{selectedNode && (
				<div className="node-panel-content">
					<input 
					type="text"
					className="node-panel-label"
					value={editableLabel}
					onChange={(e) => setEditableLabel(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleLabelSubmit()}
					onBlur={handleLabelSubmit}
					/>
					<textarea 
					className="node-panel-description"
					value={editableDescription}
					onChange={(e) => setEditableDescription(e.target.value)}
					onBlur={handleDescriptionlSubmit}
					onPointerDown={(e) => e.stopPropagation()}
					/>
				</div>
				)}
			</div>
			{
				!selectedNode && (
				<InputBox 
					isCollapsed={isInputCollapsed}	
					onToggleCollapse={handleToggleInput}
					onSubmit={handleSubmit} 
					mode={mode}/>
				)
			}
        </main>
        <footer className="footer-wrapper">
          <div className={`footer ${mode === "thinking" ? "slide-down" : mode === "exploring" ? "slide-up-enter": ""}`}>
            <p>for inquiries, please email chihaos0629@gmail.com</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App

