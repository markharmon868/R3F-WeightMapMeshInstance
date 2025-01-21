import React, { useRef, useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import WeightMapSampler from "./WeightMapSampler";


// Spawner generates provided count of object instances on a given mesh based on a weight map,
const Spawner = ({ objectPath, terrainRef, weightMapPath, count = 1000 }) => {
  const grassRef = useRef();
  const { scene: grassScene } = useGLTF(objectPath);
  const weightMap = WeightMapSampler({ weightMapPath });

  // Function to generate a random point within a triangle
  const randomPointInTriangle = (a, b, c) => {
    const r1 = Math.random();
    const r2 = Math.random();
    const sqrtR1 = Math.sqrt(r1);

    const u = 1 - sqrtR1;
    const v = r2 * sqrtR1;
    const w = 1 - u - v;

    return new THREE.Vector3()
      .addScaledVector(a, u)
      .addScaledVector(b, v)
      .addScaledVector(c, w);
  };

  // Generate positions once using useMemo
  const positions = useMemo(() => {
    if (!terrainRef.current || !weightMap.ready) return [];

    const terrainGeometry = terrainRef.current.children[0].geometry;
    const positionAttribute = terrainGeometry.attributes.position;
    const uvAttribute = terrainGeometry.attributes.uv;
    const indexAttribute = terrainGeometry.index;

    const vertices = [];
    for (let i = 0; i < positionAttribute.count; i++) {
      vertices.push(
        new THREE.Vector3(
          positionAttribute.getX(i),
          positionAttribute.getY(i),
          positionAttribute.getZ(i)
        )
      );
    }

    const generatedPositions = [];
    const triangleCount = indexAttribute.count / 3;

    while (generatedPositions.length < count) {
      const triangleIndex = Math.floor(Math.random() * triangleCount);
      const i0 = indexAttribute.getX(triangleIndex * 3 + 0);
      const i1 = indexAttribute.getX(triangleIndex * 3 + 1);
      const i2 = indexAttribute.getX(triangleIndex * 3 + 2);

      const a = vertices[i0];
      const b = vertices[i1];
      const c = vertices[i2];

      const uvA = new THREE.Vector2(uvAttribute.getX(i0), uvAttribute.getY(i0));
      const uvB = new THREE.Vector2(uvAttribute.getX(i1), uvAttribute.getY(i1));
      const uvC = new THREE.Vector2(uvAttribute.getX(i2), uvAttribute.getY(i2));

      // Compute UV for a random point in the triangle
      const barycentric = randomPointInTriangle(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1)
      );
      const uv = new THREE.Vector2()
        .addScaledVector(uvA, barycentric.x)
        .addScaledVector(uvB, barycentric.y)
        .addScaledVector(uvC, barycentric.z);

      // Sample the weight map
      const weight = weightMap.sample(uv);

      // Spawn grass based on weight
      if (Math.random() < weight) {
        generatedPositions.push(randomPointInTriangle(a, b, c));
      }
    }

    return generatedPositions;
  }, [terrainRef, weightMap, count]);

  // Place grass blades at the positions with random height
  useEffect(() => {
    if (!grassRef.current || positions.length === 0) return;

    const dummy = new THREE.Object3D();
    positions.forEach((position, i) => {
      dummy.position.copy(position);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0); // Random rotation

      // Randomize height by scaling along the Y-axis
      const randomHeight = Math.random() * 0.5 + 0.75; // Scale range: 0.75 to 1.25
      dummy.scale.set(1, randomHeight, 1); // Scale X and Z uniformly, Y is height

      dummy.updateMatrix();
      grassRef.current.setMatrixAt(i, dummy.matrix);
    });
    grassRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={grassRef} args={[grassScene.children[0].geometry, null, positions.length]}>
      <meshStandardMaterial color="green" />
    </instancedMesh>
  );
};

export default Spawner;
