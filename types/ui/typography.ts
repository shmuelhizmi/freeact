import { BaseProps } from "./base"
import { TypographyClasses } from "@mui/joy"
import React from "react";

export interface TypographyProps extends BaseProps {
    type: keyof TypographyClasses;
    children: string | number | (string | number)[];
}
export interface TypographyViewProps extends BaseProps {
    type: keyof TypographyClasses;
    txt: string;
}
