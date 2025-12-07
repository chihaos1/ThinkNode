import { useState } from "react"
import "./Modal.css"

interface ModalProps {
  defaultTab: "login" | "signup" 
}

export default function Modal({defaultTab}: ModalProps) {
    
    const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    // Log In 
    const handleLogIn = async (e: React.FormEvent) => {
        e.preventDefault()


        console.log("Sign in:", {email, password})

    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="tab-container">
                    <button
                        className={`tab ${activeTab === "login" ? "active" : ""}`}
                        onClick={() => setActiveTab("login")}
                    >
                    Log In
                    </button>
                    <button
                        className={`tab ${activeTab === "signup" ? "active" : ""}`}
                        onClick={() => setActiveTab("signup")}
                    >
                    Sign Up
                    </button>
                </div>
                {
                    activeTab === "login" && (
                        <form className="auth-form" onSubmit={handleLogIn}>
                            <h2>Welcome Back</h2>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button className="submit-btn" type="submit">Log In</button>
                        </form>
                    )
                }
            </div>
        </div>
    )
}