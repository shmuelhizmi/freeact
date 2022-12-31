import React from "react";
import { FaviconViewProps } from "../../favicon";

export function Favicon(props: FaviconViewProps) {
  return <link rel="shortcut icon" href={props.dataUrl} />;
}
