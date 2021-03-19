import { Drawable } from "./Drawable";

export class Group<T extends Drawable> implements Drawable {
  constructor(protected _children: Array<T> = []) {}

  get children(): Array<T> {
    return this._children;
  }
  add(obj: T): this {
    this._children.push(obj);
    return this;
  }
  remove(obj: T): this {
    this._children = this._children.filter((object) => !Object.is(object, obj));
    return this;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this._children.forEach((child) => child.draw(ctx));
  }
}
