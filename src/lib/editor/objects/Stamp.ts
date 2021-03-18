import { Drawable } from "./Drawable";
import { Vector2 } from "../math/Vector2";

export class Stamp implements Drawable {
  private readonly _image: HTMLImageElement;

  constructor(
    private _position: Vector2,
    private _size: Vector2,
    private _angle: number,
    private readonly _imagePath: string,
  ) {
    this._image = new Image();
    this._image.src = _imagePath;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.translate(...this._position.toArray());
    ctx.rotate(this._angle);
    const offset = this._size.clone().div(2).negate().toArray();
    ctx.drawImage(this._image, ...offset, ...this._size.toArray());
    ctx.rotate(-this._angle);
    ctx.translate(...this._position.toArray());
  }
}
