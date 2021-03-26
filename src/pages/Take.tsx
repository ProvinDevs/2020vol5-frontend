import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import Pic from "../components/Pic";
import Chromakey from "../components/Chromakey";

import React, { useState, useEffect } from "react";

const Take: FC<BrowserRouterProps> = () => {
  const [cameraList, setCameraList] = useState<MediaStream[]>([]);

  const setmyCamera = (MyStream: MediaStream) => {
    setCameraList([...cameraList, MyStream]);
  };

  return (
    <div>
      <h1>This is Take page.</h1>
      <Pic MyStream={setmyCamera} />
      <Chromakey MediaStream={cameraList} />
    </div>
  );
};

export default Take;
