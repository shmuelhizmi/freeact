import * as Customs from "./customs";
import * as UIs from "./ui";
import { Favicon } from "./customs/Favicon.ssr";
export { default as BaseWrapper } from "./baseWrapper";
export const Views = {
  ...UIs,
  ...Customs,
} as any;

export const SSRHeadViews = {
  Favicon,
} as any;
