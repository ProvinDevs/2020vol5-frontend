import { Group, Movable } from "../objects";
import { Vector2 } from "../math";
import { assertNonNull } from "../../../utils/assert";

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

  private setSelectedObject(obj: Movable): void {
    this.movables.remove(obj);
    this.movables.add(obj);
    this.selectedObject = obj;
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
    const clickedObjects = this.getClickedObjects(clickedPos);
    const topClickedObject = clickedObjects.slice(-1)[0];

    if (topClickedObject === undefined) {
      this.selectedObject = undefined;
      return;
    }

    // すでに選択済みのオブジェクトがクリック箇所に存在して、
    // なおかつクリック箇所に他のオブジェクトが存在した場合、
    // 2番目に上にあるオブジェクトを選択できるようにする
    if (Object.is(topClickedObject, this.selectedObject)) {
      const topClickedObjectWithoutSelected = clickedObjects.slice(-2)[0];
      if (topClickedObjectWithoutSelected === undefined) return;
      assertNonNull(this.selectedObject, "this.selectedObject");

      // 選択済みのオブジェクトを一番下にする
      this.movables.remove(this.selectedObject);
      this.movables.children.unshift(this.selectedObject);

      this.setSelectedObject(topClickedObjectWithoutSelected);
      return;
    }

    this.setSelectedObject(topClickedObject);
  }
}
