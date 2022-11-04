import { BaseProps } from "./base";

export interface InputProps extends BaseProps {
    label: string;
    type: "text" | "password" | "email" | "number" | "tel" | "url" | "area";
    defaultValue?: string;
    onChange?: (value: string) => void;
}