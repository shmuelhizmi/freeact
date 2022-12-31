import { useEffect } from "react";
import { FaviconViewProps } from "../../favicon";


export default function Favicon(props: FaviconViewProps) {
    useEffect(() => {
        const dataUrl = props.dataUrl;
        const link =( document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement;
        const type = dataUrl.match(/data:([^;]+)/)?.[1] || "image/svg+xml";
        link.type = type;
        link.rel = "shortcut icon";
        link.href = dataUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
    }, [props.dataUrl]);
    return null;
}
