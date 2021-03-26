import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";

import { useEffect, useRef, useState } from "react";

import { useStore } from "../lib/webrtc/store";
import { assertNonNull } from "../utils/assert";
import { Connection } from "../lib/webrtc/connection";

const Take: FC<BrowserRouterProps> = () => {
  const {
    store: { mediaStream, connectionController },
  } = useStore();

  const [streams, setStreams] = useState<Array<MediaStream>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const data = [...streams, mediaStream].map((stream) => {
      const video = document.createElement("video");
      video.autoplay = true;
      video.srcObject = stream;

      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = width;
      tmpCanvas.height = height;
      const tmpCtx = tmpCanvas.getContext("2d");
      assertNonNull(tmpCtx);

      return { video, tmpCtx };
    });

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    assertNonNull(ctx);

    let requestId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      data.forEach(({ video, tmpCtx }) => {
        tmpCtx.drawImage(video, 0, 0, width, height);
        const imageData = tmpCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const nn = width * height * 4;
        for (let pi = 0; pi < nn; pi += 4) {
          const r = data[pi];
          const g = data[pi + 1];
          const b = data[pi + 2];
          if (r! >= 250 && g! >= 250 && b! >= 250) {
            data[pi + 3] = 0;
          }
        }
        tmpCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(tmpCtx.canvas, 0, 0, width, height);
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
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Take;
