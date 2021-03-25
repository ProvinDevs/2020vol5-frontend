import { Vector2 } from "../math";
import { Group, Circle, Drawable } from "../objects";
import smileIcon from "../../../assets/smile.svg";
import { EmojiPalette } from "../objects/EmojiPalette";
import { StampFactory } from "../factory/StampFactory";
import { MovableController } from "./MovableController";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class EmojiPaletteController {
  public objects: Group<Drawable> = new Group();
  private button: Circle | undefined;
  private palette: EmojiPalette | undefined;
  private isPaletteShown = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly emojiFactory: StampFactory,
    private readonly emojiController: MovableController,
  ) {
    canvas.addEventListener("mouseup", this.handleClick);

    // resize イベントを拾いたかったが上手く行かなかった
    // canvas.addEventListener("resize", this.onResize);

    this.onResize();

    setTimeout(this.onResize, 1000);
  }

  private onResize = (): void => {
    const radius = Math.min(this.canvas.width, this.canvas.height) / 16;
    const buttonX = this.canvas.width * 0.33;
    const buttonY = this.canvas.height * 0.9;

    this.objects.remove(this.button!);
    this.button = new Circle(
      new Vector2(buttonX, buttonY),
      radius,
      "white",
      smileIcon,
      0.6,
    );
    this.objects.add(this.button);

    // palette
    const paletteBottomY = buttonY - radius;
    this.objects.remove(this.palette!);

    this.palette = new EmojiPalette(
      new Vector2(buttonX, paletteBottomY),
      radius,
    );

    if (this.isPaletteShown) {
      this.objects.add(this.palette);
    }
  };

  private togglePaletteShown() {
    if (this.isPaletteShown) {
      this.objects.remove(this.palette!);
    } else {
      this.objects.add(this.palette!);
    }

    this.isPaletteShown = !this.isPaletteShown;
  }

  destruct = (): void => {
    this.canvas.removeEventListener("mouseup", this.handleClick);
  };

  private getClickedPoint = (event: MouseEvent): Vector2 => {
    const fullArea = this.canvas.getBoundingClientRect();

    const x =
      (event.clientX - fullArea.left) * (this.canvas.width * fullArea.width);
    const y =
      (event.clientY - fullArea.top) * (this.canvas.height * fullArea.height);

    return new Vector2(x, y);
  };

  private getClickPoint = (event: MouseEvent): Vector2 => {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    return new Vector2(x, y);
  };

  private handleClick = (event: MouseEvent): void => {
    const clickPoint = this.getClickPoint(event);

    if (this.button!.contains(clickPoint)) {
      this.togglePaletteShown();
      return;
    }

    if (this.isPaletteShown) {
      const emojiOnClickPoint = this.palette!.getEmojiOnPos(clickPoint);

      if (emojiOnClickPoint != null) {
        const emoji = this.emojiFactory.create(emojiOnClickPoint);
        this.emojiController.add(emoji);
      }
    }
  };
}
