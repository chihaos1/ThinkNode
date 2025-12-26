import sphereIcon from "../../../../assets/icons/Sphere.png"
import lineIcon from "../../../../assets/icons/Line.png"
import "./Add.css"

export default function Add() {
    
    const handleNodeAdd = () => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.style.cursor = "crosshair"
      } 

      window.dispatchEvent(new CustomEvent("startAddingNode"))
    }

    const handleLineAdd = () => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.style.cursor = "crosshair"
      }
      
      window.dispatchEvent(new CustomEvent("startAddingLine"))
    }

    return (
        <div className="add-function-wrapper">
            <div className="add-node-wrapper" onClick={handleNodeAdd}>
                <img src={sphereIcon} />
                <p>Node</p>
            </div>
            <hr />
            <div className="add-line-wrapper" onClick={handleLineAdd}>
                <img src={lineIcon} />
                <p>Line</p>
            </div>
        </div>
    )
}