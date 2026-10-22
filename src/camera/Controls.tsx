import { OrbitControls } from "@react-three/drei";

// Orbit / zoom / pan — camera-only. Satisfies the ORBIT AND ZOOM ASSERTion. These controls
// move the camera; they never mutate scene_graph_state (read-only invariant).
export function Controls() {
  return <OrbitControls makeDefault enablePan enableZoom enableRotate />;
}
