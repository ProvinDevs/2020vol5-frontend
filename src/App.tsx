import type { FC } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { StoreProvider, useStoreReducer } from "./lib/webrtc/store";

import Home from "./pages/Home";
import Take from "./pages/Take";
import Edit from "./pages/Edit";
import NotFound from "./pages/NotFound";

const App: FC = () => {
  const store = useStoreReducer();

  return (
    <StoreProvider value={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/take" component={Take} />
          <Route exact path="/edit" component={Edit} />
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;
