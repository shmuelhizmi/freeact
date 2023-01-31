import type { TypographyProps, TypographyViewProps } from "./typography"
import type { InputProps } from "./input"
import type { ButtonProps } from "./button"
import type { BoxProps } from "./box"
import type { ImageProps } from "./image"
import * as React from "react"

export type ClientComponents = {
    Typography: TypographyViewProps;
    Button: ButtonProps;
    Input: InputProps;
    Box: BoxProps;
    Image: ImageProps;
    Baseline: {};
}

export type ServerComponents = {
    Typography: React.FC<TypographyProps>;
    Button: React.FC<ButtonProps>;
    Input: React.FC<InputProps>;
    Box: React.FC<BoxProps>;
    Image: React.FC<ImageProps>;
    Baseline: React.FC<{}>;
}