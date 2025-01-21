import React, { useEffect, useState } from "react";
import { useTexture } from "@react-three/drei";

const WeightMapSampler = ({ weightMapPath }) => {
  const [imageData, setImageData] = useState(null);
  const weightMap = useTexture(weightMapPath);

  useEffect(() => {
    if (!weightMap) return;

    // Draw weight map to a canvas and extract pixel data
    const canvas = document.createElement("canvas");
    const image = weightMap.image;
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    setImageData(ctx.getImageData(0, 0, image.width, image.height));
  }, [weightMap]);

  // Utility to sample pixel data from UV
  const sample = (uv) => {
    if (!imageData) return 0;

    const { width, height, data } = imageData;
    const x = Math.floor(uv.x * width);
    const y = Math.floor((1 - uv.y) * height); // Flip Y-axis

    const index = (y * width + x) * 4;
    const r = data[index]; // Use the red channel as the weight
    return r / 255; // Normalize to [0, 1]
  };

  return { sample, ready: !!imageData };
};

export default WeightMapSampler;
