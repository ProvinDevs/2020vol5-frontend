import type { Dispatch } from "react";
import type { SignallingStream } from "../grpc";
import { createContext, useContext, useReducer } from "react";
import { ConnectionController } from "./connection";

type Store = Partial<{
  myId: string;
  roomId: number;
  mediaStream: MediaStream;
  signallingStream: SignallingStream;
  connectionController: ConnectionController;
  takenPhotoUrl: string;
}>;
type StoreDispatch = ((prev: Store) => Store) | Store;
export type StoreContext = {
  store: Store;
  setStore: Dispatch<StoreDispatch>;
};
const storeContext = createContext<StoreContext>({} as never);

export const StoreProvider = storeContext.Provider;

export const useStore = (): StoreContext => {
  return useContext(storeContext);
};

export const useStoreReducer = (): StoreContext => {
  const [store, setStore] = useReducer(
    (state: Store, action: StoreDispatch): Store => {
      if (typeof action === "function") {
        return Object.assign({}, state, action(state));
      }
      return Object.assign({}, state, action);
    },
    {},
  );
  return { store, setStore };
};
