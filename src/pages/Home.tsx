import type { FC } from "react";
import { useState } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useHistory } from "react-router-dom";

import { useStore } from "../lib/webrtc/store";
import { GrpcApiClient } from "../lib/grpc";
import { assertNonNull } from "../utils/assert";
import { ConnectionController } from "../lib/webrtc/connection";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import styles from "./Home.module.scss";

const Home: FC<BrowserRouterProps> = () => {
  const [strRoomId, setStrRoomId] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const history = useHistory();

  const { setStore } = useStore();

  const getMediaStream = (): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        width: { max: 1920 },
        height: { max: 1080 },
        aspectRatio: { exact: 1.7777777778 },
        facingMode: "user",
      },
    });
  };

  const handleJoin = async (client: GrpcApiClient, roomId: number) => {
    const signallingStream = await client.joinRoom(roomId);

    if (signallingStream == null) {
      setConnectionError(true);
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

    setStore({ mediaStream, signallingStream, myId, connectionController });

    history.push("/take");
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
        <Button onClick={handleCreateClick}>撮影ルームを作成</Button>
        <span className={styles["or"]}>または</span>
        <Input
          value={strRoomId}
          onChange={({ target }) => setStrRoomId(target.value)}
          placeholder="撮影ルームの部屋番号を入力"
          className={styles["input"]}
        />
        <Button onClick={handleJoinClick}>撮影ルームに入る</Button>
        {connectionError && (
          <div>接続に失敗しました。ルームIDを確認してください。</div>
        )}
      </div>
    </div>
  );
};

export default Home;
