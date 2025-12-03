import { Line } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"

interface EdgeProps {
    start: [number, number, number]
    end: [number, number, number]
}

export default function Edge({ start, end }: EdgeProps) {

    const NODE_RADIUS = 0.58
    const points = useMemo(() => {
        const startVec = new THREE.Vector3(...start)
        const endVec = new THREE.Vector3(...end)
        const direction = new THREE.Vector3().subVectors(endVec, startVec)
        direction.normalize() // Normalize the lenghth (makes it 1)

        const newStart = startVec.clone().add(direction.clone().multiplyScalar(NODE_RADIUS))
        const newEnd = endVec.clone().sub(direction.clone().multiplyScalar(NODE_RADIUS))
        
        return [newStart, newEnd]
    },[start, end])

    return (
        <Line 
            points={points}
            color="#705d42"
            lineWidth={5}
            transparent
            opacity={0.6}
        />
    )
}