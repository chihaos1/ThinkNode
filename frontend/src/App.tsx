import { useState, useEffect, useRef, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { supabase } from "./util/supabase-client"
import Scene from "./components/3d/Scene"
import InputBox from "./components/ui/InputBox/InputBox"
import NavBar from "./components/ui/NavBar/NavBar"
import AuthModal from "./components/ui/Modals/AuthModal"
import MindMapModal from "./components/ui/Modals/MindMapModal"
import Toolkit from "./components/ui/Toolkit/Toolkit"
import ControlsGuide from "./components/ui/ControlsGuide/ControlsGuide"
import UserGuide from "./components/ui/UserGuide/UserGuide"
import type { GraphNode, GraphResponse } from "./models/Graph"
import type { MindMapItem } from "./models/MindMap"
import type { User } from "@supabase/supabase-js"
import './App.css'

type nodeDetail = {
  id: string
  label: string
  position: [number, number, number]
  description: string
}

function App() {

  const [mode, setMode] = useState<"idle" | "thinking" | "exploring">("idle")
  
  // Show Auth Modals

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

  // ---------- Listen for Session and Session Changes ----------
  
  const [user, setUser] = useState<User | null>(null)

  const fetchSession = async() => {
    const currentSession = await supabase.auth.getSession();
    setUser(currentSession.data.session?.user ?? null)
  }

  useEffect(() => {
    fetchSession()

    const { data: authListener} = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

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

  // ---------- Handle Mind Map Modal ----------
  
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

  // ---------- Prompt Passed to Backend ----------

  const [prompt, setPrompt] = useState<string>("")
  const [response, setResponse] = useState<GraphResponse | null >(null)

  const handleSubmit = async (prompt: string) => {
    
    setPrompt(prompt)
    setMode("thinking")

    try {
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
      setResponse(data)
      setMode("exploring")

    } catch (error) {
      
      setMode("idle")
      const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again"
      alert(errorMessage)
    }
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
    if (!response) return

    const updatedNodes = response.nodes.map(node =>
      node.node_id === nodeId
        ? {...node, ...updates}
        : node
    )

    setResponse({
      ...response,
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

  // ---------- Set Mind Map Title----------

  const [title, setTitle] = useState<string>("Untitled Mind Map")

  // ---------- Save Mind Maps ----------
  
  const handleSaveMindMap = async() => {
    if (!user) {
      alert("Please log in before saving!")
      return
    }

    try {
      const { data, error } = await supabase
        .from("mind_maps")
        .insert({
          user_id: user.id,
          title: title,
          prompt: prompt,
          nodes: response?.nodes,
          edges: response?.edges
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        alert("Saving Mind Map failed: " + error.message)
      }

      console.log("Saved successfully:", data)
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
            setResponse({
              nodes: data.nodes,
              edges: data.edges
            })
            
            setTitle(data.title)
            setShowMindMapModal(false)
            setSelectedNode(null)
            setMode("exploring");
        }
    };

    fetchMindMap();

  }, [currentMindMapId])

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
        <main className={`main-section ${mode === "exploring" ? "exploring" : ""}`} >
          { mode !== "exploring" && (
            <h1 className={mode === "thinking" ? "slide-up" : ""}>ThinkNode</h1>
          )}
          <div className={`canvas-wrapper ${selectedNode ? "shrink" : ""}`} onClick={closeModal}>
            <Canvas 
              onPointerMissed={handleNodeDeselect}
              camera={{ position: [10, 0, 10], fov: 40 }}
            >
              <group scale={1.1}>
                <Scene mode={mode} nodeData={response} selectedNode={selectedNode} />
              </group>
            </Canvas>
          </div>
          { showAuthModal && <AuthModal defaultTab={defaultTab} close={closeModal} />}
          { showMindMapModal && <MindMapModal mindMapListData={mindMapListData} setMindMapListData={setMindMapListData} setCurrentMindMapId={setCurrentMindMapId} />}
          { mode === "idle" && <UserGuide />}
          
          { mode === "exploring" && !selectedNode && <Toolkit onSave={handleSaveMindMap} />}
          { mode === "exploring" && !selectedNode && <ControlsGuide />}
          
          <div className={`node-panel ${selectedNode ? "active" : ""}`}>
            {selectedNode && (
              <div className="node-panel-content">
                {/* <h2>{selectedNode.label}</h2> */}
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
                />

                {/* <div className="node-panel-description">
                  <p>{selectedNode.description}</p>
                </div> */}
              </div>
            )}
          </div>
          {mode !== "exploring" && (
            <InputBox 
              onSubmit={handleSubmit} 
              mode={mode}/>
          )}
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

