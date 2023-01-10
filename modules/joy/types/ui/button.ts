import { BaseProps } from "./base";

export interface ButtonProps extends BaseProps {
    label: string;
    onClick: () => void;
}