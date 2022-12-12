import { ExposedTerminal, TerminalViewProps } from './terminal';
import { ExposedFavicon, FaviconViewProps } from './favicon';
import { View } from "@react-fullstack/fullstack/shared"
import type { UIComponents, UIViews } from "./ui"

export type ExposedComponents = UIComponents & {
    Terminal: ExposedTerminal;
    Favicon: ExposedFavicon;
}
export type Components =  UIViews & {
    Terminal: View<TerminalViewProps>;
    Favicon: View<FaviconViewProps>;
}

export * as API from "./api"