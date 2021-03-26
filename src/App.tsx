import type { FC } from "react";
import { useEffect, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { StoreProvider, useStoreReducer } from "./lib/webrtc/store";
import { ApiClient, GrpcApiClient, Room, SignallingStream } from "./lib/grpc";

import Home from "./pages/Home";
import Take from "./pages/Take";
import Edit from "./pages/Edit";
import Finish from "./pages/Finish";
import NotFound from "./pages/NotFound";

const App: FC = () => {
  const store = useStoreReducer();

  return (
    <StoreProvider value={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/take" component={Take} />
          <Route exact path="/edit" component={Edit} />
          <Route exact path="/finish" component={Finish} />
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    </StoreProvider>
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
  const [connectionError, setConnectionError] = useState<boolean>(false);

  // (to_id, content)
  const [sdpInput, setSdpInput] = useState<[string, string]>(["", ""]);
  const [iceInput, setIceInput] = useState<[string, string]>(["", ""]);

  const toJson = (obj: unknown) => JSON.stringify(obj, null, "\t");

  const onJoinButtonClick = async () => {
    const stream = await client.joinRoom(roomIdInput);

    if (stream == null) {
      setConnectionError(true);
      return;
    }

    stream.on("sdp", (s) => setMessages((m) => [...m, toJson(s)]));
    stream.on("iceCandidate", (i) => setMessages((m) => [...m, toJson(i)]));

    setConnectionError(false);
    setStream(stream);
  };

  useEffect(() => () => {
    if (stream != null) {
      stream.close();
    }
  });

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

          {connectionError && <h3>Connection error. Check room id.</h3>}
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
