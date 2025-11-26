import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import Scene from "./components/3d/Scene"
import InputBox from "./components/InputBox/InputBox"
import './App.css'

function App() {

  const [mode, setMode] = useState<"idle" | "thinking">("idle")
  
  return (
    <>
      <div className={`app ${mode === "thinking" ? "thinking" : ""}`}>
        <nav className={`navbar ${mode === "thinking" ? "slide-up":""}`}>
          <ul className='nav-links'>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </nav>
        <main className={`main-section ${mode === "thinking" ? "expand" : ""}`}>
          <h1 className={mode === "thinking" ? "slide-up" : ""}>ThinkNode</h1>
          <div className={`canvas-wrapper ${mode === "thinking" ? "expand": ""}`}>
            <Canvas camera={{ position: [10, 0, 10], fov: 40}}>
              <group scale={1.1}>
                <Scene mode={mode}/>
              </group>
            </Canvas>
          </div>
          <InputBox 
            onSubmit={() => setMode("thinking") } 
            mode={mode}/>
        </main>
        <footer className="footer-wrapper">
          <div className={`footer ${mode === "thinking" ? "slide-down" : ""}`}>
            <p>2025 ThinkNode. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App

