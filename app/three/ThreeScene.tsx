import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CarModel from "./CarModel";

interface ThreeSceneProps {
  scrollY: any;
}

export default function ThreeScene({ scrollY }: ThreeSceneProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="h-[400px] w-full md:h-[500px] relative">
      <AnimatePresence>
        {inView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <group>
                <CarModel />
              </group>
            </Canvas>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
