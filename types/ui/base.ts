import { ColorPaletteProp, VariantProp } from "@mui/joy"

export type Size = `${number}px` | `${number}%` | `${number}rem` | `${number}em` | `${number}vw` | `${number}vh` | `${number}vmin` | `${number}vmax` | `${number}fr`;
type MinMax = `minmax(${Size}, ${Size})` | `min(${Size})` | `max(${Size})`
type Repeat = `repeat(${number}, ${Size | MinMax})`;
type Fit = `fit-content(${Size})`;
type Auto = `auto-fit` | `auto-fill`;
export type GridTemplate = (Size | MinMax)[] | Repeat | Fit | Auto | Size | MinMax;

export interface BaseProps {
    variant?: VariantProp;
    color?: ColorPaletteProp;
    columns?: GridTemplate;
    rows?: GridTemplate;
    gap?: Size | number;
    padding?: Size | number;
    size?: "sm" | "md" | "lg";
    children?: React.ReactNode;
}