import type { FC } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "./pages/Home";
import Take from "./pages/Take";
import Edit from "./pages/Edit";
import Finish from "./pages/Finish";

const App: FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/take" component={Take} />
        <Route exact path="/edit" component={Edit} />
        <Route exact path="/finish" component={Finish} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
