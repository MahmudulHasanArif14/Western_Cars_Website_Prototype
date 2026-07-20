"use client";

import { useLoader } from "@react-three/fiber";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// @ts-ignore
const car = "/models/scene.gltf";

export default function CarModel() {
  const gltf = useLoader(GLTFLoader, car);
  return <primitive object={gltf.scene} scale={0.8} />;
}
