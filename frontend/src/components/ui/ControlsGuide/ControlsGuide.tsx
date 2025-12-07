import "./ControlsGuide.css"
import RightClick from "../../../assets/icons/RightClick.png";
import LeftClick from "../../../assets/icons/LeftClick.png";
import ScrollWheel from "../../../assets/icons/ScrollWheel.png";

export default function ControlsGuide() {
    return (
        <div className="controls-guide">
            <h4>Controls</h4>
            <div className="control-item">
                <span className="control-icon">
                    <img 
                        src={RightClick} 
                        alt="Right Click Icon" 
                        className="control-img" 
                    />
                </span>
                <div className="control-text">
                    <strong>Right Click + Drag</strong>
                    <small>Pan Camera</small>
                </div>
            </div>
            <div className="control-item">
                <span className="control-icon">
                    <img 
                        src={LeftClick} 
                        alt="Left Click Icon" 
                        className="control-img" 
                    />
                </span>
                <div className="control-text">
                    <strong>Left Click + Drag</strong>
                    <small>Rotate Camera</small>
                </div>
            </div>
            <div className="control-item">
                <span className="control-icon">
                    <img 
                        src={ScrollWheel} 
                        alt="Scroll Wheel Icon" 
                        className="control-img" 
                    />
                </span>
                <div className="control-text">
                    <strong>Scroll Wheel</strong>
                    <small>Zoom In/Out</small>
                </div>
            </div>
        </div>
    )
}