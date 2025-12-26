import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function Synapse() {
  const count = 150
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)

    const brainScale = 1.5
    const r = (1.4 + Math.random() * 0.7) * brainScale

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }

  const lineRef = useRef<THREE.Line>(null!)
  const beamData = useRef({
    start: new THREE.Vector3(),
    end: new THREE.Vector3(),
    progress: 0,
    active: false,
    nextFire: 0,
  })

  useFrame((state) => {
    const { clock } = state
    const data = beamData.current

    // Trigger new synapse every 1–3 seconds
    if (!data.active && clock.elapsedTime > data.nextFire) {
      const a = Math.floor(Math.random() * count)
      const b = Math.floor(Math.random() * count)
      if (a === b) return

      const i3 = a * 3, j3 = b * 3
      data.start.set(positions[i3], positions[i3 + 1], positions[i3 + 2])
      data.end.set(positions[j3], positions[j3 + 1], positions[j3 + 2])
      data.progress = 0
      data.active = true
      data.nextFire = clock.elapsedTime + 0.5
    }

    if (data.active) {
      data.progress += 0.04
      if (data.progress >= 1) {
        data.active = false
        data.progress = 1
      }

      // Create beam geometry (only 2 points)
      const geometry = lineRef.current.geometry as THREE.BufferGeometry
      const pos = geometry.attributes.position.array as Float32Array
      const t = THREE.MathUtils.smoothstep(data.progress, 0, 1)

      // Pulse moves from start → end
      const x = data.start.x + (data.end.x - data.start.x) * t
      const y = data.start.y + (data.end.y - data.start.y) * t
      const z = data.start.z + (data.end.z - data.start.z) * t

      // Two points: from start to current pulse position
      pos[0] = data.start.x; pos[1] = data.start.y; pos[2] = data.start.z
      pos[3] = x;            pos[4] = y;            pos[5] = z

      geometry.attributes.position.needsUpdate = true

      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 1 - data.progress
    }
  })

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#000000" transparent />
      </points>

      <primitive object={new THREE.Line()} ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            args={[new Float32Array(6), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#000000"
          transparent
          opacity={0}
          linewidth={3}
          blending={THREE.AdditiveBlending}
        />
      </primitive>
    </>
  )
}