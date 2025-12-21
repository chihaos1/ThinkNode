import cancelIcon from "../../../assets/icons/Cancel.png"
import confirmIcon from "../../../assets/icons/Confirm.png"
import "./Demolish.css"

interface DemolishProps {
    setClickedDelete: (value: boolean) => void
}

export default function Demolish({ setClickedDelete }: DemolishProps) {
    
    // Notify Confirm Deletion
    
    const handleConfirm = () => { 
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.style.cursor = "default"
      } 

      window.dispatchEvent(new CustomEvent("confirmDelete"))
    }

    // Notify Cancel Deletion
    
    const handleCancel = () => { 
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.style.cursor = "default"
      } 

      window.dispatchEvent(new CustomEvent("cancelDelete"))
    }

    const handleCancelAndClose = () => {
        setClickedDelete(false)
        handleCancel()
    }


    return (
        <div className="delete-function-wrapper">
            <div 
                className="confirm-delete-wrapper"
                onClick={handleConfirm}
            >
                <img src={confirmIcon} />
                <p>Confirm</p>
            </div>
            <hr />
            <div 
                className="cancel-delete-wrapper"
                onClick={handleCancelAndClose}
            >
                <img src={cancelIcon} />
                <p>Cancel</p>
            </div>
        </div>
    )
}