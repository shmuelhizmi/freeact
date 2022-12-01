export type FaviconProps = {
    absolutePath: string;
    type: 'path';
} | {
    data: Buffer;
    mimeType: string;
    type: 'data';
}

export interface FaviconViewProps {
    dataUrl: string;
}

export type ExposedFavicon = React.FC<FaviconProps>;
export type Favicon = React.FC<FaviconProps>;
