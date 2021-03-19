import { Group } from "../objects";

export class MovableController {
  constructor(private canvas: HTMLCanvasElement, private movables: Group) {
    canvas.addEventListener("mousedown", this.handleMousedown, false);
    canvas.addEventListener("mousemove", this.handleMousemove, false);
    canvas.addEventListener("mouseup", this.handleMouseup, false);
  }
  deconstructor(): void {
    this.canvas.removeEventListener("mousedown", this.handleMousedown, false);
    this.canvas.removeEventListener("mousemove", this.handleMousemove, false);
    this.canvas.removeEventListener("mouseup", this.handleMouseup, false);
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
