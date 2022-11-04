import { ButtonProps } from "../../types/ui/button";
import { StyleEnabled, Base } from "./Base";
import { Button as JoyButton } from "@mui/joy";
import { useCallback } from "react";

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