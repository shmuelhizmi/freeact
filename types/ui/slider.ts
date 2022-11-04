import { BaseProps } from "./base";

export interface SliderProps extends BaseProps {
    label: string;
    defaultValue?: number;
    onChange?: (value: number) => void;
}