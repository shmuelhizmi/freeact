import * as React from "react";
import { StyleEnabled } from "../../types/ui/base";
import { ImageProps } from "../../types/ui/image";
import { Base } from "./Base";

const Image = (props: ImageProps & StyleEnabled) => {
  const { className } = props;

  return (
    <img className={className} src={props.url} alt={props.alt} />
  );
};

export default Base(Image);