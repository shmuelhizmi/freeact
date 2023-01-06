import React from "react";
import { TypographyViewProps } from "../types/ui/typography";
import { Base } from "./Base";
import { Typography as JoyTypography } from "@mui/joy";
import { StyleEnabled } from "../types/ui/base";

const Typography = (props: TypographyViewProps & StyleEnabled) => {
  const { className, type, ...rest } = props;
  if (type === "none") {
    return <>{rest.txt}</>;
  }
  return (
    <JoyTypography className={className} level={type} {...rest}>
      {props.txt}
    </JoyTypography>
  );
};

export default Base(Typography);
