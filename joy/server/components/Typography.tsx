import { ViewsProvider } from "@react-fullstack/fullstack/server";
import React from "react";
import { Components } from "../../types";
import { TypographyProps } from "../../types/ui/typography";
import { nodeToText } from "../utils/nodeToText";

export const Typography = (props: TypographyProps) => (
  <ViewsProvider<Components>>
    {({ Typography: TP }) => <TP txt={nodeToText(props.children)} {...props} />}
  </ViewsProvider>
);
