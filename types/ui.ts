import type { TypographyProps, TypographyViewProps } from "./ui/typography"
import type { InputProps } from "./ui/input"
import type { ButtonProps } from "./ui/button"
import type { BoxProps } from "./ui/box"
import type { SelectProps } from "./ui/select"
import type { MDProps } from "./ui/md"
import type { SliderProps } from "./ui/slider"
import type { UploadProps } from "./ui/upload"
import { View } from "@react-fullstack/fullstack"
import React from "react"

export type UIViews = {
    Typography: View<TypographyViewProps>;
    Button: View<ButtonProps>;
    Input: View<InputProps>;
    Box: View<BoxProps>;
    Select: View<SelectProps<any>>;
    MD: View<MDProps>;
    Slider: View<SliderProps>;
    Upload: View<UploadProps>;
}

export type UIComponents = {
    Typography: React.FC<TypographyProps>;
    Button: React.FC<ButtonProps>;
    Input: React.FC<InputProps>;
    Box: React.FC<BoxProps>;
    Select: <T extends string>(props: SelectProps<T>) => JSX.Element;
    MD: React.FC<MDProps>;
    Slider: React.FC<SliderProps>;
    Upload: React.FC<UploadProps>;
}