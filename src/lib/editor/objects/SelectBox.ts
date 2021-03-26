import { Drawable } from "./Drawable";
import { Movable } from "./Movable";
import { Vector2 } from "../math";

export class SelectBox implements Drawable {
  constructor(private handleSize: number, public selectedObject?: Movable) {}

  private static getHandlePositions(
    object: Movable,
  ): [Vector2, Vector2, Vector2, Vector2] {
    const [x, y] = object.size.clone().div(2).toArray();
    return [
      new Vector2(-x, -y),
      new Vector2(x, -y),
      new Vector2(x, y),
      new Vector2(-x, y),
    ].map((p) => p.rotate(object.angle).add(object.position)) as [
      Vector2,
      Vector2,
      Vector2,
      Vector2,
    ];
  }

  isOnHandle(position: Vector2): boolean {
    if (this.selectedObject === undefined) return false;
    return SelectBox.getHandlePositions(this.selectedObject).some(
      (point) => point.distanceTo(position) < this.handleSize,
    );
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.selectedObject === undefined) return;
    const vertex = SelectBox.getHandlePositions(this.selectedObject);

    // 枠の描画
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    vertex.forEach((point) => ctx.lineTo(...point.toArray()));
    ctx.closePath();
    ctx.stroke();

    // 各頂点のリサイズハンドルの描画
    vertex.forEach((point) => {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";
      ctx.arc(...point.toArray(), this.handleSize, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.stroke();
    });
  }
}
