import { Drawable } from "./Drawable";
import { Vector2 } from "../math";

export class Stamp implements Drawable {
  private readonly _image: HTMLImageElement;

  constructor(
    public position: Vector2,
    public size: Vector2,
    public angle: number,
    private readonly _imagePath: string,
  ) {
    this._image = new Image();
    this._image.src = _imagePath;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.translate(...this.position.toArray());
    ctx.rotate(this.angle);
    const offset = this.size.clone().div(2).negate().toArray();
    ctx.drawImage(this._image, ...offset, ...this.size.toArray());
    ctx.rotate(-this.angle);
    ctx.translate(...this.position.toArray());
  }
}
