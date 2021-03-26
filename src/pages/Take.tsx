import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import Pic from "../components/Pic";
import Chromakey from "../components/Chromakey";

import { useEffect, useRef, useState } from "react";

import { useStore } from "../lib/webrtc/store";
import { assertNonNull } from "../utils/assert";
import { Connection } from "../lib/webrtc/connection";

const Take: FC<BrowserRouterProps> = () => {
  const [cameraList, setCameraList] = useState<MediaStream[]>([]);

  const setmyCamera = (MyStream: MediaStream) => {
    setCameraList([...cameraList, MyStream]);
  };

  return (
    <div>
      <h1>This is Take page.</h1>
      <Chromakey MediaStream={cameraList} />
      <Pic MyStream={setmyCamera} />
      <CameraTest />
    </div>
  );
};

export default Take;

// テスト用
const CameraTest: FC = () => {
  const {
    store: { mediaStream, connectionController },
  } = useStore();

  const [streams, setStreams] = useState<Array<MediaStream>>([]);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (myVideoRef.current === null) return;
    assertNonNull(mediaStream);
    console.log(mediaStream);
    myVideoRef.current.srcObject = mediaStream;
  }, [myVideoRef]);

  useEffect(() => {
    if (connectionController === undefined) return;

    const handleEstablishConnection = ({ mediaStream }: Connection) => {
      assertNonNull(mediaStream);
      setStreams((prev) => [...prev, mediaStream]);
    };

    connectionController.on("establishConnection", handleEstablishConnection);
    return () => {
      connectionController.off(
        "establishConnection",
        handleEstablishConnection,
      );
    };
  }, [connectionController]);

  return (
    <div>
      <div>
        <span>自分の映像</span>
        <video autoPlay muted ref={myVideoRef} />
      </div>
      <div>
        {streams.map((stream, index) => (
          <div key={index}>
            <Video stream={stream} />
          </div>
        ))}
      </div>
    </div>
  );
};

type VideoProps = {
  stream: MediaStream;
};
const Video: FC<VideoProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current === null) return;
    videoRef.current.srcObject = stream;
  }, [videoRef]);

  return <video autoPlay muted ref={videoRef} />;
};
