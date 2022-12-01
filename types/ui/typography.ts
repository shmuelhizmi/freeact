import { BaseProps } from "./base"
import { TypographyClasses } from "../mui";

export interface TypographyProps extends BaseProps {
    type: TypographyClasses;
    children: string | number | (string | number)[];
}
export interface TypographyViewProps extends BaseProps {
    type: TypographyClasses;
    txt: string;
}
