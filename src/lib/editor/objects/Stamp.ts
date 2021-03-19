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
    // TODO: 実装
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
