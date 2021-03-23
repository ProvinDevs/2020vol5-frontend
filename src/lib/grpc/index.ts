import { createNanoEvents, Emitter } from "nanoevents";
import { grpc } from "@improbable-eng/grpc-web";
import { nanoid } from "nanoid";
import {
  CreateRoomRequest,
  RecvSignallingMessage,
  Room as PbRoom,
  RoomInfoRequest,
  SelfIntroduceMessage,
  SendIceCandidateMessage,
  SendSdpMessage,
  SendSignallingMessage,
} from "./generated/hello_pb";
import {
  Hello,
  HelloCreateRoom,
  HelloSignalling,
} from "./generated/hello_pb_service";

export interface ApiClient {
  createNewRoom(): Promise<Room>;
  joinRoom(roomId: number): Promise<SignallingStream>;
}

export interface SignallingStream {
  on(ev: "sdp", func: (s: Sdp) => void): () => void;
  on(ev: "iceCandidate", func: (i: IceCandidate) => void): () => void;

  getMyId(): string;
  getRoomInfo(): Promise<Room>;
  sendSdpMessage(to: string, sessionDescription: string): Promise<void>;
  sendIceCandidateMessage(to: string, iceCandidate: string): Promise<void>;
}

export type Room = {
  roomId: number;
  joinedUserIds: Array<string>;
};

export type Sdp = {
  sessionDescription: string;
  fromId: string;
  toId: string;
};

export type IceCandidate = {
  iceCandidate: string;
  fromId: string;
  toId: string;
};

export class GrpcApiClient implements ApiClient {
  private readonly myId;
  private isJoinedToRoom: boolean;

  constructor(private readonly url: string) {
    this.myId = nanoid();
    this.isJoinedToRoom = false;
  }

  createNewRoom(): Promise<Room> {
    return new Promise((done) => {
      grpc.invoke<CreateRoomRequest, PbRoom, HelloCreateRoom>(
        Hello.CreateRoom,
        {
          host: this.url,
          request: new CreateRoomRequest(),

          onMessage: (response) => {
            done({
              roomId: response.getRoomId(),
              joinedUserIds: response.getJoinedUserIdsList(),
            });
          },

          onEnd: (code, msg, meta) => {
            console.trace(
              `grpc.invoke to ${this.url} finished with code: ${code}, msg: ${msg}, meta: ${meta}`,
            );
          },
        },
      );
    });
  }

  async joinRoom(roomId: number): Promise<SignallingStream> {
    const client = grpc.client<
      SendSignallingMessage,
      RecvSignallingMessage,
      HelloSignalling
    >(Hello.Signalling, {
      host: this.url,
      transport: grpc.WebsocketTransport(),
    });

    if (this.isJoinedToRoom) {
      throw new Error(
        "unimplemented: rejoining to room is currently not supported.",
      );
    }

    this.isJoinedToRoom = true;

    return new GrpcSignallingStream(client, this.myId, roomId);
  }
}

type EmitterT = {
  sdp: (s: Sdp) => void;
  iceCandidate: (i: IceCandidate) => void;

  // internal use
  roomInfo: (r: PbRoom) => void;
};

export class GrpcSignallingStream implements SignallingStream {
  private emitter: Emitter<EmitterT>;

  constructor(
    private client: grpc.Client<SendSignallingMessage, RecvSignallingMessage>,
    private readonly myId: string,
    roomId: number,
  ) {
    this.emitter = createNanoEvents();

    client.start();

    const selfIntro = new SelfIntroduceMessage();
    selfIntro.setMyId(myId);
    selfIntro.setRoomId(roomId);

    const req = new SendSignallingMessage();
    req.setSelfIntro(selfIntro);

    client.send(req);

    client.onMessage((m) => {
      this.onClientMessage(m);
    });
  }

  getMyId(): string {
    return this.myId;
  }

  private async onClientMessage(msg: RecvSignallingMessage): Promise<void> {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (msg.hasRoomInfoResponse()) {
      console.trace("got RoomInfoResponse");
      this.emitter.emit("roomInfo", msg.getRoomInfoResponse()!);

      return;
    }

    if (msg.hasSdpMessage()) {
      const origin = msg.getSdpMessage();
      const converted: Sdp = {
        sessionDescription: origin!.getSessionDescription(),
        fromId: origin!.getFromId(),
        toId: origin!.getToId(),
      };

      this.emitter.emit("sdp", converted);
      return;
    }

    if (msg.hasIceMessage()) {
      const origin = msg.getIceMessage()!;
      const converted: IceCandidate = {
        iceCandidate: origin!.getIceCandidate(),
        fromId: origin!.getFromId(),
        toId: origin!.getToId(),
      };

      this.emitter.emit("iceCandidate", converted);
      return;
    }
  }

  on(
    ev: "sdp" | "iceCandidate",
    func: ((s: Sdp) => void) | ((i: IceCandidate) => void),
  ): () => void {
    return this.emitter.on(ev, func);
  }

  getRoomInfo(): Promise<Room> {
    return new Promise((ok) => {
      const request = new SendSignallingMessage();
      request.setRoomInfoRequest(new RoomInfoRequest());

      this.client.send(request);

      console.trace("sent RoomInfoRequest");

      const dispose = this.emitter.on("roomInfo", (room) => {
        dispose();
        ok({
          roomId: room.getRoomId(),
          joinedUserIds: room.getJoinedUserIdsList(),
        });
      });
    });
  }

  sendSdpMessage(to: string, sessionDescription: string): Promise<void> {
    const sdpMsg = new SendSdpMessage();
    sdpMsg.setSessionDescription(sessionDescription);
    sdpMsg.setToId(to);

    const req = new SendSignallingMessage();
    req.setSdpMessage(sdpMsg);

    this.client.send(req);
    return Promise.resolve();
  }

  sendIceCandidateMessage(to: string, iceCandidate: string): Promise<void> {
    const iceMsg = new SendIceCandidateMessage();
    iceMsg.setIceCandidate(iceCandidate);
    iceMsg.setToId(to);

    const req = new SendSignallingMessage();
    req.setIceMessage(iceMsg);

    this.client.send(req);
    return Promise.resolve();
  }
}
