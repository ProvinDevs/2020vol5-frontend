import { Group, Movable } from "../objects";
import { Vector2 } from "../math";

type MovingObjectInfo = {
  object: Movable;
  offset: Vector2;
};

export class MovableController {
  movingObjectInfo?: MovingObjectInfo;

  constructor(
    private canvas: HTMLCanvasElement,
    private movables: Group<Movable>,
  ) {
    canvas.addEventListener("mousedown", this.handleMousedown, false);
    canvas.addEventListener("mousemove", this.handleMousemove, false);
    canvas.addEventListener("mouseup", this.handleMouseup, false);
  }
  deconstructor(): void {
    this.canvas.removeEventListener("mousedown", this.handleMousedown, false);
    this.canvas.removeEventListener("mousemove", this.handleMousemove, false);
    this.canvas.removeEventListener("mouseup", this.handleMouseup, false);
  }

  private getClickPoint(event: MouseEvent): Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    return new Vector2(x, y);
  }

  private getClickedObjects(position: Vector2): Array<Movable> {
    return this.movables.children.filter(
      (obj) => obj.distanceTo(position) === 0,
    );
  }

  private handleMousedown(event: MouseEvent): void {
    // TODO: 実装
  }

  private handleMousemove(event: MouseEvent): void {
    // TODO: 実装
  }

  private handleMouseup(event: MouseEvent): void {
    // TODO: 実装
  }
}
