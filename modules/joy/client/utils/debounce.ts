import { useCallback } from "react";

export function debounce<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let timeout: any = undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait) ;
  };
}

export function useDebounce<T extends (...args: any[]) => any>(fn: T, wait: number, deps?: any[]) {
  return useCallback(debounce(fn, wait), deps || []);
}