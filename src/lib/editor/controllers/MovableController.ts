import { Group, Movable, SelectBox } from "../objects";
import { Vector2 } from "../math";
import { assertNonNull } from "../../../utils/assert";
import { Emitter } from "../../../utils/emitter";

type EventMap = {
  add: (obj: Movable) => void;
  change: (obj: Movable) => void;
  remove: (obj: Movable) => void;
};

// †神クラス†
export class MovableController extends Emitter<EventMap> {
  readonly movables = new Group<Movable>();
  selectedObject?: Movable;
  clickOffset?: Vector2;
  angleOffset?: number;
  isClick = false;
  selectBox = new SelectBox(6);

  constructor(private canvas: HTMLCanvasElement) {
    super();
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

  add(obj: Movable): void {
    this.movables.add(obj);
    this.emit("add", obj);
  }
  remove(obj: Movable): void {
    this.movables.remove(obj);
    this.emit("remove", obj);
  }
  silentAdd(obj: Movable): void {
    this.movables.add(obj);
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
    this.selectBox.selectedObject = obj;
  }
  private unsetSelectedObject(): void {
    this.selectedObject = undefined;
    this.selectBox.selectedObject = undefined;
  }

  private handleMousedown(event: MouseEvent): void {
    this.isClick = true;
    const clickedPos = this.getClickPoint(event);

    if (
      this.selectedObject !== undefined &&
      this.selectBox.isOnHandle(clickedPos)
    ) {
      const handleAngle = clickedPos
        .clone()
        .sub(this.selectedObject.position)
        .angle();
      this.angleOffset = this.selectedObject.angle - handleAngle;
      return;
    }
    if (this.selectedObject !== undefined) {
      this.clickOffset = this.selectedObject.position.clone().sub(clickedPos);
    }

    const topClickedObj = this.getClickedObjects(clickedPos).slice(-1)[0];
    if (topClickedObj === undefined) return;

    this.setSelectedObject(topClickedObj);
    this.clickOffset = topClickedObj.position.clone().sub(clickedPos);
  }

  private handleMousemove(event: MouseEvent): void {
    this.isClick = false;
    if (this.selectedObject === undefined) return;

    const clickedPos = this.getClickPoint(event);

    if (this.angleOffset !== undefined) {
      const handleAngle = clickedPos
        .clone()
        .sub(this.selectedObject.position)
        .angle();
      this.selectedObject.angle = handleAngle + this.angleOffset;

      const sizeArray = clickedPos
        .clone()
        .sub(this.selectedObject.position)
        .rotate(-this.selectedObject.angle)
        .mul(2)
        .toArray()
        .map((size) => Math.abs(size));
      const size = Math.min(...sizeArray);
      this.selectedObject.size.x = Math.abs(size);
      this.selectedObject.size.y = Math.abs(size);

      return;
    }

    if (this.clickOffset !== undefined) {
      this.selectedObject.position = clickedPos.clone().add(this.clickOffset);
      return;
    }
  }

  private handleMouseup(event: MouseEvent): void {
    this.clickOffset = undefined;
    this.angleOffset = undefined;
    if (!this.isClick) {
      if (this.selectedObject !== undefined) {
        this.emit("change", this.selectedObject);
      }
      return;
    }

    const clickedPos = this.getClickPoint(event);
    const clickedObjects = this.getClickedObjects(clickedPos);
    const topClickedObject = clickedObjects.slice(-1)[0];

    if (topClickedObject === undefined) {
      this.unsetSelectedObject();
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
