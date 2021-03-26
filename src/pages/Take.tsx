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
      {/*<Chromakey MediaStream={cameraList} />*/}
      {/*<Pic MyStream={setmyCamera} />*/}
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const width = 960;
    const height = 540;

    assertNonNull(mediaStream);

    const videos = [...streams, mediaStream].map((stream) => {
      const video = document.createElement("video");
      video.autoplay = true;
      video.srcObject = stream;
      return video;
    });

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    assertNonNull(ctx);

    let requestId: number;
    const animate = () => {
      videos.forEach((video) => {
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const nn = width * height * 4;
        for (let pi = 0; pi < nn; pi += 4) {
          const r = data[pi];
          const g = data[pi + 1];
          const b = data[pi + 2];
          assertNonNull(r);
          assertNonNull(g);
          assertNonNull(b);
          if (r >= 250 && g >= 250 && b >= 250) {
            data[pi + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      });
      requestId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [mediaStream, streams, canvasRef]);

  return (
    <div>
      <div>
        <span>自分の映像</span>
        <video autoPlay muted ref={myVideoRef} />
      </div>
      <div>
        <canvas ref={canvasRef} />
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
