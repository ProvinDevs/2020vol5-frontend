import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";

import Editor from "../components/Editor";

import styles from "./Edit.module.scss";
import mockedImage from "../mock/image.jpg";

const Edit: FC<BrowserRouterProps> = () => {
  return (
    <div>
      <div className={styles["editor_wrapper"]}>
        <Editor backgroundImagePath={mockedImage} />
      </div>
    </div>
  );
};

export default Edit;
