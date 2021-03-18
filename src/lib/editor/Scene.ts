import { Drawable } from "./objects";
import { assertNonNull } from "../../utils/assert";

export class Scene {
  private readonly _ctx: CanvasRenderingContext2D;
  private _children: Array<Drawable> = [];

  constructor(public readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    assertNonNull(ctx, "ctx");
    this._ctx = ctx;
  }

  get children(): ReadonlyArray<Drawable> {
    return this._children;
  }
  add(obj: Drawable): this {
    this._children.push(obj);
    return this;
  }
  remove(obj: Drawable): this {
    this._children = this._children.filter((object) => Object.is(object, obj));
    return this;
  }

  draw(): void {
    this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._children.forEach((obj) => obj.draw(this._ctx));
  }
}
