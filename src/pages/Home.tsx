import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useState } from "react";
import { useHistory } from "react-router-dom";

import { useStore } from "../lib/webrtc/store";
import { GrpcApiClient } from "../lib/grpc";
import { assertNonNull } from "../utils/assert";

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

  const handleCreateClick = async () => {
    const apiUrl = process.env["REACT_APP_API_URL"];
    assertNonNull(apiUrl);
    const client = new GrpcApiClient(apiUrl);

    const { roomId } = await client.createNewRoom();
    const signallingStream = await client.joinRoom(roomId);

    const mediaStream = await getMediaStream();
    setStore({ mediaStream, signallingStream });

    history.push("/edit");
  };

  const handleJoinClick = async () => {
    const apiUrl = process.env["REACT_APP_API_URL"];
    assertNonNull(apiUrl);
    const client = new GrpcApiClient(apiUrl);

    const roomId = Number.parseInt(strRoomId, 10);
    if (isNaN(roomId)) {
      throw new Error("roomId must be non NaN");
    }
    const signallingStream = await client.joinRoom(roomId);

    const mediaStream = await getMediaStream();
    setStore({ mediaStream, signallingStream });

    history.push("/edit");
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
