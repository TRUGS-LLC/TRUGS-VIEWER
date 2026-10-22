import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

// Subtle bloom makes node clusters luminous in 3D. A small kernel limits the cost.
export function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.5} luminanceThreshold={0.25} kernelSize={KernelSize.SMALL} mipmapBlur />
    </EffectComposer>
  );
}
