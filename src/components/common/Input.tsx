import React, { DetailedHTMLProps, FC } from "react";

import styles from "./Input.module.scss";

type Props = DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const Input: FC<Props> = (props) => {
  const { children, className, ...inputProps } = props;

  return (
    <div>
      <label>
        <input className={styles["input"] + " " + className} {...inputProps} />
        {children}
      </label>
    </div>
  );
};

export default Input;
