import { useGLTF } from '@react-three/drei';
import React, { forwardRef } from 'react';

const Terrain = forwardRef((props, ref) => {
    const gltf = useGLTF("/terrain.glb", true); // Load the GLTF model
    React.useEffect(() => {
        if (gltf.scene && ref) {
        ref.current = gltf.scene;
        if (props.onLoaded) props.onLoaded(ref.current); // Notify parent
        }
    }, [gltf, ref, props]);

    return <primitive object={gltf.scene} {...props} ref={ref} receiveShadow/>;
});
  
export default Terrain;