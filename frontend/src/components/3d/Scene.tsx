import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Billboard, OrbitControls, Float, Environment, DragControls  } from "@react-three/drei"
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
  addNewNode: (x: number, y: number, z: number) => void
  addNewLine: ([startNode, endNode]: [GraphNode, GraphNode]) => void
  deleteItems: (items: {nodes: GraphNode[], edges: GraphEdge[] }) => void
}

export default function Scene({ mode, 
                                nodeData, 
                                updateNodeCoords, 
                                selectedNode, 
                                currentMindMapId,
                                addNewNode,
                                addNewLine,
                                deleteItems }: SceneProps) {

    const { camera, gl } = useThree()
    const controlsRef = useRef<any>(null)
    const nodeGroupRefs = useRef<Map<string, THREE.Group>>(new Map())
    const [draggingNodeId, setDraggingNodeID] = useState<string | null>(null)
    const [nodeKeys, setNodeKeys] = useState<Map<string, number>>(new Map())

    // ---------- Enable and Disable OrbitControl when Dragging ---------- 

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

    // ---------- Reset Camera When Returning to Idle Mode ---------- 

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

    // ---------- Focus Camera on the Selected Node ---------- 

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

    // ---------- Hovering Effect for Selected Node ---------- 

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

    // ---------- Adding New Node from Add.tsx ---------- 

    const [isAddingNode, setIsAddingNode] = useState<boolean>(false)

    useEffect(() => {
      const handleStartAddingNode = () => {
        setIsAddingNode(true)
      }
      
      window.addEventListener("startAddingNode", handleStartAddingNode)

      return () => {
        window.removeEventListener("startAddingNode", handleStartAddingNode)
      }
    }, [])

    const handlePlaneClick = (e: any) => {
      if (!isAddingNode) return

      e.stopPropagation()

      const { x, y, z } = e.point
      addNewNode(x, y, z) // Passes the Coords for the new node
      setIsAddingNode(false)

      const canvas = document.querySelector("canvas")
      if (canvas) {
        canvas.style.cursor = "default"
      }
    }

    // ---------- Adding New Line from Add.tsx ---------- 

    const [isAddingLine, setIsAddingLine] = useState<boolean>(false)
    const [selectedNodesForLines, setSelectedNodesForLines] = useState<GraphNode[]>([]);

    useEffect(() => {
      const handleStartAddingLine = () => {
        setIsAddingLine(true)
      }

      window.addEventListener("startAddingLine", handleStartAddingLine)

      return () => {
        window.removeEventListener('startAddingLine', handleStartAddingLine)
      }
    }, [])

    const handleAddLine = (node: GraphNode) => {
      if (!isAddingLine) return;

      if (selectedNodesForLines.some(n => n.node_id === node.node_id)) return;

      const currentSelection = [...selectedNodesForLines, node];

      if (currentSelection.length === 2) {
        const [node1, node2] = currentSelection;

        const lineExists = nodeData?.edges.some(edge => {
          const s = edge.source.join(",");
          const t = edge.target.join(",");
          const p1 = `${node1.x},${node1.y},${node1.z}`;
          const p2 = `${node2.x},${node2.y},${node2.z}`;

          return (s === p1 && t === p2) || (s === p2 && t === p1);
        });

        if (lineExists) {
          alert("These nodes are already connected!");
        } else {
          addNewLine([node1, node2]);
        }

        setIsAddingLine(false);
        setSelectedNodesForLines([]);
        document.querySelector("canvas")!.style.cursor = "default";

      } else {
        setSelectedNodesForLines(currentSelection);
      }
    };

    // ---------- Delete Nodes and Lines ---------- 

    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [itemsToDelete, setItemsToDelete] = useState<{
        nodes: GraphNode[],
        edges: GraphEdge[]
      }>({nodes:[], edges: []});

    useEffect(() => {
      const handleStartDeletingLine = () => {
        setIsDeleting(true)
      }

      window.addEventListener("startDeleting", handleStartDeletingLine)

      return () => {
        window.removeEventListener('startDeleting', handleStartDeletingLine)
      }
    }, [])

    const handleSelectNodeDelete = (node: GraphNode) => { // Add to the Items for Deletion
      if (!isDeleting) return
      const nodeId = node.node_id.toString()

      if (itemsToDelete.nodes.some(n => n.node_id.toString() === nodeId)) return

      setItemsToDelete(prev => {
        return {
          ...prev,
          nodes: [...prev.nodes, node]
        }
      })
    }

    const handleSelectLineDelete = (edge: GraphEdge) => { // Add to the Items for Deletion
      if (!isDeleting) return

      if (itemsToDelete.edges.some(e =>
          e.source.join(",") === edge.source.join(",") &&
          e.target.join(",") === edge.target.join(",")
      )) return

      setItemsToDelete(prev => {
        return {
          ...prev,
          edges: [...prev.edges, edge]
        }
      })
      console.log(itemsToDelete)
    }

    useEffect(() => { // Listens for Confirm Delete then Delete Item in App.tsx
      const handleConfirmDelete = () => {
        deleteItems(itemsToDelete)
        setIsDeleting(false)
        setItemsToDelete({nodes:[], edges: []})
        window.dispatchEvent(new CustomEvent("completedDelete")) // Notifies Toolkit.tsx to close demolish toolkit
      }

      window.addEventListener("confirmDelete", handleConfirmDelete)

      return () => {
        window.removeEventListener('confirmDelete', handleConfirmDelete)
      }
    }, [itemsToDelete, deleteItems])

    useEffect(() => { // Listens for Cancel Delete
      const handleCancelDelete = () => {
        setIsDeleting(false)
        setItemsToDelete({nodes:[], edges: []})
      }

      window.addEventListener("cancelDelete", handleCancelDelete)

      return () => {
        window.removeEventListener('cancelDelete', handleCancelDelete)
      }
    }, [])
    

    return (
        <>
            <color attach="background" args={["#050510"]}/>
            <ambientLight intensity={0.4} />
            <pointLight position={[10,10,10]} intensity={1} />
            {
              isAddingNode && (
                <Billboard>
                  <mesh
                    onClick={handlePlaneClick}
                    visible={false}
                    position={[0,0,0]}
                  >
                    <planeGeometry args={[100, 100]} />
                    <meshBasicMaterial />
                  </mesh>
                </Billboard>
              )
            }
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
 
                      const isRoot = node.x === 0 && node.y === 0 && node.z === 0
                      const nodeColor = isRoot ? "#ff0000" : "#705d42"
                      const nodeId = node.node_id.toString()

                      const isSelectedForLine = selectedNodesForLines.some(
                        (n) => n.node_id.toString() === nodeId
                      );
                      const isSelectedForDelete = itemsToDelete.nodes.some(
                        (n) => n.node_id.toString() === nodeId
                      )

                      const nodeElement = (
                        <Node 
                            node={node}
                            color={nodeColor}
                            isDragging={draggingNodeId === nodeId}
                            isAddingNode={isAddingNode}
                            isAddingLine={isAddingLine}
                            addLine={handleAddLine}
                            isDeleting={isDeleting}
                            deleteObj={handleSelectNodeDelete}
                            isSelectedForAddLine={isSelectedForLine}
                            isSelectedForDelete={isSelectedForDelete}
                          />
                      )

                      return isRoot || isAddingLine || isDeleting ? (
                        <group 
                          key={`${currentMindMapId}-${node.node_id}`}
                          position={[node.x, node.y, node.z]}
                          ref={(el) => {
                              if (el) {
                                  nodeGroupRefs.current.set(nodeId, el)
                              } else {
                                  nodeGroupRefs.current.delete(nodeId)
                              }
                          }}
                        >
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
                            }}
                            onPointerDown={(e) => {
                              if (selectedNode) {
                                e.stopPropagation()
                              }
                            }}
                          >
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
                      .map((edge: GraphEdge, index: number) => {
                        const isSelectedForDelete = itemsToDelete.edges.some(e =>
                          e.source.join(",") === edge.source.join(",") &&
                          e.target.join(",") === edge.target.join(",")
                        )
                        
                        return (
                          <group
                            key={`edge-${edge.source.join(",")}-${edge.target.join(",")}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectLineDelete(edge)
                            }}
                          >
                            <Edge 
                              key={index}
                              start={edge.source} 
                              end={edge.target}
                              isDeleting={isDeleting} 
                              isSelectedForDelete={isSelectedForDelete}
                            />
                          </group>
                          
                    )})
                  }
                </>
                )
            }

            <OrbitControls 
                ref={controlsRef}     
                enabled={!draggingNodeId}             
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