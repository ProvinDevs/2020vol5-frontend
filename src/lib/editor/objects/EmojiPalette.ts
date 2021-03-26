import { Vector2 } from "../math";
import { Drawable } from "./Drawable";
import { StampKey, stamps } from "../factory/StampFactory";

if (stamps.length > 9) {
  console.warn("今の所EmojiPaletteは3x3しか表示できません");
}

// helper function not to forget to restore globalAlpha
const withAlpha = (
  ctx: CanvasRenderingContext2D,
  alpha: number,
  f: () => void,
) => {
  ctx.globalAlpha = alpha;
  f();
  ctx.globalAlpha = 1.0;
};

const emojis: ReadonlyArray<[StampKey, HTMLImageElement]> = stamps.map(
  ([name, url]) => {
    const image = new Image();
    image.src = url;
    return [name, image];
  },
);

type N = number;
type N2 = [N, N];
type N3N2 = [N2, N2, N2];
type N4N2 = [N2, N2, N2, N2];

const bodyAlpha = 0.9;

export class EmojiPalette implements Drawable {
  constructor(public bottomPoint: Vector2, public triangleSideLength: number) {}

  private get triangleHeight() {
    return (Math.sqrt(3) / 2) * this.triangleSideLength;
  }

  private drawTriangle(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();

    const vertexes: N3N2 = [
      // 下
      [this.bottomPoint.x, this.bottomPoint.y - 50],

      // 左上
      [
        this.bottomPoint.x - this.triangleSideLength / 2,
        this.bottomPoint.y - this.triangleHeight,
      ],

      // 右上
      [
        this.bottomPoint.x + this.triangleSideLength / 2,
        this.bottomPoint.y - this.triangleHeight,
      ],
    ];

    ctx.moveTo(...vertexes[0]);
    ctx.lineTo(...vertexes[1]);
    ctx.lineTo(...vertexes[2]);

    ctx.fillStyle = "#1E1E1E";
    withAlpha(ctx, bodyAlpha, () => ctx.fill());
  }

  private get bodySideLength() {
    return this.triangleSideLength * 7;
  }

  private get bodyVertexes(): N4N2 {
    return [
      [
        this.bottomPoint.x - this.bodySideLength / 2,
        this.bottomPoint.y - this.triangleHeight,
      ],
      [
        this.bottomPoint.x + this.bodySideLength / 2,
        this.bottomPoint.y - this.triangleHeight,
      ],
      [
        this.bottomPoint.x - this.bodySideLength / 2,
        this.bottomPoint.y - this.triangleHeight - this.bodySideLength,
      ],
      [
        this.bottomPoint.x + this.bodySideLength / 2,
        this.bottomPoint.y - this.triangleHeight - this.bodySideLength,
      ],
    ];
  }

  private get emojiSideLength() {
    return this.bodySideLength / 3;
  }

  private get emojiPadding() {
    return this.emojiSideLength * 0.2;
  }

  private drawBody(ctx: CanvasRenderingContext2D): void {
    const vertexes = this.bodyVertexes;

    ctx.beginPath();
    this.roundedRect(
      ctx,
      this.bottomPoint.x - this.bodySideLength / 2,
      this.bottomPoint.y - this.triangleHeight - this.bodySideLength,
      this.bodySideLength,
      this.bodySideLength,
      50,
    );

    withAlpha(ctx, bodyAlpha, () => ctx.fill());

    // draw emojis

    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const index = col * 3 + row;
        const image = emojis[index]?.[1];

        if (image == null) {
          return;
        }

        if (image.complete) {
          const bodyTopLeft = vertexes[2];

          ctx.drawImage(
            image,
            bodyTopLeft[0] + this.emojiSideLength * row + this.emojiPadding,
            bodyTopLeft[1] + this.emojiSideLength * col + this.emojiPadding,
            this.emojiSideLength - this.emojiPadding * 2,
            this.emojiSideLength - this.emojiPadding * 2,
          );
        }
      }
    }
  }

  getEmojiOnPos(pos: Vector2): StampKey | undefined {
    const vertexes = this.bodyVertexes;
    const bodyTopLeft = vertexes[2];

    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const index = col * 3 + row;

        const center: N2 = [
          bodyTopLeft[0] +
            this.emojiSideLength * row +
            this.emojiSideLength / 2,
          bodyTopLeft[1] +
            this.emojiSideLength * col +
            this.emojiSideLength / 2,
        ];

        const abs = Math.abs;

        // |(x-p)+(y-q)| + |(x-p)-(y-q)| <= a
        const isInBound =
          this.emojiSideLength >=
          abs(pos.x - center[0] + (pos.y - center[1])) +
            abs(pos.x - center[0] - (pos.y - center[1]));

        if (isInBound) {
          return emojis[index]?.[0];
        }
      }
    }

    return undefined;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawTriangle(ctx);
    this.drawBody(ctx);
  }

  private roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
  }
}
