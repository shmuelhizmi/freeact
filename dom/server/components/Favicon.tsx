import fs from "fs/promises";
import mime from "mime-types";
import { FaviconProps } from "../../favicon";
import { DomComponents } from "../../types";
import { useEffect, useState } from "react";
import React from "react";
import { Components } from "../../../types/module";

/**
 * convert to base64 data url
 * @param {string | Buffer} pathOrBuffer
 * @param {string} [mimeType]
 */
export async function toDataUrl(
  pathOrBuffer: string | Buffer,
  type?: string
): Promise<string> {
  if (typeof pathOrBuffer === "string") {
    if (!type) {
      type = mime.lookup(pathOrBuffer) || undefined;
    }
    pathOrBuffer = await fs.readFile(pathOrBuffer);
  }
  type ||= "image/svg+xml";
  return `data:${type};base64,${pathOrBuffer.toString("base64")}`;
}

export function createFavicon(clientComps: Components<DomComponents>) {
  const { Favicon: FaviconView } = clientComps;
  return function Favicon(props: FaviconProps) {
    const [dataUrl, setDataUrl] = useState<string>("");
    useEffect(() => {
      if (props.type === "path") {
        toDataUrl(props.absolutePath).then(setDataUrl);
      } else {
        toDataUrl(props.data, props.mimeType).then(setDataUrl);
      }
    }, [props.type, props.type === "path" ? props.absolutePath : props.data]);
    if (!dataUrl) {
      return null;
    }
    return <FaviconView dataUrl={dataUrl} />;
  };
}
