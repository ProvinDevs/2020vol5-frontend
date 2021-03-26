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
  useEffect(() => {
    if (cameraList[0] == null) {
      return;
    }
    if (cameraList[1] != null) {
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          deviceId: {
            exact:
              "62ee584f7ebca93c9d91c3a48fbd72721a3f2a9c7a0ad4efcca5ef2311990a55",
          },
        },
      })
      .then((stream) => {
        setCameraList([...cameraList, stream]);
      });
  }, [cameraList]);

  return (
    <div>
      <h1>This is Take page.</h1>
      <Chromakey MediaStream={cameraList} />
      <Pic MyStream={setmyCamera} />
    </div>
  );
};

export default Take;
