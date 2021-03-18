export class Vector2 {
  constructor(public x = 0, public y = 0) {}

  get width(): number {
    return this.x;
  }
  set width(width: number) {
    this.x = width;
  }

  get height(): number {
    return this.y;
  }
  set height(height: number) {
    this.y = height;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  mul(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }
  div(s: number): this {
    this.x /= s;
    this.y /= s;
    return this;
  }

  negate(): this {
    return this.mul(-1);
  }

  static fromArray([x, y]: [number, number]): Vector2 {
    return new Vector2(x, y);
  }
  toArray(): [number, number] {
    return [this.x, this.y];
  }
}
