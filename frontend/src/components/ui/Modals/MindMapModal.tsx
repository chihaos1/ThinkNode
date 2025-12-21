import { useState } from "react"
import { supabase } from "../../../util/supabase-client"
import DeleteIcon from "../../../assets/icons/Delete.svg"
import type { MindMapItem } from "../../../models/MindMap"
import "./MindMapModal.css"


interface MindMapModalProps {
    mindMapListData: MindMapItem[] | null
    setMindMapListData: (data: MindMapItem[] | null) => void
    setCurrentMindMapId: (id: string) => void
}

export default function MindMapModal({ mindMapListData, setMindMapListData, setCurrentMindMapId }: MindMapModalProps) {
    
    // ---------- Format Date from Supabase ----------
    
    const formatDate = (timestamp: string): string => {
        const cleanedString = timestamp.replace(" ", "T")
        const finalIsoString = cleanedString.substring(0, cleanedString.lastIndexOf("+")) + "Z"
        const date = new Date(finalIsoString)

        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        const formatted = date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/New_York',
            timeZoneName: 'shortOffset'
        })
        
        return formatted
    }

    // ---------- Delete Mind Map ----------
    
    const handleDeleteMindMap = async (id: string, e: React.MouseEvent) => {

        e.stopPropagation()
        
        const { error } = await supabase
            .from("mind_maps")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Supabase deletion error:", error);
            alert("Deletion failed: " + error.message);
            return;
        }

        setMindMapListData(mindMapListData?.filter(item => item.id != id) || null)

    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Mind Maps</h2>
                <div className="mindmap-wrapper">
                    <ul className="mindmap-menu-list">
                        {
                            mindMapListData?.map((item: MindMapItem) => (
                                <li
                                    key={item.id}
                                    onClick={() => setCurrentMindMapId(item.id)}>
                                    <div className="item" >
                                        <div className="item-title">{item.title}</div>
                                        <div className="item-created-date" >{formatDate(item.created_at)}</div>
                                    </div>
                                    <div className="delete-icon" onClick={(e) => handleDeleteMindMap(item.id, e)}>
                                        <img src={DeleteIcon} />
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}
