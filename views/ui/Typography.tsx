import { TypographyViewProps } from "../../types/ui/typography";
import { StyleEnabled, Base } from "./Base";
import { Typography as JoyTypography } from "@mui/joy";

const Typography = (props: TypographyViewProps & StyleEnabled) => {
  const { className, ...rest } = props;
  return (
    <JoyTypography className={className} {...rest}>
      {props.txt}
    </JoyTypography>
  );
};

export default Base(Typography);