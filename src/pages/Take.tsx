import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useHistory } from "react-router-dom";

import { useStore } from "../lib/webrtc/store";
import { assertNonNull } from "../utils/assert";
import { Connection } from "../lib/webrtc/connection";

import CameraIcon from "../assets/camera.svg";
import styles from "./Take.module.scss";

const Take: FC<BrowserRouterProps> = () => {
  const {
    store: { mediaStream, connectionController, roomId },
    setStore,
  } = useStore();
  const history = useHistory();

  const [streams, setStreams] = useState<Array<MediaStream>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTake = () => {
    const canvas = canvasRef.current;
    assertNonNull(canvas);
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const ctx = outputCanvas.getContext("2d");
    assertNonNull(ctx);
    ctx.drawImage(
      canvas,
      5,
      5,
      canvas.width - 5 * 2,
      canvas.height - 5 * 2,
      0,
      0,
      outputCanvas.width,
      outputCanvas.height,
    );
    outputCanvas.toBlob(
      (blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setStore({ takenPhotoUrl: imageUrl });
        history.push("/edit");
      },
      "image/jpeg",
      80,
    );
  };
  const handleClick = () => {
    handleTake();
    assertNonNull(connectionController);
    connectionController.sendTakeMessage("take");
  };

  useEffect(() => {
    if (connectionController === undefined) return;

    const handleEstablishConnection = ({ mediaStream }: Connection) => {
      assertNonNull(mediaStream);
      setStreams((prev) => [...prev, mediaStream]);
    };

    const handleTakeMessage = () => {
      handleTake();
    };

    connectionController.on("establishConnection", handleEstablishConnection);
    connectionController.on("takeMessage", handleTakeMessage);
    return () => {
      connectionController.off(
        "establishConnection",
        handleEstablishConnection,
      );
      connectionController.off("takeMessage", handleTakeMessage);
    };
  }, [connectionController, handleTake]);

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
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.fillStyle = "white";
      ctx.fill();
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
    <div className={styles["preview-container"]}>
      <div className={styles["id"]}>ルームID: {roomId}</div>
      <canvas ref={canvasRef} />
      <button onClick={handleClick} className={styles["take-button"]}>
        <img src={CameraIcon} className={styles["take-button-icon"]} />
      </button>
    </div>
  );
};

export default Take;
