"use client";

import { useRef } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { Image } from "image-js";

export default function Home() {
  const date = () => {
    return (
      new Date().getFullYear() +
      "-" +
      new Date().getMonth() +
      "-" +
      new Date().getDate() +
      "_" +
      new Date().getHours() +
      "-" +
      new Date().getMinutes() +
      "-" +
      new Date().getSeconds()
    );
  };

  const canvas = useRef();
  const clearCanvas = () => {
    canvas.current.clearCanvas();
  };

  const exportCanvas = async () => {
    const data = await Promise.resolve(canvas.current.exportImage("png"));
    const image = (await Image.load(Buffer.from(data.split(",")[1], "base64")))
      .resize({ width: 400 })
      .toBase64("png");

    // save base64 data as a file
    const link = document.createElement("a");
    link.href = "data:image/png;base64," + image;
    link.download = date().toString() + ".png";
    link.click();

    // clear the canvas
    clearCanvas();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center space-x-2">
        <button
          className="rounded bg-green-500 text-white p-2"
          onClick={clearCanvas}
        >
          Clear
        </button>
        <button
          className="rounded bg-red-500 text-white p-2"
          onClick={exportCanvas}
        >
          Export
        </button>
      </div>
      <ReactSketchCanvas
        ref={canvas}
        className="!w-screen aspect-[1/2]"
        strokeWidth={8}
        strokeColor="black"
      />
    </div>
  );
}
