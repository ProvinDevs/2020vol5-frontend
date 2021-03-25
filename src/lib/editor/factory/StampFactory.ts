import { Stamp } from "../objects";
import { Vector2 } from "../math";
import { assertNonNull } from "../../../utils/assert";

import joyPath from "../../../assets/stamps/joy.svg";
import roflPath from "../../../assets/stamps/rofl.svg";
import woozyPath from "../../../assets/stamps/woozy.svg";
import innocentPath from "../../../assets/stamps/innocent.svg";
import heartEyesPath from "../../../assets/stamps/heart_eyes.svg";
import starStruckPath from "../../../assets/stamps/star_struck.svg";

// prettier-ignore
export const stamps = [
  ["joy",         joyPath],
  ["rofl",        roflPath],
  ["woozy",       woozyPath],
  ["innocent",    innocentPath],
  ["heart_eyes",  heartEyesPath],
  ["star_struck", starStruckPath],
] as const;

export type StampKey = typeof stamps[number][0];
export type StampMap = ReadonlyMap<StampKey, string>;

export const stampMap: StampMap = new Map(stamps);

export class StampFactory {
  constructor(private _canvas: HTMLCanvasElement) {}

  private getInitialSize(): Vector2 {
    const minEdge = Math.min(this._canvas.width, this._canvas.height);
    const size = minEdge / 5;

    return new Vector2(size, size);
  }

  create(name: StampKey): Stamp {
    const position = new Vector2(this._canvas.width, this._canvas.height).div(
      2,
    );
    const size = this.getInitialSize();
    const angle = 0;
    const imagePath = stampMap.get(name);
    assertNonNull(imagePath, "imagePath");

    return new Stamp(position, size, angle, imagePath);
  }
}
