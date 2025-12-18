import { forwardRef, useRef } from "react"
import { Html } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import './Node.css'

interface NodeProps {
    id: string
    position: [number, number, number]
    label: string
    description: string
    isSelected: boolean
    color?: string
    isDragging?: boolean
}

const Node = forwardRef<THREE.Group, NodeProps>(({
    id,
    position,
    label,
    description,
    isSelected = false,
    color = "#705d42",
    isDragging
}, ref) => {
    
    const localRef = useRef<THREE.Group>(null)
    const groupRef = (ref as React.MutableRefObject<THREE.Group> || localRef)
    const { gl } = useThree()

    // Cursor Changes
    const handlePointerOver = () => {
        gl.domElement.style.cursor = "pointer"
    }

    // Determine If Click or Drag
    const handleClick = () => {

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

    // Hovering Effect for Selected Node
    // useFrame(({ clock }) => {
    //     if (groupRef.current && isSelected) {
    //         const hoverValue = Math.sin(clock.getElapsedTime() * 2) * 0.05
    //         groupRef.current.position.y = position[1] + hoverValue
    //     }
    //     if (groupRef.current && !isSelected && groupRef.current.position.y !== position[1]) {
    //         groupRef.current.position.y = position[1]
    //     } 
    // })

    return (
        <group 
            ref={groupRef} 
        >
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
            <Html 
                center
                distanceFactor={12}>
                <div className="node-label">{label}</div>
            </Html>
        </group>
    )

})

export default Node










