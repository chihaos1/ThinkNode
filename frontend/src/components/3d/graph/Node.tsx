import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import type { GraphNode } from "../../../models/Graph"
import * as THREE from "three"
import './Node.css'

interface NodeProps {
    node: GraphNode
    color?: string
    isDragging?: boolean
    isAddingNode?: boolean
    isAddingLine?: boolean
    addLine: (node: GraphNode) => void
    isDeleting?: boolean
    deleteObj: (node: GraphNode) => void
    isSelectedForAddLine?: boolean
    isSelectedForDelete?: boolean
}

export default function Node({  
                                node,
                                color = "#705d42", 
                                isDragging,
                                isAddingNode, 
                                isAddingLine,
                                addLine,
                                isDeleting,
                                deleteObj,
                                isSelectedForAddLine,
                                isSelectedForDelete}: NodeProps) {
    
    const { gl } = useThree()

    const id = node.node_id
    const label = node.label
    const position = [node.x, node.y, node.z]
    const description = node.description

    // Cursor Changes

    const handlePointerOver = () => {
        if (isAddingLine || isAddingNode || isDeleting) return
        gl.domElement.style.cursor = "pointer"
    }

    // Determine If Node should be Clickable

    const handleClick = () => {
        if (isAddingLine) {
            addLine(node)
            return
        }

        if (isDeleting) {
            deleteObj(node)
            return
        }

        if (isDragging) {
            return
        }
        
        dispatchClick() 
    }

    const dispatchClick = () => {
        
        window.dispatchEvent(new CustomEvent("node-clicked", {
            detail: { id, label, position, description }
        }))
    }

    return (
        <>
            <mesh 
                onPointerOver={handlePointerOver}
                onClick={handleClick} 
            >
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshBasicMaterial 
                    color="#C5C2A8"
                    transparent 
                    opacity={0.02}
                />
            </mesh>
            <lineSegments>
                <edgesGeometry args={[new THREE.SphereGeometry(0.58, 8, 8)]} />
                <lineBasicMaterial color={color} transparent opacity={0.9} />
            </lineSegments>

            {isAddingLine && (
                <mesh>
                <sphereGeometry args={[0.65, 8, 8]} />
                <meshBasicMaterial  color={isSelectedForAddLine ? "#cabf66" :"#cac6a6"}
                                    transparent 
                                    opacity={0.3} />
                </mesh>
            )}

            {isDeleting && (
                <mesh>
                <sphereGeometry args={[0.65, 8, 8]} />
                <meshBasicMaterial  color={isSelectedForDelete ? "#ff0000" :"#cac6a6"}
                                    transparent 
                                    opacity={0.3} />
                </mesh>
            )}

            <Html 
                center
                distanceFactor={12}
                style={{ pointerEvents: 'none' }}
            >
                <div className="node-label">{label}</div>
            </Html>
        </>
    )}










