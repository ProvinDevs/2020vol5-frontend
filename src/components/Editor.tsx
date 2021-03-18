import type { FC } from "react";
import { useRef, useEffect } from "react";

import { Scene } from "../lib/editor/Scene";
import { Background } from "../lib/editor/objects";
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

    // StampFactory.prototype.create()は本来Backgroundのロードが完全に終了した後に
    // 非同期的に呼び出されることを想定しているため、ここではsetTimeoutを用いて擬似的にBackground
    // の読み込みが終わった後に非同期的に呼び出しています。
    setTimeout(() => {
      const stampTest = stampFactory.create("innocent");
      scene.add(stampTest);
    }, 1000);

    // TODO: 追加実装

    let requestId: number;
    const animate = () => {
      scene.draw();
      requestId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(requestId);
  }, [canvasRef, backgroundImagePath]);

  return <canvas className={styles["editor"]} ref={canvasRef} />;
};

export default Editor;
