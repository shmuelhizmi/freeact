import { ColorPaletteProp, VariantProp } from "./mui"

export type Size = `${number}px` | `${number}%` | `${number}rem` | `${number}em` | `${number}vw` | `${number}vh` | `${number}vmin` | `${number}vmax` | `${number}fr`;
type MinMax = `minmax(${Size}, ${Size})` | `min(${Size}, ${Size})` | `max(${Size}, ${Size})`
type Repeat = `repeat(${number}, ${Size | MinMax})`;
type Fit = `fit-content(${Size})`;
type Calc = `calc(${Size} ${'+' | '-' | '/'} ${Size})`;
type Auto = `auto-fit` | `auto-fill`;
export type GridTemplate = (Size | MinMax | Calc)[] | Repeat | Fit | Auto | Size | MinMax | Calc;

export type BaseProps<MuiCompProps extends Record<string, any> = {}> =  PickSharedProps<MuiCompProps> & {
    columns?: GridTemplate;
    rows?: GridTemplate;
    rowStart?: number;
    rowEnd?: number;
    columnStart?: number;
    columnEnd?: number;
    gap?: Size | number;
    padding?: Size | number;
    children?: React.ReactNode;
    radius?: Size | number;
}

export type SharedStylingProps = {
    size?: "sm" | "md" | "lg";
    variant?: VariantProp;
    color?: ColorPaletteProp;
}

export type PickSharedProps<MuiCompProps extends Record<string, any>> = OmitNever<{
    [K in keyof SharedStylingProps]: K extends keyof MuiCompProps ? MuiCompProps[K] : never;
}>;

export type OmitNever<T> = Pick<T, {
    [K in keyof T]: T[K] extends (never | undefined | null) ? never : K;
}[keyof T]>;


export type StyleEnabled = {
    className?: string;
};
