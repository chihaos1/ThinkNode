import { useState } from "react"
import { supabase } from "../../../util/supabase-client"
import "./AuthModal.css"

interface ModalProps {
    close: () => void
    defaultTab: "login" | "signup" 
}

export default function AuthModal({close, defaultTab}: ModalProps) {
    
    const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab)
    const [loading, setLoading] = useState<boolean>(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")


    // Log In to Supabase with Email
    const handleLogIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email,
                password
            })
            
            if (error) {
                alert("Error signing in: " + error.message)
                return
            }

            close()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }   
    }

    // Log In with Google
    const handleGoogleLogIn = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin
                }
            })
            console.log(data)

            if (error) {
                alert("Error signing in: " + error.message)
                return
            }
        } catch (error: any) {
            alert(error.message)
        }
    }

    // Sign Up to Supabase with Email
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password != confirmPassword) {
            alert("Passwords didn't match!")
            return
        }

        setLoading(true)
        
        try {
            const {data, error} = await supabase.auth.signUp({
                email, 
                password, 
                options: {
                    emailRedirectTo: window.location.origin
                }
            })
            
            if (error) {
                alert("Error signing up: " + error.message)
                return
            }

            if (data.user && data.user.identities && data.user.identities.length === 0) {
                alert("This email is already registered. Check your inbox for verification link")
            } else {
                alert("Check your email for verification link")
            }
            close()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }   
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
                        <>
                            <div className="auth-form-wrapper">
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
                                    <button className="submit-btn" type="submit">{loading ? "Logging In..." : "Log In"}</button>
                                    <hr className="separator-line" />
                                </form>
                                <div className="oauth-btn-wrapper">
                                    <span>Alternative Login</span>
                                    <button className="oauth-btn-google" type="submit" onClick={handleGoogleLogIn}>
                                        <svg className="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                            </div>
                        </>
                    )
                }
                {
                    activeTab === "signup" && (
                        <>
                            <div className="auth-form-wrapper">
                                <form className="auth-form" onSubmit={handleLogIn}>
                                    <h2>Create Account</h2>
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
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <button className="submit-btn" type="submit" onClick={handleSignUp}>{loading ? "Signing Up..." : "Sign Up"}</button>
                                    <hr className="separator-line" />
                                </form>
                                <div className="oauth-btn-wrapper">
                                    <span>Alternative Sign Up</span>
                                    <button className="oauth-btn-google" type="submit" onClick={handleGoogleLogIn}>
                                        <svg className="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    )
}