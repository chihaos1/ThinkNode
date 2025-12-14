import { useState } from "react"
import "./InputBox.css"   // ← create this file

interface InputBoxProps {
  onSubmit: (prompt: string) => void
  mode: "idle" | "thinking" | "exploring"
}

export default function InputBox({ onSubmit, mode }: InputBoxProps) {
  
  const [prompt, setPrompt] = useState<string>("")

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt)
      setPrompt("")
    }
  }

  return (
    <div className={`input-bar ${mode === "thinking" ? "slide-down" : ""}`}>
      <input
        type="text"
        placeholder="Ask Claude anything..."
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