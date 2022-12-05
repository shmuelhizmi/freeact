import { StyleEnabled } from "./ui/base";

export type AdditionalComponentsExportBase = Record<
  string,
  React.FunctionComponent<StyleEnabled & any>
>;
