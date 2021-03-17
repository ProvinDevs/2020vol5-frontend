import type { FC } from "react";
import { useRef, useEffect } from "react";

import { Scene } from "../lib/editor/Scene";
import { Background } from "../lib/editor/objects";

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

    // TODO: 追加実装

    let requestId: number;
    const animate = () => {
      scene.draw();
      requestId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(requestId);
  }, [canvasRef, backgroundImagePath]);

  return <canvas ref={canvasRef} />;
};

export default Editor;
