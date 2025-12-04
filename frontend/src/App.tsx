import { useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import Scene from "./components/3d/Scene"
import InputBox from "./components/ui/InputBox/InputBox"
import './App.css'

type nodeDetail = {
  id: string
  label: string
  position: [number, number, number]
}

function App() {

  const [mode, setMode] = useState<"idle" | "thinking" | "exploring">("idle")
  const [selectedNode, setSelectedNode] = useState<nodeDetail | null>(null)
  
  // Prompt Passed to Backend
  const handleSubmit = async (prompt: string) => {
    console.log(prompt)
    setMode("thinking")

    try {
      const response = await fetch("http://127.0.0.1:8003/api/chat", {
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
        <nav className={`navbar ${mode === "thinking" ? "slide-up": mode === "exploring" ? "slide-down-enter": ""}`}>
          <ul className='nav-links'>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </nav>
        <main className={`main-section ${mode === "exploring" ? "exploring" : ""}`}>
          { mode !== "exploring" && (
            <h1 className={mode === "thinking" ? "slide-up" : ""}>ThinkNode</h1>
          )}
          <div className={`canvas-wrapper ${selectedNode ? "shrink" : ""}`}>
            <Canvas 
              onPointerMissed={handleNodeDeselect}
              camera={{ position: [10, 0, 10], fov: 40 }}
            >
              <group scale={1.1}>
                <Scene mode={mode} selectedNode={selectedNode} />
              </group>
            </Canvas>
          </div>
          <div className={`node-panel ${selectedNode ? "active" : ""}`}>
            {selectedNode && (
              <div className="node-panel-content">
                <h2>{selectedNode.label}</h2>
                <p>Details for Node ID: {selectedNode.id}</p>
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
            <p>2025 ThinkNode. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App

