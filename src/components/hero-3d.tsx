// @ts-nocheck
import * as React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  MeshTransmissionMaterial, 
  Icosahedron,
  ContactShadows,
  Environment
} from '@react-three/drei'
import { Loader2 } from 'lucide-react'

function ShaderObject() {
  const meshRef = React.useRef<any>(null)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.1
      meshRef.current.rotation.y = time * 0.15
    }
  })

  return (
    <Float speed={3} rotationIntensity={1.5} floatIntensity={2}>
      <Icosahedron ref={meshRef} args={[1, 15]} scale={1.8}>
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={1}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.2}
          distortionScale={0.5}
          temporalDistortion={0.5}
          color="#FF2D20"
          roughness={0}
          transmission={1}
          ior={1.2}
        />
      </Icosahedron>
    </Float>
  )
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-red-600 animate-spin opacity-20" />
    </div>
  )
}

export function Hero3D() {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center relative">
      <React.Suspense fallback={<Loader />}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 35 }}
          dpr={[1, 2]} // Optimize for high-res screens without killing performance
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['transparent']} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
          <pointLight position={[-10, -10, -10]} color="#FF2D20" intensity={1} />
          
          <Environment preset="studio" />
          
          <ShaderObject />
          
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.3}
            scale={10}
            blur={2.5}
            far={4.5}
          />
        </Canvas>
      </React.Suspense>
    </div>
  )
}
