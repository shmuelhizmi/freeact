import { BaseProps } from "./base";
import type { ButtonProps as JoyButtonProps } from "@mui/joy/Button"

export interface ButtonProps extends BaseProps<JoyButtonProps> {
    label: string;
    onClick: () => void;
}