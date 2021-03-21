import { Drawable } from "./Drawable";
import { Movable } from "./Movable";

export class SelectBox implements Drawable {
  constructor(public selectedObject?: Movable) {}

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.selectedObject === undefined) return;
    ctx.translate(...this.selectedObject.position.toArray());
    ctx.rotate(this.selectedObject.angle);
    const offset = this.selectedObject.size.clone().div(2).negate().toArray();
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.rect(...offset, ...this.selectedObject.size.toArray());
    ctx.stroke();
    ctx.rotate(-this.selectedObject.angle);
    ctx.translate(...this.selectedObject.position.clone().negate().toArray());
  }
}
