import { Drawable } from "./Drawable";

export class Group implements Drawable {
  constructor(protected _children: Array<Drawable> = []) {}

  get children(): Array<Drawable> {
    return this._children;
  }
  add(obj: Drawable): this {
    this._children.push(obj);
    return this;
  }
  remove(obj: Drawable): this {
    this._children = this._children.filter((object) => !Object.is(object, obj));
    return this;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this._children.forEach((child) => child.draw(ctx));
  }
}
