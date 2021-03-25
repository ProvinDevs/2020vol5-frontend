import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import Pic from "../components/Pic";

const Take: FC<BrowserRouterProps> = () => {
  return (
    <div>
      <h1>This is Take page.</h1>
      <Pic />
    </div>
  );
};

export default Take;
