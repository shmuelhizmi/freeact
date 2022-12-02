import { ImageProps } from "../../types/ui/image";
import { StyleEnabled, Base } from "./Base";

const Image = (props: ImageProps & StyleEnabled) => {
  const { className, ...rest } = props;

  return (
    <img className={className} {...rest} />
  );
};

export default Base(Image);