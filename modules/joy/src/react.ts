import { createCompiler } from "freeact";
import JOY from ".";
// import DOM from "../dom";

export default createCompiler()
  .addModule(JOY)
  // .addModule(DOM)
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
