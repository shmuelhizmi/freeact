export interface InputProps  {
    label?: string;
    type?: "text" | "password" | "email" | "number" | "tel" | "url" | "area";
    fontSize?: number | string;
    value?: string;
    onChange?: (value: string) => void;
}