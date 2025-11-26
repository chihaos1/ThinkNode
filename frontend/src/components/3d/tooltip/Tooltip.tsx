import { useRef, useState} from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { gsap } from "gsap"
import * as THREE from "three"
import "./Tooltip.css"

export default function Tooltip() {
    const meshRef = useRef<THREE.Mesh>(null!)
    const [hovered, setHovered] = useState(false)

    // // Orbit and Float Animation
    // useFrame((state) => {
    //     if (!meshRef.current) return

    //     meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    //     meshRef.current.position.y = 1.8 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
    // })

    // Hover Animation
    const handleHover = (enter:boolean) => {
        setHovered(enter)
        if (!meshRef.current) return
        gsap.to(meshRef.current.scale, {
            x: enter ? 1.6: 1,
            y: enter ? 1.6: 1,
            z: enter ? 1.6: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
        })
    }

    return (
        <mesh
            ref={meshRef}
            onPointerEnter={() => handleHover(true)}
            onPointerLeave={() => handleHover(false)}
        >
            <circleGeometry args={[0.35,32]} />
            <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={0.9}
                emissive="#00ffff"
                emissiveIntensity={hovered ? 3 : 1.2}
            />
            <Html center raycast={() => null}>
                <div className="question-mark">?</div>
            </Html>
            {hovered && (
                <Html center distanceFactor={8} position={[0, 1.2, 0]}>
                    <div className="tooltip">
                        <strong>What is ThinkNode?</strong>
                        <br />
                        Ask anything — watch your ideas grow as glowing nodes.
                        <br />
                        Rotate • Explore • Think.
                    </div>
                </Html>
            )}
        </mesh>
    )
}