import type { FC } from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import "./Pic.scss";

const Pic: FC = () => {
  const [model, setModel] = useState<bodyPix.BodyPix>();
  const [camera, setCamera] = useState<MediaStream>();

  useEffect(() => {
    bodyPix.load().then((net) => {
      setModel(net);
      console.log("bodyPix ready");
    });
  }, []);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
        },
      })
      .then((stream) => {
        setCamera(stream);
      });
  }, []);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    if (model == undefined || camera == undefined) return;

    const video = document.createElement("video");
    video.autoplay = true;
    video.srcObject = camera!;

    const EditCanvas = document.createElement("canvas");
    EditCanvas.width = 960;
    EditCanvas.height = 540;
    const canvasCtx = EditCanvas.getContext("2d");

    let requestId: number;
    const animate = () => {
      canvasCtx!.drawImage(video, 0, 0, canvas.width, canvas.height);
      model.segmentPerson(EditCanvas).then((segmentation) => {
        const bgColor = { r: 255, g: 255, b: 255, a: 255 };
        const fgColor = { r: 0, g: 0, b: 0, a: 0 };
        const roomPartImage = bodyPix.toMask(segmentation, fgColor, bgColor);
        const opacity = 1.0;
        const maskBlurAmount = 3;
        const flipHorizontal = false;
        // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
        // maskBlurAmount set to 3, this will darken the background and blur the
        // darkened background's edge.
        bodyPix.drawMask(
          canvas,
          EditCanvas,
          roomPartImage,
          opacity,
          maskBlurAmount,
          flipHorizontal,
        );
      });
      requestId = requestAnimationFrame(animate);
    };
    animate();
    //tsの型定義をいれる
    //const stream = canvas.cuptureStream();
    return () => {
      camera.getTracks().forEach((track) => track.stop());
      cancelAnimationFrame(requestId);
    };
  }, [model, camera]);
  return <div />;
};

export default Pic;
