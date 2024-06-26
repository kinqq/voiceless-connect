"use client";

import { useEffect, useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { Image } from "image-js";
import * as tmImage from "@teachablemachine/image";

export default function Home() {
  const [model, setModel] = useState(null);
  const [result, setResult] = useState(null);
  const [testImg, setTestImg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      const modelURL =
        "https://teachablemachine.withgoogle.com/models/enIZ_4AU-/";
      const tfModel = await tmImage.load(
        modelURL + "model.json",
        modelURL + "metadata.json"
      );
      setModel(tfModel);
    };
    loadModel();
  }, []);

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

  const cropImage = (jsImage, margin = 5) => {
    const WIDTH = 400,
      HEIGHT = 800;

    const pixelsArray = jsImage.getPixelsArray();
    let x1 = 0,
      x2 = 0,
      y1 = 0,
      y2 = 0;

    // find y1 from top
    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        if (pixelsArray[i * WIDTH + j].reduce((a, b) => a + b, 0) < 10) {
          y1 = i;
          break;
        }
      }
      if (y1) break;
    }

    // find y2 from bottom
    for (let i = HEIGHT - 1; i > 0; i--) {
      for (let j = 0; j < WIDTH; j++) {
        if (pixelsArray[i * WIDTH + j].reduce((a, b) => a + b, 0) < 10) {
          y2 = i;
          break;
        }
      }
      if (y2) break;
    }

    // find x1 from left
    for (let i = 0; i < WIDTH; i++) {
      for (let j = 0; j < HEIGHT; j++) {
        if (pixelsArray[j * WIDTH + i].reduce((a, b) => a + b, 0) < 10) {
          x1 = i;
          break;
        }
      }
      if (x1) break;
    }

    // find x2 from right
    for (let i = WIDTH - 1; i > 0; i--) {
      for (let j = 0; j < HEIGHT; j++) {
        if (pixelsArray[j * WIDTH + i].reduce((a, b) => a + b, 0) < 10) {
          x2 = i;
          break;
        }
      }
      if (x2) break;
    }

    const x = Math.max(x1 - margin, 0),
      y = Math.max(y1 - margin, 0),
      width = Math.min(x2 - x1 + margin * 2, WIDTH - x1),
      height = Math.min(y2 - y1 + margin * 2, HEIGHT - y1);

    return jsImage.crop({ x, y, width, height });
  };

  const canvas = useRef();
  const clearCanvas = () => {
    canvas.current.clearCanvas();
  };

  const exportCanvas = async () => {
    const data = await Promise.resolve(canvas.current.exportImage("png"));
    const image = cropImage(
      (await Image.load(Buffer.from(data.split(",")[1], "base64"))).resize({
        width: 400,
      })
    ).toBase64("png");

    // save base64 data as a file
    const link = document.createElement("a");
    link.href = "data:image/png;base64," + image;
    link.download = date().toString() + ".png";
    link.click();

    // clear the canvas
    clearCanvas();
  };

  const predictCanvas = async () => {
    setIsLoading(true);
    const data = await Promise.resolve(canvas.current.exportImage("png"));
    const jsImage = (
      await Image.load(Buffer.from(data.split(",")[1], "base64"))
    ).resize({ width: 400, height: 800 });

    const base64image = cropImage(jsImage).toBase64("png");
    const image = document.createElement("img");
    image.src = "data:image/png;base64," + base64image;
    setTestImg(image);

    console.log(image.src);
    let prediction;
    for (let i = 0; i < 5; i++) {
      prediction = await model.predict(image);
    }
    setResult(
      () => prediction.sort((a, b) => b.probability - a.probability)[0]
    );
    setIsLoading(() => false);
    console.log(prediction);
  };

  return (
    <>
      <div className="flex justify-start p-2 space-x-2 min-w-full">
        <button
          className={"rounded bg-green-500 text-white p-2 flex-1"}
          onClick={clearCanvas}
        >
          Clear
        </button>
        <button
          className={"rounded bg-red-500 text-white p-2 flex-1"}
          onClick={exportCanvas}
        >
          Export
        </button>
        {model && (
          <button
            className={"rounded bg-blue-500 text-white p-2 flex-1"}
            onClick={predictCanvas}
          >
            Predict
          </button>
        )}
      </div>
      <div className="flex justify-start gap-4 ">
        {testImg && (
          <img src={testImg.src} className="w-10 border-red-500 border-2" />
        )}
        {isLoading
          ? "Loading..."
          : result && (
              <div>
                {result.className} Detected with {result.probability * 100}%
                probability
              </div>
            )}
      </div>
      {model ? (
        <ReactSketchCanvas
          ref={canvas}
          className="!w-screen aspect-[1/2]"
          strokeWidth={8}
          strokeColor="black"
        />
      ) : (
        "Loading..."
      )}
    </>
  );
}
