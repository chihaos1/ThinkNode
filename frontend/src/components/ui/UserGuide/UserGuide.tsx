import { useState } from "react"
import "./UserGuide.css"

export default function UserGuide() {
    
    const [isExpanded, setIsExpanded] = useState<boolean>(false)

    const toggleExpanded = () => {
        console.log(isExpanded)
        if (!isExpanded) {
            setIsExpanded(true)
        }
        
        if (isExpanded) {
            setIsExpanded(false)
        }
    }
    
    return (
        <div className={`user-guide ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="user-guide-header" onClick={toggleExpanded}>
                <h3>How ThinkNode Works </h3>
                <span className="toggle-icon">{isExpanded ? '-' : '+'}</span>
            </div>
            {
                isExpanded && (
                    <div className="user-guide-content">
                        <strong>1. Ask a Question</strong>
                        <p>
                            Type any topic you want to learn or explore—from "How to learn guitar" 
                            to "Explain quantum physics."
                        </p>
                        <strong>2. AI Generates Your Map</strong>
                        <p>
                            Claude AI breaks down complex topics into clear, interconnected concepts 
                            positioned in 3D space.
                        </p>
                        <strong>3. Explore & Understand</strong>
                        <p>
                            Navigate your personalized mind map in 3D. Click nodes to see details, 
                            rotate to explore connections, and discover learning paths.
                        </p>
                    </div>
                )
            }
            
            


        </div>
    )
}