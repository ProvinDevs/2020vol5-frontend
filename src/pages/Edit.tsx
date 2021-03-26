import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useState } from "react";

import Editor from "../components/Editor";
import Modal from "../components/common/Modal";

import styles from "./Edit.module.scss";
import mockedImage from "../mock/image.jpg";

const Edit: FC<BrowserRouterProps> = () => {
  const [isOpen, setMenuState] = useState<boolean>(false);
  return (
    <div>
      <Modal isOpen={isOpen} setMenuState={setMenuState} />
      <button onClick={() => setMenuState(!isOpen)}>開く</button>
      <div className={styles["editor_wrapper"]}>
        <Editor backgroundImagePath={mockedImage} />
      </div>
    </div>
  );
};

export default Edit;
