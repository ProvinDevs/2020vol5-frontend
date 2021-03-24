import type { Dispatch } from "react";
import { createContext, useContext, useReducer } from "react";

type Store = Partial<{
  mediaStream: MediaStream;
}>;
type StoreDispatch = ((prev: Store) => Store) | Store;
type StoreContext = {
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
