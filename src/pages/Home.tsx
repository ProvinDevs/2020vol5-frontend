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

  const handleClick = async () => {
    const apiUrl = process.env["REACT_APP_API_URL"];
    assertNonNull(apiUrl);
    const client = new GrpcApiClient(apiUrl);
    const roomId = Number.parseInt(strRoomId, 10);
    if (isNaN(roomId)) {
      throw new Error("roomId must be non NaN");
    }
    const signallingStream = await client.joinRoom(
      Number.parseInt(strRoomId, 10),
    );
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { max: 1920 },
        height: { max: 1080 },
        aspectRatio: { exact: 1.7777777778 },
        facingMode: "user",
      },
    });
    setStore({ mediaStream, signallingStream });
    history.push("/edit");
  };

  return (
    <div>
      <div>
        <span>ルームID</span>
        <input
          value={strRoomId}
          onChange={({ target }) => setStrRoomId(target.value)}
        />
        <button onChange={handleClick}>参加</button>
      </div>
    </div>
  );
};

export default Home;
