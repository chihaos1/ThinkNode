import { useRef, useEffect, useState, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Float, Environment, DragControls  } from "@react-three/drei"
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
  updateNodeCoords: (nodeId: string, newPos: THREE.Vector3) => void
  selectedNode: nodeDetail | null
  currentMindMapId: string | null
}

export default function Scene({ mode, 
                                nodeData, 
                                updateNodeCoords, 
                                selectedNode, 
                                currentMindMapId }: SceneProps) {

    const { camera, gl } = useThree()
    const controlsRef = useRef<any>(null)
    const nodeGroupRefs = useRef<Map<string, THREE.Group>>(new Map())
    const [draggingNodeId, setDraggingNodeID] = useState<string | null>(null)

    // Enable and Disable OrbitControl when Dragging

    const handleNodeDragStart = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }
      gl.domElement.style.cursor = "grabbing"
    }

    const handleNodeDragEnd = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = true
      }
      gl.domElement.style.cursor = "auto"
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

    // Hovering Effect for Selected Node
    useFrame(({ clock }) => {
      if (!selectedNode || draggingNodeId) return  
      
      const selectedGroup = nodeGroupRefs.current.get(selectedNode.id)
      if (selectedGroup) {
          const baseY = nodeData?.nodes.find(node => node.node_id.toString() === selectedNode.id)?.y || 0  
          const hoverValue = Math.sin(clock.getElapsedTime() * 2) * 0.05
            selectedGroup.position.y = baseY + hoverValue
        }
      
      nodeGroupRefs.current.forEach((group, nodeId) => {
          if (nodeId !== selectedNode.id) {
            const node = nodeData?.nodes.find(n => n.node_id.toString() === nodeId)
            if (node && group.position.y !== node.y) {
              group.position.y = node.y
            }
          }
        })
      } 
    )

    const [nodeKeys, setNodeKeys] = useState<Map<string, number>>(new Map())
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
                      const nodeId = node.node_id.toString()

                      const nodeElement = (
                        <Node 
                            id={nodeId} 
                            position={[node.x, node.y, node.z]} 
                            label={node.label} 
                            description={node.description}
                            isSelected={selectedNode?.id === nodeId}
                            color={nodeColor}
                            isDragging={draggingNodeId === nodeId}
                          />
                      )

                      return isRoot ? (
                        <group key={`${currentMindMapId}-${node.node_id}`}>
                          {nodeElement}
                        </group> 
                      ) : (
                        <DragControls
                          key={`${currentMindMapId}-${node.node_id}-${nodeKeys.get(nodeId) || 0}`}
                          autoTransform={true}
                          onDragStart={() => {
                            handleNodeDragStart()
                            setDraggingNodeID(nodeId)
                          }}
                          onDragEnd={() => {
                            const obj = nodeGroupRefs.current.get(nodeId)
                            if (!obj) {
                              setDraggingNodeID(null)
                              return
                            }     
                            obj.updateMatrixWorld(true)
                            const pos = new THREE.Vector3()
                            pos.setFromMatrixPosition(obj.matrixWorld)
                            
                            setDraggingNodeID(null)
                            requestAnimationFrame(() => { //Ensures Node is rendered after DraggingNode set to Null
                              updateNodeCoords(nodeId, pos)
                              setNodeKeys(prev => {
                                  const newMap = new Map(prev)
                                  newMap.set(nodeId, (newMap.get(nodeId) || 0) + 1)
                                  return newMap
                              })
                            })
                            handleNodeDragEnd()
                          }}
                        >
                          <group
                            position={[node.x, node.y, node.z]}
                            ref={(el) => {
                              if (el) {
                                nodeGroupRefs.current.set(nodeId, el)
                              } else {
                                nodeGroupRefs.current.delete(nodeId)
                              }
                            }}>
                            {nodeElement}
                          </group> 
                        </DragControls>
                      )
                    })
                  }

                  {/* Render Edges */}
                  {
                    nodeData.edges
                      .filter(edge => {
                        if (!draggingNodeId || !nodeData) return true
                        const selectedNode = nodeData?.nodes.find(node => node.node_id.toString() === draggingNodeId)
                        const nodeCoords = `${selectedNode?.x},${selectedNode?.y},${selectedNode?.z}`
                        const connectedSourceCoords = edge.source.join(',') 
                        const connectedTargetCoords = edge.target.join(',')

                        return connectedSourceCoords !== nodeCoords && connectedTargetCoords !== nodeCoords
                      })
                      .map((edge: GraphEdge, index: number) => (
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