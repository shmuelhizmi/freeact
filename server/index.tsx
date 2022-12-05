import { serve } from "./server";
import { createViewProxy } from "./view";
import { buildAdditionalComponents, createCompiler } from "./compiler";

export default createViewProxy({
  serve,
  createCompiler,
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

export { socketIoToTransport } from "./server";
export {
  buildAdditionalComponents,
  createCompiler,
}
