import "@tensorflow/tfjs";
import type { FC } from "react";
import { useState } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useHistory } from "react-router-dom";
import * as bodyPix from "@tensorflow-models/body-pix";
import { useStore } from "../lib/webrtc/store";
import { GrpcApiClient } from "../lib/grpc";
import { assertNonNull } from "../utils/assert";
import { ConnectionController } from "../lib/webrtc/connection";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import styles from "./Home.module.scss";

declare global {
  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }
}

const Home: FC<BrowserRouterProps> = () => {
  const [strRoomId, setStrRoomId] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const history = useHistory();

  const { setStore } = useStore();

  const getMediaStream = async (): Promise<MediaStream> => {
    const width = 960;
    const height = 540;
    const model = await bodyPix.load();
    const camera = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { max: width },
        height: { max: height },
        aspectRatio: { exact: 1.7777777778 },
        facingMode: "user",
      },
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const video = document.createElement("video");
    video.autoplay = true;
    video.srcObject = camera;

    const EditCanvas = document.createElement("canvas");
    EditCanvas.width = width;
    EditCanvas.height = height;
    const ctx = EditCanvas.getContext("2d");
    assertNonNull(ctx);

    const animate = async () => {
      ctx.drawImage(video, 0, 0, width, height);
      const segmentation = await model.segmentPerson(EditCanvas);
      const bgColor = { r: 255, g: 255, b: 255, a: 255 };
      const fgColor = { r: 0, g: 0, b: 0, a: 0 };
      const roomPartImage = bodyPix.toMask(segmentation, fgColor, bgColor);
      const opacity = 1.0;
      const maskBlurAmount = 3;
      const flipHorizontal = false;
      bodyPix.drawMask(
        canvas,
        EditCanvas,
        roomPartImage,
        opacity,
        maskBlurAmount,
        flipHorizontal,
      );
      requestAnimationFrame(animate);
    };
    animate().catch(console.error);
    return canvas.captureStream(20);
  };

  const handleJoin = (client: GrpcApiClient, roomId: number): Promise<void> => {
    setConnecting(true);
    return (async () => {
      const signallingStream = await client.joinRoom(roomId);

      if (signallingStream == null) {
        setConnectionError(true);
        setConnecting(false);
        return;
      }

      const myId = signallingStream.getMyId();
      const { joinedUserIds } = await signallingStream.getRoomInfo();
      const mediaStream = await getMediaStream();
      const connectionController = new ConnectionController(
        myId,
        signallingStream,
        mediaStream,
      );
      connectionController.addFromId(joinedUserIds.filter((id) => id !== myId));

      setStore({
        mediaStream,
        signallingStream,
        myId,
        roomId,
        connectionController,
      });
      setConnecting(false);

      history.push("/take");
    })();
  };

  const handleCreateClick = async () => {
    const apiUrl = process.env["REACT_APP_API_URL"];
    assertNonNull(apiUrl);
    const client = new GrpcApiClient(apiUrl);

    const { roomId } = await client.createNewRoom();
    console.log(`Room ID: ${roomId}`);

    await handleJoin(client, roomId);
  };

  const handleJoinClick = async () => {
    const apiUrl = process.env["REACT_APP_API_URL"];
    assertNonNull(apiUrl);
    const client = new GrpcApiClient(apiUrl);

    const roomId = Number.parseInt(strRoomId, 10);
    if (isNaN(roomId)) {
      throw new Error("roomId must be non NaN");
    }

    await handleJoin(client, roomId);
  };

  return (
    <div className={styles["wrapper"]}>
      <div className={styles["inner-wrapper"]}>
        <h1 className={styles["title"]}>撮影をはじめよう</h1>

        <Button onClick={handleCreateClick} disabled={connecting}>
          {connecting ? "接続中です" : "撮影ルームを作成"}
        </Button>

        <span className={styles["or"]}>または</span>

        <Input
          value={strRoomId}
          onChange={({ target }) => setStrRoomId(target.value)}
          placeholder="撮影ルームの部屋番号を入力"
          className={styles["input"]}
        />

        <Button onClick={handleJoinClick}>
          {connecting ? "接続中です" : "撮影ルームに入る"}
        </Button>

        {connectionError && (
          <div>接続に失敗しました。ルームIDを確認してください。</div>
        )}
      </div>
    </div>
  );
};

export default Home;
