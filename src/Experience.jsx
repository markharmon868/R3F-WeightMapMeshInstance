import React, { useRef, Suspense } from "react";
import Terrain from "./Terrain";
import Spawner from "./Spawner";

export function Experience() {
  const terrainRef = useRef();

  return (
    <>
      <Suspense fallback={null}>
        <Terrain ref={terrainRef} />
        <Spawner objectPath={"/grass.glb"} terrainRef={terrainRef} count={10000} weightMapPath={"/grass-weight.png"} windStrength={0.5}/>
      </Suspense>
    </>
  );
}
