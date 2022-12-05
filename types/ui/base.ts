import { ColorPaletteProp, VariantProp } from "../mui"

export type Size = `${number}px` | `${number}%` | `${number}rem` | `${number}em` | `${number}vw` | `${number}vh` | `${number}vmin` | `${number}vmax` | `${number}fr`;
type MinMax = `minmax(${Size}, ${Size})` | `min(${Size}, ${Size})` | `max(${Size}, ${Size})`
type Repeat = `repeat(${number}, ${Size | MinMax})`;
type Fit = `fit-content(${Size})`;
type Calc = `calc(${Size} ${'+' | '-' | '/'} ${Size})`;
type Auto = `auto-fit` | `auto-fill`;
export type GridTemplate = (Size | MinMax | Calc)[] | Repeat | Fit | Auto | Size | MinMax | Calc;

export interface BaseProps {
    variant?: VariantProp;
    color?: ColorPaletteProp;
    columns?: GridTemplate;
    rows?: GridTemplate;
    rowStart?: number;
    rowEnd?: number;
    columnStart?: number;
    columnEnd?: number;
    gap?: Size | number;
    padding?: Size | number;
    size?: "sm" | "md" | "lg";
    children?: React.ReactNode;
    radius?: Size | number;
}

export type StyleEnabled = {
    className?: string;
};