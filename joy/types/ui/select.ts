import { BaseProps } from "./base";

export interface SelectProps<T extends string> extends BaseProps {
    label: string;
    type?: "radio" | "checkbox" | "dropdown";
    defaultValue?: T;
    options: {
        label: string;
        value: T;
    }[];
    onChange?: (value: T) => void;
}