import type { FC } from "react";
import styles from "./Modal.module.scss";

type Props = {
  isClose: boolean;
  setMenuState: (state: boolean) => void;
};

const Modal: FC<Props> = (props) => (
  <div className={styles["modal"]}>
    <input
      type="checkbox"
      className={styles["modal-check"]}
      id="modal-check"
      checked={props.isClose}
      onClick={() => props.setMenuState(!props.isClose)}
      readOnly
    />
    <div className={styles["modal-body"]}>
      <label className={styles["modal-label"]} htmlFor="modal-check" />
      <div className={styles["modal-window"]}>
        <div className={styles["modal-inner"]}>
          <div className={styles["modal-content"]}>{props.children}</div>
        </div>
      </div>
    </div>
  </div>
);

export default Modal;
