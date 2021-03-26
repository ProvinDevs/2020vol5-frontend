import DownloadIcon from "../../../assets/download.svg";

import { Vector2 } from "../math";
import { Background, Circle, Drawable, Group } from "../objects";
import { MovableController } from "./MovableController";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class TakePhotoButtonController {
  private takePhotoButton: Circle | undefined;
  public readonly objects = new Group<Drawable>();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly background: Background,
    private readonly stamps: MovableController,
  ) {
    this.onResize();
    setTimeout(this.onResize, 1000);

    canvas.addEventListener("mouseup", this.onClick);
  }

  destruct = (): void => {
    this.canvas.removeEventListener("mouseup", this.onClick);
  };

  onResize = (): void => {
    const radius = Math.min(this.canvas.width, this.canvas.height) / 16;
    const buttonX = this.canvas.width * 0.56;
    const buttonY = this.canvas.height * 0.9;

    this.objects.remove(this.takePhotoButton!);

    this.takePhotoButton = new Circle(
      new Vector2(buttonX, buttonY),
      radius,
      "#FECE0A",
      DownloadIcon,
      0.5,
    );

    this.objects.add(this.takePhotoButton);
  };

  private getClickPoint(event: MouseEvent): Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    return new Vector2(x, y);
  }

  onClick = async (e: MouseEvent): Promise<void> => {
    const clickedPoint = this.getClickPoint(e);

    if (this.takePhotoButton!.contains(clickedPoint)) {
      const canvas = new OffscreenCanvas(this.canvas.width, this.canvas.height);

      const ctx = canvas.getContext("2d");

      if (ctx == null) {
        throw new Error("failed to get offscreenCanvas");
      }

      this.background.draw((ctx as unknown) as CanvasRenderingContext2D);
      this.stamps.movables.draw((ctx as unknown) as CanvasRenderingContext2D);

      const photo = await canvas.convertToBlob({
        type: "image/jpeg",
        quality: 80,
      });

      const link = document.createElement("a");
      link.download = "photo.jpeg"; // downloaded filename
      link.href = URL.createObjectURL(photo);

      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }
  };
}
