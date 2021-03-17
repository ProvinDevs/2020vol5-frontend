import { Drawable } from "./Drawable";

export class Background implements Drawable {
  private readonly image: HTMLImageElement;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    public imagePath: string,
  ) {
    this.image = new Image();
    this.image.addEventListener("load", () => {
      this.canvas.width = this.image.naturalWidth;
      this.canvas.height = this.image.naturalHeight;
    });
    this.image.src = imagePath;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.image, 0, 0);
  }
}
