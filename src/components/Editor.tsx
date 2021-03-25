import type { FC } from "react";
import { useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { Scene } from "../lib/editor/Scene";
import { Background } from "../lib/editor/objects";
import { StampFactory } from "../lib/editor/factory/StampFactory";
import { MovableController } from "../lib/editor/controllers/MovableController";
import { HomeButtonController } from "../lib/editor/controllers/HomeButtonController";
import { EmojiPaletteController } from "../lib/editor/controllers/EmojiPaletteController";

import styles from "./Editor.module.scss";

type Props = {
  backgroundImagePath: string;
};
const Editor: FC<Props> = ({ backgroundImagePath }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const history = useHistory();

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
    const homeButton = new HomeButtonController(canvas, history);
    scene.add(homeButton.objects);

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
