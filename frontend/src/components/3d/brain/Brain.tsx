import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useMemo } from "react"
import type { Mode } from "../../../models/Mode"
import * as THREE from "three"


interface BrainProps {
  mode: Mode
}

export default function Brain({ mode }: BrainProps) {
  const { scene } = useGLTF("/src/assets/models/brain.glb")
  const brainRef = useRef<THREE.Object3D>(scene)

  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        
        // Main edges - main structure lines
        const edges = new THREE.EdgesGeometry(mesh.geometry, 15)
        const mainMaterial = new THREE.LineBasicMaterial({
          color: "#705d42", 
          transparent: true,
          opacity: 0.9,
        })
        const mainLines = new THREE.LineSegments(edges, mainMaterial)
        
        // Detail edges - sparser, shows major crevices only
        const detailEdges = new THREE.EdgesGeometry(mesh.geometry, 10) // More sparse
        const detailMaterial = new THREE.LineBasicMaterial({
          color: "#3b3123",     
          transparent: true,
          opacity: 0.5,
        })
        const detailLines = new THREE.LineSegments(detailEdges, detailMaterial)
        
        // Replace mesh geometry and material
        mesh.geometry = detailEdges
        mesh.material = detailMaterial
        mesh.add(mainLines)
        mesh.add(detailLines)
      }
    })
  }, [scene])

  useFrame((state, delta) => {
    if (mode === "thinking" && brainRef.current) {
      brainRef.current.rotation.y += delta * 10 
    }
  })

  return <primitive ref={brainRef} object={scene} scale={2} position={[0, 0, 0]} />
}