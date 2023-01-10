import { createCompiler } from "freeact/compiler";
import JOY from ".";
import DOM from "@freeact/dom";

export default createCompiler()
  .addModule(JOY)
  .addModule(DOM)
  .compile();

export {
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
} from "react";
