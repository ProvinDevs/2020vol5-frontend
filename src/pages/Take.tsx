import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import Pic from "../components/Pic";
import Chromakey from "../components/Chromakey";

import React, { useState, useEffect } from "react";

const Take: FC<BrowserRouterProps> = () => {
  const [cameraList, setCameraList] = useState<MediaStream[]>([]);

  //sample webカメラをサンプルでいれている
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
        },
      })
      .then((stream) => {
        setCameraList([...cameraList, stream]);
      });
  }, []);

  return (
    <div>
      <h1>This is Take page.</h1>
      <Chromakey MediaStream={cameraList} />
    </div>
  );
};

export default Take;
