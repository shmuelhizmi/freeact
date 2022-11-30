
import * as CompOverride from "./components";
import { Components, ExposedComponents } from "../types";
import { ViewsProvider } from "@react-fullstack/fullstack/server";
import React from "react";
import { serve } from "./server";


export default new Proxy(CompOverride, {
  get: (target, prop) => {
    if (typeof prop !== "string") {
      throw new Error("Invalid prop");
    }
    if (prop === "serve") {
      return serve;
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
              return <Comp {...props} />;
            }}
          </ViewsProvider>
        );
      };
    }
    return target[prop];
  },
}) as unknown as ExposedComponents & { serve: typeof serve } & typeof React;


export {
  useState,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  useContext,
  useRef,
  useImperativeHandle,
  useSyncExternalStore,
  useDebugValue,
  useId,
  Component,
  PureComponent,
  createContext,
  forwardRef,
  memo,
  Fragment,
  Children,
  createElement,
  cloneElement,
  createFactory,
  isValidElement,
  version,
} from "react";

export {
  socketIoToTransport,
} from "./server";