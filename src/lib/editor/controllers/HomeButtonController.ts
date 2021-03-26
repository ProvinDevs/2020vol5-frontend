import type { History } from "history";

import HomeIcon from "../../../assets/home.svg";

import { Vector2 } from "../math";
import { Circle, Drawable, Group } from "../objects";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class HomeButtonController {
  private homeButton: Circle | undefined;
  public readonly objects = new Group<Drawable>();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly history: History,
  ) {
    this.onResize();
    setTimeout(this.onResize, 1000);

    canvas.addEventListener("mouseup", this.onClick);
  }

  destruct = (): void => {
    this.canvas.removeEventListener("mouseup", this.onClick);
  };

  onResize = (): void => {
    const minEdge = Math.min(this.canvas.width, this.canvas.height);
    const radius = minEdge / 20;
    const buttonX = minEdge * 0.1;
    const buttonY = minEdge * 0.1;

    this.objects.remove(this.homeButton!);

    this.homeButton = new Circle(
      new Vector2(buttonX, buttonY),
      radius,
      "white",
      HomeIcon,
      0.5,
    );

    this.objects.add(this.homeButton);
  };

  private getClickPoint(event: MouseEvent): Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    return new Vector2(x, y);
  }

  onClick = (e: MouseEvent): void => {
    const clickedPoint = this.getClickPoint(e);

    if (this.homeButton!.contains(clickedPoint)) {
      this.history.replace("/");
    }
  };
}
