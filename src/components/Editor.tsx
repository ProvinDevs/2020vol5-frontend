import type { FC } from "react";
import { useRef, useEffect } from "react";

import { assertNonNull } from "../utils/assert";

const Editor: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    assertNonNull(ctx, "ctx");

    // TODO: 追加実装
  }, [canvasRef]);

  return <canvas ref={canvasRef} />;
};

export default Editor;
