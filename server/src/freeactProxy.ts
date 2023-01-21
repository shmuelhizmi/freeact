import * as React from "react";
import { ModulesComponents, ServerModules } from "@freeact/types";


export const PRIVATE_FREEACT_SET_MODULES = Symbol("FREEACT_SETMODULES");

export const createFreeactProxy = <
  Modules extends ServerModules,
  Base extends Record<string, any>
>(base: Base) => {
  let compiledModules: Record<string, Record<string, React.ComponentType>> = {};
  return new Proxy(base, {
    get(target, prop) {
      if (prop === PRIVATE_FREEACT_SET_MODULES) {
        return (modules: Record<string, Record<string, React.ComponentType>>) => {
          compiledModules = modules;
        }
      }
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      if (prop in compiledModules) {
        return compiledModules[prop as keyof typeof compiledModules];
      }
    },
  }) as Base & ModulesComponents<Modules>;
};