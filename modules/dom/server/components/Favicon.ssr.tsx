import * as React from "react";
import { FaviconViewProps } from "../../types/favicon";

export function Favicon(props: FaviconViewProps) {
  return <link rel="shortcut icon" href={props.dataUrl} />;
}
