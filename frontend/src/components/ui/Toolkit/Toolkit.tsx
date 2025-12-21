import { useState, useEffect, useRef } from "react"
import Add from "./Add"
import Demolish from "./Demolish"
import "./Toolkit.css"
import saveIcon from "../../../assets/icons/Save.svg"
import addIcon from "../../../assets/icons/Add.svg"
import demolishIcon from "../../../assets/icons/Demolish.png"

interface ToolkitProps {
    onSave: () => void
}

export default function Toolkit({ onSave }: ToolkitProps) {

    // Handle Adding Nodes and Lines
    
    const [clickedAdd, setClickedAdd] = useState<boolean>(false)
    const addRef = useRef<HTMLDivElement | null>(null)
    
    const handleAdd = () => {
      setClickedAdd(true)
      setClickedDelete(false)
      window.dispatchEvent(new CustomEvent("cancelDelete"))
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          if (addRef.current && !addRef.current.contains(e.target as Node))
            setClickedAdd(false)
        }
    
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      } , [])
    
    // Handle Deleting Nodes and Lines

    const [clickedDelete, setClickedDelete] = useState<boolean>(false)
    const deleteRef = useRef<HTMLDivElement | null>(null)

    const handleDelete = () => {
      setClickedDelete(true)
        const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.style.cursor = "crosshair"
      }
      
      window.dispatchEvent(new CustomEvent("startDeleting"))
    }

    useEffect(() => { // Listens to Confirmed Deletes and Closes the Delete Toolkit
      const handleCompletedDelete = () => {
        setClickedDelete(false)
      }

      window.addEventListener("completedDelete", handleCompletedDelete)

      return () => {
        window.removeEventListener('completedDelete', handleCompletedDelete)
      }
    }, [])

    return (
        <div className="toolkit">
            <div className="save-wrapper">
                <div className="image-wrapper">
                    <img src={saveIcon} onClick={onSave}/>
                </div>
            </div>
            <div className="add-wrapper" ref={addRef}>
                <div className="image-wrapper">
                    <img src={addIcon} onClick={handleAdd}/>
                </div>
                {
                    clickedAdd && <Add />
                }
            </div>
            <div className="demolish-wrapper" ref={deleteRef}>
                <div className="demolish-image-wrapper">
                    <img    src={demolishIcon} 
                            onClick={handleDelete}/>
                </div>
                {
                    clickedDelete && <Demolish setClickedDelete={setClickedDelete}/>
                }
            </div>
            
            
        </div>
    )
}