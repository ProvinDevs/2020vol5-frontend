import { FC, useEffect, useState } from "react";

import Editor from "./components/Editor";

import mockedImage from "./mock/image.jpg";
import styles from "./App.module.scss";
import { ApiClient, GrpcApiClient, Room, SignallingStream } from "./lib/grpc";

const App: FC = () => {
  return (
    <div className={styles["editor_wrapper"]}>
      <Editor backgroundImagePath={mockedImage} />
    </div>
  );
};

const apiEndpoint = "https://lc.kawaemon.dev:4000";

/* eslint-disable @typescript-eslint/no-unused-vars */
const GrpcExample: FC = () => {
  const [client, setClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    setClient(new GrpcApiClient(apiEndpoint));
  }, []);

  return (
    <div>
      {client == null && <h1>Loading...</h1>}
      {client != null && <CreateNewRoomButton client={client} />}
      {client != null && <StreamController client={client} />}
    </div>
  );
};

type ClientOnlyProps = {
  client: ApiClient;
};

const CreateNewRoomButton: FC<ClientOnlyProps> = ({ client }) => {
  const [room, setRoom] = useState<Room | null>(null);

  const onClick = async () => {
    const room = await client.createNewRoom();
    setRoom(room);
  };

  return (
    <div>
      <button onClick={onClick}>createNewRoom()</button>

      {room != null && (
        <div
          style={{
            border: "black 2px",
            fontFamily: "monospace",
            backgroundColor: "#AFAFAF",
            padding: 4,
          }}
        >
          {JSON.stringify(room, undefined, "\t")}
        </div>
      )}
    </div>
  );
};

const StreamController: FC<ClientOnlyProps> = ({ client }) => {
  const [roomIdInput, setRoomIdInput] = useState<number>(0);
  const [stream, setStream] = useState<SignallingStream | null>(null);
  const [messages, setMessages] = useState<Array<string>>([]);

  // (to_id, content)
  const [sdpInput, setSdpInput] = useState<[string, string]>(["", ""]);
  const [iceInput, setIceInput] = useState<[string, string]>(["", ""]);

  const toJson = (obj: unknown) => JSON.stringify(obj, null, "\t");

  const onJoinButtonClick = async () => {
    const stream = await client.joinRoom(roomIdInput);

    stream.on("sdp", (s) => setMessages((m) => [...m, toJson(s)]));
    stream.on("iceCandidate", (i) => setMessages((m) => [...m, toJson(i)]));

    setStream(stream);
  };

  return (
    <div>
      <h2>StreamController</h2>

      {stream == null && (
        <>
          <input
            type="number"
            value={roomIdInput}
            onChange={(x) => setRoomIdInput(x.target.valueAsNumber)}
          />
          <button onClick={onJoinButtonClick}>join</button>
        </>
      )}

      {stream != null && (
        <>
          <h3>Connected.</h3>
          <p>Your ID is {stream.getMyId()}</p>
          <div>
            <input
              placeholder="sdp"
              value={sdpInput[1]}
              onChange={(e) => setSdpInput([sdpInput[0], e.target.value])}
            />
            <input
              placeholder="to"
              value={sdpInput[0]}
              onChange={(e) => setSdpInput([e.target.value, sdpInput[1]])}
            />
            <button
              onClick={() => stream.sendSdpMessage(sdpInput[0], sdpInput[1])}
            >
              send
            </button>
          </div>
          <div>
            <input
              placeholder="ice"
              value={iceInput[1]}
              onChange={(e) => setIceInput([iceInput[0], e.target.value])}
            />
            <input
              placeholder="to"
              value={iceInput[0]}
              onChange={(e) => setIceInput([e.target.value, iceInput[1]])}
            />
            <button
              onClick={() =>
                stream.sendIceCandidateMessage(iceInput[0], iceInput[1])
              }
            >
              send
            </button>
          </div>
        </>
      )}

      {messages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>
  );
};

export default App;
