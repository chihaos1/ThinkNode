import "./ControlsGuide.css"
import RightClick from "../../../assets/icons/RightClick.png";
import LeftClick from "../../../assets/icons/LeftClick.png";
import ScrollWheel from "../../../assets/icons/ScrollWheel.png";
import SaveIcon from "../../../assets/icons/Save.svg"
import MoveIcon from "../../../assets/icons/Move.png"
import ExpandIcon from "../../../assets/icons/Expand.png"
import type { nodeDetail } from "../../../models/Graph"
import type { Mode } from "../../../models/Mode"

interface ControlsGuideProps {
    mode: Mode
    selectedNode: nodeDetail | null
}

export default function ControlsGuide( { mode, selectedNode }: ControlsGuideProps) {
    return (
        <div className="controls-guide-wrapper">
            {
                (mode === "exploring" || mode === "updating" || mode === "exporting") && !selectedNode && (
                    <div className="controls-guide">
                        <h3>Node</h3>
                        <div className="control-item">
                            <span className="control-icon">
                                <img 
                                    src={ExpandIcon} 
                                    alt="Expand Icon" 
                                    className="control-img expand-icon-specific" 
                                />
                            </span>
                            <div className="control-text">
                                <strong>Left Click</strong>
                                <small>Expand the node</small>
                            </div>
                        </div>
                        <div className="control-item">
                            <span className="control-icon">
                                <img 
                                    src={MoveIcon} 
                                    alt="Move Icon" 
                                    className="control-img" 
                                />
                            </span>
                            <div className="control-text">
                                <strong>Left Click + Drag</strong>
                                <small>Select and Move the node</small>
                            </div>
                        </div>
                    </div>  
                )
            }
            {
                (mode === "exploring" || mode === "updating" || mode === "exporting") && !selectedNode && (
                    <div className="controls-guide">
                        <h3>Navigation</h3>
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
            {
                mode === "exploring" && selectedNode && (
                    <div className="controls-guide">
                        <h3>Controls</h3>
                        <div className="control-item">
                            <span className="control-icon">
                                <img 
                                    src={RightClick} 
                                    alt="Right Click Icon" 
                                    className="control-img" 
                                />
                            </span>
                            <div className="control-text">
                                <strong>Right Click</strong>
                                <small>Close Panel</small>
                            </div>
                        </div>
                        <div className="control-item">
                            <span className="control-icon">
                                <img 
                                    src={LeftClick} 
                                    alt="Edit Icon" 
                                    className="control-img" 
                                />
                            </span>
                            <div className="control-text">
                                <strong>Left Click</strong>
                                <small>Edit Title and Description</small>
                            </div>
                        </div>
                        <div className="control-item">
                            <span className="control-icon">
                                <img 
                                    src={SaveIcon} 
                                    alt="Save Icon" 
                                    className="control-img" 
                                />
                            </span>
                            <div className="control-text">
                                <strong>Save</strong>
                                <small>Changes are Saved on Exit</small>
                            </div>
                        </div>
                    </div>  
                )
            }
            
        </div>
        
        
        
    )
}