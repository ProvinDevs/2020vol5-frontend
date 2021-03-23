type ArgsType<T extends (...args: Array<unknown>) => unknown> = T extends (
  ...args: infer U
) => unknown
  ? U
  : never;

type EventMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [type: string]: (...args: Array<any>) => void;
};

export class Emitter<Events extends EventMap> {
  private _listenersMap = new Map<keyof Events, Array<Events[keyof Events]>>();

  on<K extends keyof Events>(type: K, callback: Events[K]): void {
    const listeners = this._listenersMap.get(type);
    if (listeners === undefined) {
      this._listenersMap.set(type, [callback]);
      return;
    }
    listeners.push(callback);
  }
  off<K extends keyof Events>(type: K, callback: Events[K]): void {
    const listeners = this._listenersMap.get(type);
    if (listeners === undefined) return;
    this._listenersMap.set(
      type,
      listeners.filter((listener) => !Object.is(listener, callback)),
    );
  }

  protected emit<K extends keyof Events>(
    type: K,
    ...callbackArgs: ArgsType<Events[K]>
  ): void {
    const listeners = this._listenersMap.get(type);
    if (listeners === undefined) return;
    listeners.forEach((listener) => listener(...callbackArgs));
  }
}
