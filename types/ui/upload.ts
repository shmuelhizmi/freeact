import { BaseProps } from "./base"
export interface UploadProps extends BaseProps {
    label: string;
    type: 'file' | 'image';
    /**
     * @format base64
     */
    onUpload: (file: string) => void;
}
