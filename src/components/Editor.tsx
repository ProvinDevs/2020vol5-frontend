import type { FC } from "react";
import { useRef, useEffect } from "react";

import { Scene } from "../lib/editor/Scene";
import { Background } from "../lib/editor/objects";
import { MovableController } from "../lib/editor/controllers/MovableController";
import { StampFactory } from "../lib/editor/factory/StampFactory";

import styles from "./Editor.module.scss";
import { EmojiPaletteController } from "../lib/editor/controllers/EmojiPaletteController";
import { TakePhotoButtonController } from "../lib/editor/controllers/TakePhotoButtonController";

type Props = {
  backgroundImagePath: string;
};
const Editor: FC<Props> = ({ backgroundImagePath }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const scene = new Scene(canvas);
    const background = new Background(canvas, backgroundImagePath);
    scene.add(background);
    const stampFactory = new StampFactory(canvas);
    const stampController = new MovableController(canvas);
    scene.add(stampController.movables);
    scene.add(stampController.selectBox);

    const emojiPalette = new EmojiPaletteController(
      canvas,
      stampFactory,
      stampController,
    );

    scene.add(emojiPalette.objects);

    const takePhotoButton = new TakePhotoButtonController(
      canvas,
      background,
      stampController,
    );
    scene.add(takePhotoButton.objects);

    stampController.on("add", console.log);
    stampController.on("change", console.log);
    stampController.on("remove", console.log);

    let requestId: number;
    const animate = () => {
      scene.draw();
      requestId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(requestId);
      stampController.deconstructor();
      emojiPalette.destruct();
    };
  }, [canvasRef, backgroundImagePath]);

  return <canvas className={styles["editor"]} ref={canvasRef} />;
};

export default Editor;
