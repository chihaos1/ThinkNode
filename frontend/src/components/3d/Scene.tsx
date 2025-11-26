import { OrbitControls, Float, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import Brain from "./brain/Brain"
import Nodes from "./nodes/Nodes"

interface SceneProps {
  mode: "idle" | "thinking"
}

export default function Scene({ mode }: SceneProps) {
    return (
        <>
            <color attach="background" args={["#050510"]}/>
            
            <ambientLight intensity={0.4} />
            <pointLight position={[10,10,10]} intensity={1} />

            <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
                <Brain mode={mode}/>
                {/* <Tooltip /> */}
            </Float>

            <Nodes />
        
            <OrbitControls
                autoRotate                    
                autoRotateSpeed={0.5}         
                enablePan={false} 
                enableZoom={false}           
                minDistance={6}
                maxDistance={15}
            />
            <EffectComposer>
                <Bloom
                    intensity={1.6}            
                    luminanceThreshold={0.1}   
                />
            </EffectComposer>

            <Environment preset="night" />

        </>
    )
}