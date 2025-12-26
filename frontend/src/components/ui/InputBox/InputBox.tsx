import { useState } from "react"
import type { Mode } from "../../../models/Mode"
import ChatBoxIcon from "../../../assets/icons/ChatBox.png"
import UpArrowIcon from "../../../assets/icons/UpArrow.svg"
import DownArrowIcon from "../../../assets/icons/DownArrow.svg"
import "./InputBox.css"   // ← create this file

interface InputBoxProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSubmit: (prompt: string) => void
  mode: Mode
}

export default function InputBox({ onSubmit, mode, isCollapsed, onToggleCollapse }: InputBoxProps) {
  
  const [prompt, setPrompt] = useState<string>("")

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt)
      setPrompt("")
    }
  }

  const inputBarClasses = [
    "input-bar",
    mode === "thinking" && "slide-down",
    mode === "exploring" && "exploring",
    isCollapsed ? "collapsed" : "expanded"
  ].filter(Boolean).join(" ")

  return (
    <>
      {
        (mode === "exploring" || mode === "updating" || mode === "exporting") && (
          <button
            className={`input-toggle-btn ${isCollapsed ? "collapsed" : "expanded"}`}
            onClick={onToggleCollapse}
          >
            {
              isCollapsed ? (
                <img className="arrow-img" src={UpArrowIcon}/>
              ) : (
                <img className="arrow-img" src={DownArrowIcon}/>
              )
            }
            <img className="chatbox-img" src={ChatBoxIcon}/>
          </button>
        ) 
      }
      {
        (mode === "idle" || !isCollapsed) && (
          <div className={inputBarClasses}>
            <input
              type="text"
              placeholder={mode === "idle" ? "Ask Claude Anything..." : "Ask Claude to Update (Add, Modify, Delete, Create New)..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button onClick={() => handleSubmit()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )
      }
      
    </>
  )
}

