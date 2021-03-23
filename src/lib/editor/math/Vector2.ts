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

  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
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

  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }
  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  clamp(min: Vector2, max: Vector2): this {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  }

  distanceTo(point: Vector2): number {
    return this.clone().sub(point).length();
  }

  angle(): number {
    return Math.atan2(this.y, this.x) + Math.PI;
  }

  rotate(angle: number): this {
    const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    this.x = x;
    this.y = y;
    return this;
  }
  rotateAround(angle: number, center: Vector2): this {
    return this.sub(center).rotate(angle).add(center);
  }

  static fromArray([x, y]: [number, number]): Vector2 {
    return new Vector2(x, y);
  }
  toArray(): [number, number] {
    return [this.x, this.y];
  }
}
