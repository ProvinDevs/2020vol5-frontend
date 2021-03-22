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
    ];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.selectedObject === undefined) return;
    const vertex = SelectBox.getHandlePositions(this.selectedObject);
    ctx.translate(...this.selectedObject.position.toArray());
    ctx.rotate(this.selectedObject.angle);

    // 枠の描画
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.rect(...vertex[0].toArray(), ...this.selectedObject.size.toArray());
    ctx.stroke();

    // 各頂点のリサイズハンドルの描画
    vertex.forEach((point) => {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "black";
      ctx.arc(...point.toArray(), this.handleSize, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.stroke();
    });

    ctx.rotate(-this.selectedObject.angle);
    ctx.translate(...this.selectedObject.position.clone().negate().toArray());
  }
}
