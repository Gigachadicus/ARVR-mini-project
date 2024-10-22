import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { AnimationMixer } from 'three';
import './App.css'; // Include a CSS file for styling

// Model component with shadow casting enabled
const Model = ({ url, position, visible }) => {
  const { scene, animations } = useGLTF(url);
  const mixer = useRef();

  useEffect(() => {
    if (animations && animations.length) {
      mixer.current = new AnimationMixer(scene);
      animations.forEach((clip) => {
        mixer.current.clipAction(clip).play();
      });
    }
  }, [animations, scene]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
  });

  // Ensure the model can cast shadows
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true; // Enable shadow casting
      child.receiveShadow = true; // Enable shadow receiving
    }
  });

  return <primitive object={scene} position={position} visible={visible} />;
};

// Ground plane to receive the shadow
const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};

// Main App Component
function App() {
  const [selectedModel, setSelectedModel] = useState('trial -1.glb');

  return (
    <div>
      {/* Fixed-position dropdown */}
      <div className="model-selector">
        <select onChange={(e) => setSelectedModel(e.target.value)} value={selectedModel}>
          <option value="trial -1.glb">Model 1</option>
          <option value="trial -3.glb">Model 2</option>
        </select>
      </div>

      <Canvas style={{ height: '100vh' }} shadows>
        {/* Ambient light to provide base illumination */}
        <ambientLight intensity={0.5} />

        {/* Directional light for sunlight-like effect, casting shadows */}
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* High-Intensity Point Light */}
        <pointLight
          position={[0, 5, 0]} // Position it above the scene
          intensity={50} // High intensity
          distance={5} // How far the light reaches
          decay={0.5} // How fast the light dims
          castShadow // Enable shadows from this light
        />

        {/* Keep both models and toggle visibility */}
        <Model url="/models/trial -1.glb" position={[-2, 0, 0]} visible={selectedModel === 'trial -1.glb'} />
        <Model url="/models/trial -3.glb" position={[2, 0, 0]} visible={selectedModel === 'trial -3.glb'} />

        {/* Ground to receive shadows */}
        <Ground />

        {/* Camera controls */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;


