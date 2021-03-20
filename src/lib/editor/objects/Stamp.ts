import { Movable } from "./Movable";
import { Vector2 } from "../math";

export class Stamp implements Movable {
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

  distanceTo(point: Vector2): number {
    const relativePos = point.clone().sub(this.position);
    const rotatedX =
      relativePos.x * Math.cos(-this.angle) -
      relativePos.y * Math.sin(-this.angle);
    const rotatedY =
      relativePos.x * Math.sin(-this.angle) +
      relativePos.y * Math.cos(-this.angle);
    const rotatedPos = new Vector2(rotatedX, rotatedY).add(this.position);

    const offset = this.size.clone().div(2);
    const rectMin = this.position.clone().sub(offset);
    const rectMax = this.position.clone().add(offset);

    const clampedPos = rotatedPos.clamp(rectMin, rectMax);
    return clampedPos.sub(rotatedPos).length();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.translate(...this.position.toArray());
    ctx.rotate(this.angle);
    const offset = this.size.clone().div(2).negate().toArray();
    ctx.drawImage(this._image, ...offset, ...this.size.toArray());
    ctx.rotate(-this.angle);
    ctx.translate(...this.position.clone().negate().toArray());
  }
}
