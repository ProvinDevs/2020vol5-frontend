import type { FC } from "react";
import { useRef, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { Scene } from "../lib/editor/Scene";
import { useStore } from "../lib/webrtc/store";
import { assertNonNull } from "../utils/assert";
import { StampFactory } from "../lib/editor/factory/StampFactory";
import { MovableController } from "../lib/editor/controllers/MovableController";
import { HomeButtonController } from "../lib/editor/controllers/HomeButtonController";
import { EmojiPaletteController } from "../lib/editor/controllers/EmojiPaletteController";
import { TakePhotoButtonController } from "../lib/editor/controllers/TakePhotoButtonController";
import {
  Background,
  Movable,
  Stamp,
  SerializableStamp,
} from "../lib/editor/objects";

import styles from "./Editor.module.scss";

type Message = {
  type: "add" | "change" | "remove";
  obj: string;
};

type Props = {
  backgroundImagePath: string;
};

const Editor: FC<Props> = ({ backgroundImagePath }) => {
  const {
    store: { connectionController },
  } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const history = useHistory();
  const [
    movableController,
    setMovableController,
  ] = useState<MovableController | null>(null);

  useEffect(() => {
    if (movableController === null) return;
    assertNonNull(connectionController);

    const handleAdd = (obj: Movable) => {
      connectionController.sendStampMessage(
        JSON.stringify({
          type: "add",
          obj: obj.toJson(),
        }),
      );
    };
    const handleChange = (obj: Movable) => {
      connectionController.sendStampMessage(
        JSON.stringify({
          type: "change",
          obj: obj.toJson(),
        }),
      );
    };
    const handleRemove = (obj: Movable) => {
      connectionController.sendStampMessage(
        JSON.stringify({
          type: "remove",
          obj: obj.toJson(),
        }),
      );
    };

    const handleMessage = (message: string) => {
      const data: Message = JSON.parse(message);
      switch (data.type) {
        case "add": {
          const stamp = Stamp.fromJson(data.obj);
          movableController.silentAdd(stamp);
          break;
        }
        case "change": {
          const serializedStamp: SerializableStamp = JSON.parse(data.obj);
          const stamp = movableController.movables.children.find(
            ({ id }) => id === serializedStamp.id,
          );
          assertNonNull(stamp);
          stamp.fromJson(data.obj);
          break;
        }
        // TODO: Remove処理
      }
    };

    movableController.on("add", handleAdd);
    movableController.on("change", handleChange);
    movableController.on("remove", handleRemove);
    connectionController.on("stampMessage", handleMessage);
    return () => {
      movableController.off("add", handleAdd);
      movableController.off("change", handleChange);
      movableController.off("remove", handleRemove);
      connectionController.off("stampMessage", handleMessage);
    };
  }, [movableController, connectionController]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    if (movableController !== null) return;

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
    const takePhotoButton = new TakePhotoButtonController(
      canvas,
      background,
      stampController,
    );
    scene.add(takePhotoButton.objects);

    stampController.on("add", console.log);
    stampController.on("change", console.log);
    stampController.on("remove", console.log);

    setMovableController(stampController);

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
  }, [canvasRef, setMovableController, backgroundImagePath]);

  return <canvas className={styles["editor"]} ref={canvasRef} />;
};

export default Editor;
