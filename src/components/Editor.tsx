import type { FC } from "react";
import { useRef, useEffect } from "react";

import { Scene } from "../lib/editor/Scene";
import { Vector2 } from "../lib/editor/math";
import { Background, Movable, Group } from "../lib/editor/objects";
import { MovableController } from "../lib/editor/controllers/MovableController";
import { StampFactory } from "../lib/editor/factory/StampFactory";

import styles from "./Editor.module.scss";

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

    stampController.on("add", console.log);
    stampController.on("change", console.log);
    stampController.on("remove", console.log);

    // StampFactory.prototype.create()は本来Backgroundのロードが完全に終了した後に
    // 非同期的に呼び出されることを想定しているため、ここではsetTimeoutを用いて擬似的にBackground
    // の読み込みが終わった後に非同期的に呼び出しています。
    setTimeout(() => {
      const stampTest1 = stampFactory.create("innocent");
      const stampTest2 = stampFactory.create("innocent");
      stampTest2.position.add(new Vector2(0, 1000));
      stampController.add(stampTest1);
      stampController.add(stampTest2);
    }, 1000);

    // TODO: 追加実装

    let requestId: number;
    const animate = () => {
      scene.draw();
      requestId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(requestId);
      stampController.deconstructor();
    };
  }, [canvasRef, backgroundImagePath]);

  return <canvas className={styles["editor"]} ref={canvasRef} />;
};

export default Editor;
