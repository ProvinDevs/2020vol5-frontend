import { Drawable } from "./Drawable";
import { Emitter } from "../../../utils/emitter";

type EventMap<T extends Drawable> = {
  add: (obj: T) => void;
  remove: (obj: T) => void;
};

export class Group<T extends Drawable>
  extends Emitter<EventMap<T>>
  implements Drawable {
  constructor(protected _children: Array<T> = []) {
    super();
  }

  get children(): Array<T> {
    return this._children;
  }
  add(obj: T): this {
    this._children.push(obj);
    this.emit("add", obj);
    return this;
  }
  remove(obj: T): this {
    this._children = this._children.filter((object) => !Object.is(object, obj));
    this.emit("remove", obj);
    return this;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this._children.forEach((child) => child.draw(ctx));
  }
}
