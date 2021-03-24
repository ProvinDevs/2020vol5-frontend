import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useState } from "react";
import { useHistory } from "react-router-dom";

import { useStore } from "../lib/webrtc/store";

const Home: FC<BrowserRouterProps> = () => {
  const [roomId, setRoomId] = useState("");
  const history = useHistory();

  const { setStore } = useStore();

  const handleClick = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { max: 1920 },
        height: { max: 1080 },
        aspectRatio: { exact: 1.7777777778 },
        facingMode: "user",
      },
    });
    setStore({ mediaStream });
    history.push("/edit");
  };

  return (
    <div>
      <div>
        <span>ルームID</span>
        <input
          value={roomId}
          onChange={({ target }) => setRoomId(target.value)}
        />
        <button onChange={handleClick}>参加</button>
      </div>
    </div>
  );
};

export default Home;
