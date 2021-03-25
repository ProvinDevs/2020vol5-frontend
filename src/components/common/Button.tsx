import type { FC, DetailedHTMLProps } from "react";
import styles from "./Button.module.scss";

type Props = {
  buttonStyle: "square" | "round";
} & DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const Button: FC<Props> = (props) => {
  const { children, className, buttonStyle, ...other } = props;
  return (
    <button className={styles[buttonStyle] + " " + className} {...other}>
      {children}
    </button>
  );
};

export default Button;
