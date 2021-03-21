import { Drawable, Group } from "./objects";
import { assertNonNull } from "../../utils/assert";

export class Scene extends Group<Drawable> {
  private readonly _ctx: CanvasRenderingContext2D;

  constructor(public readonly canvas: HTMLCanvasElement) {
    super();
    const ctx = canvas.getContext("2d");
    assertNonNull(ctx, "ctx");
    this._ctx = ctx;
  }

  draw(): void {
    this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    super.draw(this._ctx);
  }
}
