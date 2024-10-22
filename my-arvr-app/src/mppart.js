import React, { useRef, useEffect, useState } from "react";
import * as poseDetection from "@mediapipe/pose";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import { Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Vector3 } from "three";

// MediaPipe Pose setup
const setupMediaPipe = (onPoseDetected) => {
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults(onPoseDetected);

  const videoElement = document.getElementsByClassName("input_video")[0];
  const camera = new cam.Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });
  camera.start();
};

// 3D Model Component using Three.js and GLTFLoader
const Model = ({ jointPositions }) => {
  const gltf = useGLTF("/path/to/your/model.glb");
  const model = gltf.scene;

  useEffect(() => {
    if (jointPositions) {
      // Map your joint positions from MediaPipe to the 3D model bones
      const bone = model.getObjectByName("Armature"); // Replace "Armature" with your model's specific bones
      if (bone) {
        // Update the bones positions/rotation based on jointPositions
        // Example:
        bone.rotation.x = jointPositions[0].x;
        bone.rotation.y = jointPositions[0].y;
        bone.rotation.z = jointPositions[0].z;
      }
    }
  }, [jointPositions]);

  return <primitive object={model} />;
};

const App = () => {
  const videoRef = useRef(null);
  const [poseLandmarks, setPoseLandmarks] = useState(null);

  useEffect(() => {
    setupMediaPipe((results) => {
      if (results.poseLandmarks) {
        setPoseLandmarks(results.poseLandmarks);
      }
    });
  }, []);

  // Transform MediaPipe landmarks into a usable format for 3D mapping
  const getJointPositions = () => {
    if (!poseLandmarks) return null;
    return poseLandmarks.map((landmark) => new Vector3(landmark.x, landmark.y, landmark.z));
  };

  const jointPositions = getJointPositions();

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* Camera feed with MediaPipe */}
      <div style={{ width: "50%" }}>
        <video ref={videoRef} className="input_video" style={{ width: "100%" }}></video>
      </div>

      {/* 3D Model */}
      <div style={{ width: "50%" }}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, 5]} />
          <OrbitControls />
          {jointPositions && <Model jointPositions={jointPositions} />}
        </Canvas>
      </div>
    </div>
  );
};

export default App;
