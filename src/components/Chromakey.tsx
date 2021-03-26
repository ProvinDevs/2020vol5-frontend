import type { FC } from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import "./Pic.scss";

interface IAppInterface {
  MediaStream: MediaStream[];
}

const Chtomakey: FC<IAppInterface> = (prop) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let canvasList: HTMLCanvasElement[] = [];
  let videoList: HTMLVideoElement[] = [];
  useEffect(() => {
    if (prop.MediaStream[0] == null) return;
    var list = document.getElementById("list");
    for (let i = 0; i < prop.MediaStream.length; i++) {
      const canvas = document.createElement("canvas");
      canvas.className = "canvas";
      canvas.width = 960;
      canvas.height = 540;
      list?.appendChild(canvas);
      canvasList.push(canvas);
      const video = document.createElement("video");
      video.autoplay = true;
      video.srcObject = prop.MediaStream[i]!;
      videoList.push(video);
    }
    let requestId: number;

    const count = canvasList.length;

    const anime = () => {
      for (let i = 0; i < count; i++) {
        const ctx = canvasList[i]?.getContext("2d");
        ctx?.drawImage(videoList[i]!, 0, 0, 960, 540);
        let imgData = ctx!.getImageData(0, 0, 960, 540);
        let data = imgData.data;
        let nn = 960 * 540 * 4;
        for (let pi = 0; pi < nn; pi += 4) {
          const r = data[pi];
          const g = data[pi + 1];
          const b = data[pi + 2];
          //ノイズが発生するため要調整
          if (r! >= 250 && g! >= 250 && b! >= 250) {
            data[pi + 3] = 0;
          }
        }
        ctx?.putImageData(imgData, 0, 0);
      }
      requestId = requestAnimationFrame(anime);
    };
    anime();

    return () => {
      canvasList.map((x) => {
        x.remove();
      });
      //canvasList[0]!.remove();
      cancelAnimationFrame(requestId);
    };
  }, [prop]);
  return (
    <>
      <div id="list"></div>
    </>
  );
};

export default Chtomakey;
