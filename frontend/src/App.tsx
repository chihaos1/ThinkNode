import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { supabase } from "./util/supabase-client"
import Scene from "./components/3d/Scene"
import InputBox from "./components/ui/InputBox/InputBox"
import NavBar from "./components/ui/NavBar/NavBar"
import Modal from "./components/ui/Modals/Modal"
import ControlsGuide from "./components/ui/ControlsGuide/ControlsGuide"
import UserGuide from "./components/ui/UserGuide/UserGuide"
import type { GraphResponse } from "./models/Graph"
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
  const [response, setResponse] = useState<GraphResponse | null>(null)
  const [selectedNode, setSelectedNode] = useState<nodeDetail | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [defaultTab, setDefaultTab] = useState<"login" | "signup">("login")
  const [user, setUser] = useState<User | null>(null)
  
  // Show Auth Modals
  const openLoginModal = () => {
    setDefaultTab("login")
    setShowAuthModal(true)
  }

  const openSignupModal = () => {
    setDefaultTab("signup")
    setShowAuthModal(true)
  }

  const closeAuthModal = () => {
    setShowAuthModal(false)
  }

  // Listen for Session and Session Changes
  const fetchSession = async() => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession)
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

  // Prompt Passed to Backend
  const handleSubmit = async (prompt: string) => {
    console.log(prompt)
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
      console.log(data)
      setMode("exploring")

    } catch (error) {
      
      setMode("idle")
      const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again"
      alert(errorMessage)
    }

  }

  // Node Select and Deselect
  useEffect(() => {
    const handleNodeSelect = (e: any) => {
      setSelectedNode(e.detail)
    }
    window.addEventListener("node-clicked", handleNodeSelect)
    return () => window.removeEventListener("node-clicked", handleNodeSelect)
  }, [])

  const handleNodeDeselect = () => {
    setSelectedNode(null)
  }

  return (
    <>
      <div className="app">
        <NavBar mode={mode} user={user} onLoginClick={openLoginModal} onSignupClick={openSignupModal} />
        <main className={`main-section ${mode === "exploring" ? "exploring" : ""}`} >
          { mode !== "exploring" && (
            <h1 className={mode === "thinking" ? "slide-up" : ""}>ThinkNode</h1>
          )}
          <div className={`canvas-wrapper ${selectedNode ? "shrink" : ""}`} onClick={closeAuthModal}>
            <Canvas 
              onPointerMissed={handleNodeDeselect}
              camera={{ position: [10, 0, 10], fov: 40 }}
            >
              <group scale={1.1}>
                <Scene mode={mode} nodeData={response} selectedNode={selectedNode} />
              </group>
            </Canvas>
          </div>
          { showAuthModal && <Modal defaultTab={defaultTab} close={closeAuthModal} />}

          { mode === "exploring" && !selectedNode && <ControlsGuide />}
          { mode === "idle" && <UserGuide />}
          <div className={`node-panel ${selectedNode ? "active" : ""}`}>
            {selectedNode && (
              <div className="node-panel-content">
                <h2>{selectedNode.label}</h2>
                <p>{selectedNode.description}</p>
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
            <p>for any questions, please email chihaos0629@gmail.com</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App

