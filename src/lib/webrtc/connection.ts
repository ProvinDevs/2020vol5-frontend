import { SignallingStream } from "../grpc";

export class Connection {
  mediaStream?: MediaStream;

  private peer: RTCPeerConnection;

  constructor(
    private _myId: string,
    private _id: string,
    private _signallingStream: SignallingStream,
    mediaStream: MediaStream,
    offer?: RTCSessionDescriptionInit,
  ) {
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
      if (event.fromId !== this._id) return;

      const iceCandidate: RTCIceCandidateInit = JSON.parse(event.iceCandidate);
      await this.peer.addIceCandidate(iceCandidate);
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
    await this._signallingStream.sendSdpMessage(
      this._id,
      JSON.stringify(answer),
    );
  }
  createOffer(): void {
    (async () => {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      await this._signallingStream.sendSdpMessage(
        this._id,
        JSON.stringify(offer),
      );
    })();

    const offSdp = this._signallingStream.on("sdp", (event) => {
      if (event.fromId !== this._id) return;
      offSdp();
      const description: RTCSessionDescriptionInit = JSON.parse(
        event.sessionDescription,
      );
      this.peer.setRemoteDescription(description).catch(console.error);
    });
  }
}
