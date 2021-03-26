import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { useStore } from "../lib/webrtc/store";

import Editor from "../components/Editor";

import styles from "./Edit.module.scss";

const Edit: FC<BrowserRouterProps> = () => {
  const {
    store: { takenPhotoUrl },
  } = useStore();

  return (
    <div>
      <div className={styles["editor_wrapper"]}>
        <Editor backgroundImagePath={takenPhotoUrl!} />
      </div>
    </div>
  );
};

export default Edit;
