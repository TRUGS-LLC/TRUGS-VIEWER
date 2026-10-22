import { useState, type ChangeEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { loadTrug } from "./load";
import { openSample } from "./load/openSample";
import type { SceneGraphState, TrugNode } from "./types";
import { Graph, Effects } from "./graph";
import { Controls } from "./camera";
import { InspectPanel } from "./inspect";

const toolbarStyle: React.CSSProperties = {
  position: "absolute",
  zIndex: 1,
  padding: "10px 14px",
  display: "flex",
  gap: "14px",
  alignItems: "center",
  color: "#cfd2dc",
  fontFamily: "system-ui, sans-serif",
  fontSize: 14,
};

// Holds the loaded graph, errors and selection. The toolbar and inspection panel
// sit above the canvas containing the graph, camera controls and lighting effects.
export function App() {
  const [state, setState] = useState<SceneGraphState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TrugNode | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = loadTrug(text);
    if (result.ok) {
      setState(result.state);
      setError(null);
      setSelected(null);
    } else {
      setState(null);
      setError(result.error);
      setSelected(null);
    }
  }

  async function onOpenSample() {
    const result = await openSample();
    if (result.ok) {
      setState(result.state);
      setError(null);
      setSelected(null);
    } else {
      setState(null);
      setError(result.error);
      setSelected(null);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0a0f" }}>
      <div style={toolbarStyle}>
        <button type="button" onClick={onOpenSample}>Open a sample</button>
        <input type="file" accept=".json,application/json" onChange={onFile} />
        {state && (
          <span>
            {state.nodes.length} nodes · {state.links.length} edges
          </span>
        )}
        {error && (
          <span role="alert" style={{ color: "#ff8a80" }}>
            Error: {error}
          </span>
        )}
        {!state && !error && <span style={{ opacity: 0.6 }}>Load a .trug.json to view its graph.</span>}
      </div>

      <Canvas camera={{ position: [0, 0, 320], far: 8000 }}>
        <color attach="background" args={["#0a0a0f"]} />
        <ambientLight intensity={0.9} />
        <pointLight position={[300, 300, 300]} intensity={1.2} />
        {state && <Graph state={state} onNodeClick={(node) => setSelected(node as unknown as TrugNode)} />}
        <Controls />
        <Effects />
      </Canvas>

      <InspectPanel node={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
