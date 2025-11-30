import { Line } from "@react-three/drei"
import * as THREE from "three"

interface EdgeProps {
    start: [number, number, number]
    end: [number, number, number]
}

export default function Edge({ start, end}: EdgeProps) {
    const points = [
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
    ]

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