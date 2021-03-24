import { createContext } from "react";
import { Vector2 } from "../math";
import { Drawable } from "./Drawable";

export class Circle implements Drawable {
  private foregroundImage: HTMLImageElement | undefined;
  private foregroundImageLoaded = false;

  constructor(
    public center: Vector2,
    public radius: number,
    public color: string,
    foregroundImageURL?: string,
    public foregroundSizeMultiplier?: number,
  ) {
    if (foregroundImageURL) {
      console.log("trying to load", foregroundImageURL);
      this.foregroundImage = new Image();
      this.foregroundImage.src = foregroundImageURL;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();

    ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    if (this.foregroundImage && this.foregroundImage.complete) {
      const innerRadius = this.radius * (this.foregroundSizeMultiplier ?? 1);

      const topLeftX = this.center.x - innerRadius;
      const topLeftY = this.center.y - innerRadius;

      ctx.drawImage(
        this.foregroundImage,
        topLeftX,
        topLeftY,
        innerRadius * 2,
        innerRadius * 2,
      );
    }
  }
}
