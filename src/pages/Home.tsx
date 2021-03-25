import type { FC } from "react";
import type { BrowserRouterProps } from "react-router-dom";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import styles from "./Home.module.scss";

const Home: FC<BrowserRouterProps> = () => {
  return (
    <div className={styles["wrapper"]}>
      <div className={styles["inner-wrapper"]}>
        <h1 className={styles["title"]}>撮影をはじめよう</h1>
        <Button buttonStyle="square">
          <Link to="take">撮影ルームを作成</Link>
        </Button>
        <span className={styles["or"]}>または</span>
        <Input
          placeholder="撮影ルームの部屋番号を入力"
          className={styles["input"]}
        />
        <Button buttonStyle="square">
          <Link to="take">撮影ルームに入る</Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;
