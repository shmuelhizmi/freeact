import * as React from "react";
import { ButtonProps } from "../../types/ui/button";
import {  Base } from "./Base";
import JoyButton from "@mui/joy/Button";
import { useCallback } from "react";
import { StyleEnabled } from "../../types/ui/base";

const Button = (props: ButtonProps & StyleEnabled) => {
  const { className, ...rest } = props;
  const onClick = useCallback(() => {
    props.onClick();
  }, [props.onClick]);
  return (
    <JoyButton className={className} {...rest} onClick={onClick}>
      {props.label}
    </JoyButton>
  );
};

export default Base(Button);