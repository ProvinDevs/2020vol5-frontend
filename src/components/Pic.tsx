import type { FC } from "react";
import { useRef, useEffect, useState } from "react";
import "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
//import styles from "./Editor.module.scss";

const Pic: FC = () => {
  const [model, setModel] = useState<bodyPix.BodyPix>();

  useEffect(() => {
    bodyPix.load().then((net) => {
      setModel(net);
    });
  }, []);
  return (
    <>
      <p>neko</p>
    </>
  );
};

export default Pic;
