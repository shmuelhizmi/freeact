import React from "react";
import { TypographyProps } from "../../types/ui/typography";
import { ClientComponents } from "../../types";
import { nodeToText } from "../../../../server/utils/nodeToText";
import { Components } from "../../../../types/module";

export const createTypography = (components: Components<ClientComponents>) => {
  const { Typography: TypographyView } = components;

  function Typography(props: TypographyProps) {
    return <TypographyView txt={nodeToText(props.children)} {...props} />;
  }
  return Typography;
};
