import type { Mode } from "../../../models/Mode"
import "./Spinner.css"

interface SpinnerProps {
    mode: Mode
}

export default function Spinner({ mode }: SpinnerProps) {
    return (
        <div className="loading-overlay">
            <div className="spinner-container">
                <div className="spinner"></div>
                { mode === "updating" && <p className="loading-text">Updating Mind Map...</p> }
                { mode === "exporting" && <p className="loading-text">Exporting Mind Map...</p> }
            </div>
        </div>
    )
}