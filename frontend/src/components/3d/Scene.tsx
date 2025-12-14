import { useRef, useEffect, useState, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Float, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import type { GraphResponse, GraphNode, GraphEdge } from "../../models/Graph"
import * as THREE from "three"
import Brain from "./brain/Brain"
import Neurons from "./brain/Neurons"
import Node from "./graph/Node"
import Edge from "./graph/Edge"

type nodeDetail = {
  id: string
  label: string
  position: [number, number, number]
}

interface SceneProps {
  mode: "idle" | "thinking" | "exploring"
  nodeData: GraphResponse | null
  selectedNode: nodeDetail | null
}

export default function Scene({ mode, nodeData, selectedNode }: SceneProps) {

    const { camera } = useThree()
    const controlsRef = useRef<any>(null)

    const handleNodeDragStart = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }
    }

    const handleNodeDragEnd = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = true
      }
    }

    // Reset Camera When Returning to Idle Mode

    useEffect(() => {
      if (mode === "idle" && controlsRef.current) {
        const defaultCameraPos = new THREE.Vector3(10, 0, 10)
        const defaultTarget = new THREE.Vector3(0, 0, 0)

        const animate = () => {
          camera.position.lerp(defaultCameraPos, 1)
          controlsRef.current.target.lerp(defaultTarget, 1)
          controlsRef.current.update()

          if (camera.position.distanceTo(defaultCameraPos) > 0.1) {
            requestAnimationFrame(animate)
          }
        }
        
        animate()
      }
    }, [mode, camera])

    // Focus Camera on the Selected Node
    useEffect(() => {
      if (selectedNode && controlsRef.current) {
        const selectedNodePos = selectedNode.position
        const target = new THREE.Vector3(...selectedNodePos)
        
        const cameraPos = new THREE.Vector3(
          selectedNodePos[0] + 4,  // Right
          selectedNodePos[1] + 2,  // Above
          selectedNodePos[2] + 4   // Back
        )
        const animate = () => {
          camera.position.lerp(cameraPos, 0.1)
          controlsRef.current.target.lerp(target, 0.1) // Moves the Orbit Control Simultaneously
          controlsRef.current.update() // Updates Orbit Control
          
          if (camera.position.distanceTo(cameraPos) > 0.1) {
            requestAnimationFrame(animate) // Requests Animation based on Distance to Specified Node 
          }
        }
        
        animate()
      }
    }, [selectedNode, camera])

    return (
        <>
            <color attach="background" args={["#050510"]}/>
            
            <ambientLight intensity={0.4} />
            <pointLight position={[10,10,10]} intensity={1} />
            
            {
                mode !== "exploring" && (
                    <>
                        <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
                            <Brain mode={mode}/>
                        </Float>
                        <Neurons />
                    </>
                )
            }
            {
                mode === "exploring" && nodeData && (
                    <>
						{/* Render Nodes */}
						{
							nodeData.nodes.map((node: GraphNode) => {
                // Check and Change Color for Root Node
                const isRoot = node.x === 0 && node.y === 0 && node.z === 0
                const nodeColor = isRoot ? "#ff0000" : "#705d42"
                return (
                  <Node 
                    key={node.node_id}
                    id={node.node_id.toString()} 
                    position={[node.x, node.y, node.z]} 
                    label={node.label} 
                    description={node.description}
                    isSelected={selectedNode?.id === node.node_id.toString()}
                    color={nodeColor}
                    onDragStart={handleNodeDragStart}   
                    onDragEnd={handleNodeDragEnd}  
                  />)
              })
						}

						{/* Render Edges */}
						{
							nodeData.edges.map((edge: GraphEdge, index: number) => (
								<Edge 
									key={index}
									start={edge.source} 
									end={edge.target} 
								/>
							))
						}
                    </>
                )
            }
            <OrbitControls 
                ref={controlsRef}                  
                enablePan={mode === "exploring" && !selectedNode}
                enableZoom={mode === "exploring"} 
                autoRotate={mode !== "exploring"} 
                autoRotateSpeed={1}          
                minDistance={6}
                maxDistance={mode === "exploring" ? 30 : 15}
                zoomSpeed={1.2}
                panSpeed={1.5}
            />
            <EffectComposer>
                <Bloom
                    intensity={1.6}            
                    luminanceThreshold={0.1}   
                />
            </EffectComposer>
            {/* <axesHelper args={[1]} /> */}
            <Environment preset="night" />

        </>
    )
}