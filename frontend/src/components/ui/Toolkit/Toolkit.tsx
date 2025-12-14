import saveIcon from "../../../assets/icons/Save.svg"
import addIcon from "../../../assets/icons/Add.svg"
import "./Toolkit.css"

interface ToolkitProps {
    onSave: () => void
}

export default function Toolkit({ onSave }: ToolkitProps) {

    return (
        <div className="toolkit">
            <img src={saveIcon} onClick={onSave}/>
            <img src={addIcon} />
        </div>
    )
}