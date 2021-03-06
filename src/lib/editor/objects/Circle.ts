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
      this.foregroundImage = new Image();
      this.foregroundImage.src = foregroundImageURL;
    }
  }

  contains(point: Vector2): boolean {
    const sq = (x: number) => x * x;

    return (
      sq(this.radius) >=
      sq(point.x - this.center.x) + sq(point.y - this.center.y)
    );
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#333";
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();

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
