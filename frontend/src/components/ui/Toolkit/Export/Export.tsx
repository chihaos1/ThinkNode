import DeckIcon from "../../../../assets/icons/PPT.png"
import DocxIcon from "../../../../assets/icons/Docx.png"
import "./Export.css"

export default function Export() {
    
    const handleExportDeck = () => {
        window.dispatchEvent(new CustomEvent("startExportingDeck"))
    }
    
    const handleExportDocument = () => {
        window.dispatchEvent(new CustomEvent("startExportingDocument"))
    }

    return (
        <div className="export-function-wrapper">
            <div className="export-deck-wrapper" onClick={handleExportDeck}>
                <img src={DeckIcon} />
                <p>.ppt</p>
            </div>
            <hr />
            <div className="export-docx-wrapper" onClick={handleExportDocument}>
                <img src={DocxIcon} />
                <p>.docx</p>
            </div>
        </div>
    )
}