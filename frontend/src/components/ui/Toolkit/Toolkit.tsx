import { useState, useEffect, useRef } from "react"
import Add from "./Add/Add"
import Demolish from "./Demolish/Demolish"
import Export from "./Export/Export"
import "./Toolkit.css"
import saveIcon from "../../../assets/icons/Save.svg"
import addIcon from "../../../assets/icons/Add.png"
import deleteIcon from "../../../assets/icons/Minus.png"
import exportIcon from "../../../assets/icons/EXPORT.png"

interface ToolkitProps {
    onSave: () => void
}

export default function Toolkit({ onSave }: ToolkitProps) {

    // ---------- Handle Adding Nodes and Lines ---------- 
    
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
    
    // ---------- Handle Deleting Nodes and Lines ---------- 

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

	// ---------- Handle Exporting Mind Map ---------- 

    const [clickedExport, setClickedExport] = useState<boolean>(false)
    const exportRef = useRef<HTMLDivElement | null>(null)

	const handleExport = () => {
		setClickedExport(true)
		setClickedDelete(false)
		window.dispatchEvent(new CustomEvent("cancelDelete"))
	}

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          if (exportRef.current && !exportRef.current.contains(e.target as Node))
            setClickedExport(false)
        }
    
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      } , [])

    return ( 
        <div className="toolkit-wrapper" data-menu-open={clickedAdd || clickedDelete || clickedExport}>
			<div className="toolkit" >
				<p>Node</p>
				<div className="add-wrapper" ref={addRef}>
					<div 
						className="image-wrapper" 
						data-tooltip="Add nodes and lines"
					>
						<img src={addIcon} onClick={handleAdd} />
					</div>
					{
						clickedAdd && <Add />
					}
				</div>
				<div className="demolish-wrapper" ref={deleteRef}>
					<div 
						className="image-wrapper" 
						data-tooltip="Remove nodes and lines">
						<img src={deleteIcon} onClick={handleDelete}/>
					</div>
					{
						clickedDelete && <Demolish setClickedDelete={setClickedDelete}/>
					}
				</div>
			</div>
			<div className="toolkit">
				<p className="utility-text">Utility</p>
				<div 
					className="save-wrapper"
					>
					<div 
						className="image-wrapper"
						data-tooltip="Save mind map"
					>
						<img src={saveIcon} onClick={onSave}/>
					</div>
				</div>
				<div className="export-wrapper" ref={exportRef}>
					<div 
						className="image-wrapper"
						data-tooltip="Export mind map"
					>
						<img src={exportIcon} onClick={handleExport}/>
					</div>
					{
						clickedExport && <Export />
					}
				</div>
			</div>
        </div>
    )
}