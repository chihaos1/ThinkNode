import type { User } from "@supabase/supabase-js"
import "./NavBar.css"

interface NavBarProps {
    mode: "idle" | "thinking" | "exploring"
    user: User | null
    onLoginClick: () => void
    onSignupClick: () => void
}

export default function NavBar({ mode, user, onLoginClick, onSignupClick }: NavBarProps) {

    return (
        <nav className={`navbar ${mode === "thinking" ? "slide-up": mode === "exploring" ? "slide-down-enter": ""}`}>
          <ul className='nav-links'>
            <li className="login" onClick={onLoginClick}>Log In</li>
            <li className="signup" onClick={onSignupClick}>Sign Up</li>
          </ul>
        </nav>
    )
}