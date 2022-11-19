import { ExposedTerminal, TerminalViewProps } from './terminal';
import { View } from "@react-fullstack/fullstack/shared"
import type { UIComponents, UIViews } from "./ui"

export type ExposedComponents = UIComponents & {
    Terminal: ExposedTerminal;
}
export type Components =  UIViews & {
    Terminal: View<TerminalViewProps>;
}

// TODO - patch this to be dynamic in the future
export const ViewNames: (keyof Components)[] = [
    "Typography",
    "Button",
    "Input",
    "Box",
    "Select",
    "MD",
    "Slider",
    "Upload",
    "Terminal"
];

export const Views: Components = ViewNames.reduce((acc, name) => {
    acc[name] = {} as any;
    return acc;
}, {} as any);