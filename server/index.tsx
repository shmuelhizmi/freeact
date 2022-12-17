import { serve, createSessionHandler } from "./server";
import { createViewProxy } from "./view";
import { buildAdditionalComponents, createCompiler } from "./compiler";
import { hostClientBundles, createHostClientBundlesMiddleware } from "./http";

export default createViewProxy({
  serve,
  createCompiler,
  hostClientBundles,
  createSessionHandler,
  createHostClientBundlesMiddleware,
});

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
  buildAdditionalComponents,
  createCompiler,
}
