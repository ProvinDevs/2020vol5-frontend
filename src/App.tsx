import type { FC } from "react";

import Editor from "./components/Editor";

import mockedImage from "./mock/image.jpg";
import styles from "./App.module.scss";

const App: FC = () => {
  return (
    <div className={styles["editor_wrapper"]}>
      <Editor backgroundImagePath={mockedImage} />
    </div>
  );
};

export default App;
