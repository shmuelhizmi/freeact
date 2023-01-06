import type { TypographyProps, TypographyViewProps } from "./typography"
import type { InputProps } from "./input"
import type { ButtonProps } from "./button"
import type { BoxProps } from "./box"
import type { SelectProps } from "./select"
import type { MDProps } from "./md"
import type { SliderProps } from "./slider"
import type { UploadProps } from "./upload"
import type { ImageProps } from "./image"
import React from "react"

export type ClientComponents = {
    Typography: TypographyViewProps;
    Button: ButtonProps;
    Input: InputProps;
    Box: BoxProps;
    Select: SelectProps<any>;
    MD: MDProps;
    Slider: SliderProps;
    Upload: UploadProps;
    Image: ImageProps;
    Baseline: {};
}

export type ServerComponents = {
    Typography: React.FC<TypographyProps>;
    Button: React.FC<ButtonProps>;
    Input: React.FC<InputProps>;
    Box: React.FC<BoxProps>;
    Select: <T extends string>(props: SelectProps<T>) => JSX.Element;
    MD: React.FC<MDProps>;
    Slider: React.FC<SliderProps>;
    Upload: React.FC<UploadProps>;
    Image: React.FC<ImageProps>;
    Baseline: React.FC<{}>;
}