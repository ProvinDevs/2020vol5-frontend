import type { FC, DetailedHTMLProps } from "react";
import styles from "./Button.module.scss";

type Props = DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const Button: FC<Props> = (props) => {
  const { children, className, ...other } = props;
  return (
    <button className={styles["square"] + " " + className} {...other}>
      {children}
    </button>
  );
};

export default Button;
