import { Movable } from "./Movable";
import { Vector2 } from "../math";
import { nanoid } from "nanoid";

export class Stamp implements Movable {
  private readonly _image: HTMLImageElement;

  constructor(
    public position: Vector2,
    public size: Vector2,
    public angle: number,
    private readonly _imagePath: string,
    public readonly id: string = nanoid(),
  ) {
    this._image = new Image();
    this._image.src = _imagePath;
  }

  distanceTo(point: Vector2): number {
    const rotatedPos = point.clone().rotateAround(-this.angle, this.position);

    // Stampの長方形の最小座標と最大座標を取得
    const offset = this.size.clone().div(2);
    const rectMin = this.position.clone().sub(offset);
    const rectMax = this.position.clone().add(offset);

    // Stampから回転済みの座標までの距離を計算
    const clampedPos = rotatedPos.clone().clamp(rectMin, rectMax);
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
