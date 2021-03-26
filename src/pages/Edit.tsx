import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useState } from "react";

import Editor from "../components/Editor";
import Modal from "../components/common/Modal";

import styles from "./Edit.module.scss";
import mockedImage from "../mock/image.jpg";

const Edit: FC<BrowserRouterProps> = () => {
  const [isClose, setMenuState] = useState<boolean>(true);
  return (
    <div>
      <Modal isClose={isClose} setMenuState={setMenuState} />
      <button onClick={() => setMenuState(!isClose)}>開く</button>
      <div className={styles["editor_wrapper"]}>
        <Editor backgroundImagePath={mockedImage} />
      </div>
    </div>
  );
};

export default Edit;
