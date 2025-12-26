import { supabase } from "../../../util/supabase-client"
import userProfileImage from "../../../assets/icons/UserProfile.svg"
import goBackIcon from "../../../assets/icons/GoBack.svg"
import MindMapList from "../../../assets/icons/MindMapList.svg"
import type { User } from "@supabase/supabase-js"
import type { RefObject } from "react"
import type { Mode } from "../../../models/Mode"
import "./NavBar.css"

interface NavBarProps {
    mode: Mode
    setMode: React.Dispatch<React.SetStateAction<Mode>>
    user: User | null
    onLoginClick: () => void
    onSignupClick: () => void
    userProfileDropdownOpen: boolean
    userProfileDropdownClick: () => void
    userProfileRef: RefObject<HTMLDivElement | null>
    onMindMapClick: () => void
    title: string
    setTitle: (title: string) => void
}

export default function NavBar({  mode, setMode, user, onLoginClick, onSignupClick, 
                                  userProfileDropdownOpen, userProfileDropdownClick, userProfileRef,
                                  onMindMapClick, title, setTitle 
                                }: NavBarProps) {
    
    // ---------- Handle Sign Outs ----------

    const handleSignOut = async() => {
      try {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          alert("Sign-out exception: " +  error)
        }

      } catch (e) {
        alert("Sign-out exception: " + e)
      }
    }

    // ---------- Handle Focus and Blur on Input ----------
    
    const handleFocus = () => {
      if (title === "Untitled Mind Map") {
        setTitle("")
      }
    }

    const handleBlur = () => {
      if (!title) {
          setTitle("Untitled Mind Map");
      }
    };

    return (
        <nav className={`navbar ${mode === "thinking" ? "slide-up": mode === "exploring" ? "slide-down-enter": ""}`}>
          
          {
            (mode !== "exploring" && mode !== "updating" && mode !== "exporting") && (
              <div className="navbar-spacer" />
            )
          }
          {
            (mode === "exploring" || mode === "updating" || mode === "exporting") && (
              <>
                <div className="navbar-goback">
                  <img src={goBackIcon} onClick={() => setMode("idle")}/>
                </div>
                <div className="mindmap-title">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoComplete="off"
                  >
                  </input>
                </div>
              </>
            )
          }
          
          <ul className='nav-links'>
            {
              !user ? (
                <>
                  <li className="login" onClick={onLoginClick}>Log In</li>
                  <li className="signup" onClick={onSignupClick}>Sign Up</li>
                </>
              ) : (
                <>
                  <li className="mindmap-list" >
                    <img src={MindMapList} onClick={onMindMapClick}/>
                  </li>
                  <li className="user-profile" onClick={userProfileDropdownClick}>
                    <img src={userProfileImage} />
                    {
                      userProfileDropdownOpen && (
                        <div className="dropdown-menu" ref={userProfileRef}>
                          <div className="dropdown-email">{user.email}</div>
                          <button className="dropdown-logout" 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSignOut()}}>Sign Out</button>
                        </div>
                      )
                    }
                  </li>
                </>
              )
            }
          </ul>
        </nav>
    )
}


