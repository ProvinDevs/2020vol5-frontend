import { Drawable } from "./Drawable";
import { Movable } from "./Movable";
import { Vector2 } from "../math";

export class SelectBox implements Drawable {
  constructor(public selectedObject?: Movable) {}

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.selectedObject === undefined) return;
    ctx.translate(...this.selectedObject.position.toArray());
    ctx.rotate(this.selectedObject.angle);
    const [x, y] = this.selectedObject.size.clone().div(2).toArray();
    const vertex: [Vector2, Vector2, Vector2, Vector2] = [
      new Vector2(-x, -y),
      new Vector2(x, -y),
      new Vector2(x, y),
      new Vector2(-x, y),
    ];

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
      ctx.arc(...point.toArray(), 20, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.stroke();
    });

    ctx.rotate(-this.selectedObject.angle);
    ctx.translate(...this.selectedObject.position.clone().negate().toArray());
  }
}
