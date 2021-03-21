import { Group, Movable } from "../objects";
import { Vector2 } from "../math";

export class MovableController {
  selectedObject?: Movable;
  clickOffset?: Vector2;
  isClick = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private movables: Group<Movable>,
  ) {
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);

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
    this.isClick = true;
    const clickedPos = this.getClickPoint(event);
    if (this.selectedObject !== undefined) {
      this.clickOffset = this.selectedObject.position.clone().sub(clickedPos);
    }

    const topClickedObj = this.getClickedObjects(clickedPos).slice(-1)[0];
    if (topClickedObj === undefined) return;

    this.movables.remove(topClickedObj);
    this.movables.add(topClickedObj);
    this.selectedObject = topClickedObj;
    this.clickOffset = topClickedObj.position.clone().sub(clickedPos);
  }

  private handleMousemove(event: MouseEvent): void {
    this.isClick = false;
    if (this.selectedObject === undefined || this.clickOffset === undefined) {
      return;
    }

    const clickedPos = this.getClickPoint(event);
    this.selectedObject.position = clickedPos.clone().add(this.clickOffset);
  }

  private handleMouseup(event: MouseEvent): void {
    this.clickOffset = undefined;
    if (!this.isClick) return;

    const clickedPos = this.getClickPoint(event);
    const topClickedObjWithoutSelected = this.getClickedObjects(clickedPos)
      .filter((obj) => !Object.is(obj, this.selectedObject))
      .slice(-1)[0];
    if (topClickedObjWithoutSelected === undefined) {
      this.selectedObject = undefined;
      return;
    }
    this.movables.remove(topClickedObjWithoutSelected);
    this.movables.add(topClickedObjWithoutSelected);
    this.selectedObject = topClickedObjWithoutSelected;
  }
}
