import "./NavBar.css"

interface NavBarProps {
    mode: "idle" | "thinking" | "exploring"
    onLoginClick: () => void
    onSignupClick: () => void
}

export default function NavBar({ mode, onLoginClick, onSignupClick }: NavBarProps) {

    return (
        <nav className={`navbar ${mode === "thinking" ? "slide-up": mode === "exploring" ? "slide-down-enter": ""}`}>
          <ul className='nav-links'>
            <li className="login" onClick={onLoginClick}>Log In</li>
            <li className="signup" onClick={onSignupClick}>Sign Up</li>
          </ul>
        </nav>
    )
}