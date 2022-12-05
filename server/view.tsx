import { ViewsProvider } from "@react-fullstack/fullstack/server";
import React from "react";
import { Components, ExposedComponents } from "../types";
import * as CompOverride from "./components";
import { replaceTextWithTypography } from "./utils";

export function createViewProxy<BaseObj ,AdditionalComps>(obj: BaseObj) {
  return new Proxy(CompOverride, {
    get: (target, prop) => {
      if (typeof prop !== "string") {
        throw new Error("Invalid prop");
      }
      if (prop in obj) {
        return obj[prop];
      }
      if (prop in React) {
        return React[prop];
      }
      if (!target[prop]) {
        target[prop] = (props: any) => {
          return (
            <ViewsProvider<Components>>
              {(Comps) => {
                const Comp = Comps[prop];
                if (!Comp) {
                  throw new Error(`Component ${prop} not found`);
                }
                const children = replaceTextWithTypography(props.children);
                return <Comp {...props} children={children} />;
              }}
            </ViewsProvider>
          );
        };
      }
      return target[prop];
    },
  }) as unknown as ExposedComponents & BaseObj & typeof React & AdditionalComps;
}
