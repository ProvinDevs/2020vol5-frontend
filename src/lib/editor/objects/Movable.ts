import { Vector2 } from "../math";
import { Drawable } from "./Drawable";

export interface Movable extends Drawable {
  position: Vector2;
  size: Vector2;
  angle: number;
  readonly id: string;
  distanceTo(point: Vector2): number;
}
