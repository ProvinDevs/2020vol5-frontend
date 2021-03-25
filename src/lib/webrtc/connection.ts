import { SignallingStream } from "../grpc";
import { Emitter } from "../../utils/emitter";

type ConnectionEventMap = {
  establishConnection: (connection: Connection) => void;
};
export class Connection extends Emitter<ConnectionEventMap> {
  mediaStream?: MediaStream;

  private peer: RTCPeerConnection;
  private iceCandidateBuffer: Array<RTCIceCandidateInit> = [];

  constructor(
    private _myId: string,
    public id: string,
    private _signallingStream: SignallingStream,
    mediaStream: MediaStream,
    offer?: RTCSessionDescriptionInit,
  ) {
    super();
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    mediaStream
      .getTracks()
      .forEach((track) => this.peer.addTrack(track, mediaStream));

    this.peer.addEventListener("track", (event) => {
      const stream = event.streams[0];
      if (stream === undefined) return;
      this.mediaStream = stream;
    });

    this._signallingStream.on("iceCandidate", async (event) => {
      if (event.fromId !== this.id) return;

      const iceCandidate: RTCIceCandidateInit = JSON.parse(event.iceCandidate);
      await this.peer.addIceCandidate(iceCandidate);
    });

    this.peer.addEventListener("icecandidate", (event) => {
      if (event.candidate === null) return;
      if (this.peer.signalingState === "stable") {
        this._signallingStream
          .sendIceCandidateMessage(this.id, JSON.stringify(event.candidate))
          .catch(console.error);
        return;
      }
      this.iceCandidateBuffer.push(event.candidate);
    });

    const handleSignallingStatusChange = () => {
      if (this.peer.signalingState === "stable") {
        console.info(`${this.id}: Signalling status is now stable`);
        this.peer.removeEventListener(
          "signalingstatechange",
          handleSignallingStatusChange,
        );
        this.iceCandidateBuffer.forEach((iceCandidate) => {
          this._signallingStream
            .sendIceCandidateMessage(this.id, JSON.stringify(iceCandidate))
            .catch(console.error);
        });
        return;
      }
    };
    this.peer.addEventListener(
      "signalingstatechange",
      handleSignallingStatusChange,
    );

    this.peer.addEventListener("connectionstatechange", () => {
      if (this.peer.connectionState === "connected") {
        console.info(`${this.id}: Connected`);
        this.emit("establishConnection", this);
      }
    });

    if (offer !== undefined) {
      this.setOffer(offer).catch(console.error);
      return;
    }
    this.createOffer();
  }

  async setOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    await this.peer.setRemoteDescription(offer);
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    await this._signallingStream.sendSdpMessage(
      this.id,
      JSON.stringify(answer),
    );
  }
  createOffer(): void {
    (async () => {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      await this._signallingStream.sendSdpMessage(
        this.id,
        JSON.stringify(offer),
      );
    })();

    const offSdp = this._signallingStream.on("sdp", (event) => {
      if (event.fromId !== this.id) return;
      offSdp();
      const description: RTCSessionDescriptionInit = JSON.parse(
        event.sessionDescription,
      );
      this.peer.setRemoteDescription(description).catch(console.error);
    });
  }
}

type ConnectionControllerEventMap = {
  addConnection: (connection: Connection) => void;
  establishConnection: (connection: Connection) => void;
};
export class ConnectionController extends Emitter<ConnectionControllerEventMap> {
  connections: Array<Connection> = [];

  constructor(
    private _myId: string,
    private _signallingStream: SignallingStream,
    private _mediaStream: MediaStream,
  ) {
    super();
    this._signallingStream.on("sdp", (event) => {
      if (this.connections.some(({ id }) => id === event.fromId)) {
        return;
      }

      const description: RTCSessionDescriptionInit = JSON.parse(
        event.sessionDescription,
      );
      const connection = this.createConnection(event.fromId, description);
      this.connections.push(connection);
      this.emit("addConnection", connection);
    });
  }

  addFromId(ids: Array<string>): void {
    const connections = ids.map((id) => this.createConnection(id));
    this.connections.push(...connections);
    connections.forEach((connection) => this.emit("addConnection", connection));
  }

  private createConnection(
    id: string,
    description?: RTCSessionDescriptionInit,
  ): Connection {
    const connection = new Connection(
      this._myId,
      id,
      this._signallingStream,
      this._mediaStream,
      description,
    );
    connection.on("establishConnection", (connection) =>
      this.emit("establishConnection", connection),
    );
    return connection;
  }
}
