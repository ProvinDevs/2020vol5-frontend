import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useState } from "react";
import { useHistory } from "react-router-dom";

import { useStore } from "../lib/webrtc/store";
import { GrpcApiClient } from "../lib/grpc";
import { assertNonNull } from "../utils/assert";
import { Connection } from "../lib/webrtc/connection";

const Home: FC<BrowserRouterProps> = () => {
  const [strRoomId, setStrRoomId] = useState("");
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
    signallingStream.on("sdp", console.log);
    signallingStream.on("iceCandidate", console.log);
    const myId = signallingStream.getMyId();
    const { joinedUserIds } = await signallingStream.getRoomInfo();
    const mediaStream = await getMediaStream();
    const connections = joinedUserIds
      .filter((id) => id !== myId)
      .map((id) => new Connection(myId, id, signallingStream, mediaStream));

    setStore({ mediaStream, signallingStream, myId, connections });

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
    <div>
      <div>
        <button onClick={handleCreateClick}>新規ルーム作成</button>
      </div>
      <div>
        <span>ルームID</span>
        <input
          value={strRoomId}
          onChange={({ target }) => setStrRoomId(target.value)}
        />
        <button onClick={handleJoinClick}>参加</button>
      </div>
    </div>
  );
};

export default Home;
