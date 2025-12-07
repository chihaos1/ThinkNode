import { useRef } from "react"
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
}

export default function Node({ id, position, label, description, isSelected = false, color = "#705d42" }: NodeProps) {
    
    const nodeRef = useRef<THREE.Group>(null)
    const { gl } = useThree()

    const handlePointerOver = () => {
        gl.domElement.style.cursor = "pointer"
    }

    const handlePointerOut = () => {
        gl.domElement.style.cursor = "auto"
    }

    const handleClick = () => {
        window.dispatchEvent(new CustomEvent("node-clicked", {detail: { id, label, position, description }}))
    }

    // Hovering Effect for Selected Node
    useFrame(({ clock }) => {
        if (nodeRef.current && isSelected) {
            const hoverValue = Math.sin(clock.getElapsedTime() * 2) * 0.05
            nodeRef.current.position.y = position[1] + hoverValue
        }
        if (nodeRef.current && !isSelected && nodeRef.current.position.y !== position[1]) {
            nodeRef.current.position.y = position[1]
        } 
    })

    return (
        <group ref={nodeRef} position={position}>
            <mesh
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
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
                <edgesGeometry args={[new THREE.SphereGeometry(0.58, 64, 64)]} />
                <lineBasicMaterial color={color} transparent opacity={0.9} />
            </lineSegments>
            <Html 
                center
                distanceFactor={12}>
                <div className="node-label">{label}</div>
            </Html>
        </group>
    )
}