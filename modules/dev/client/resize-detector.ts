import { useEffect, useRef, useState } from "react";

export function useResize() {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const onResize = () => {
        if (ref.current) {
            setWidth(ref.current.offsetWidth);
            setHeight(ref.current.offsetHeight);
        }
    }

    useEffect(() => {
        onResize();
        const observer = new ResizeObserver(onResize);
        observer.observe(ref.current!);
        return () => observer.disconnect();
    }, []);

    return {
        ref,
        width,
        height,
    };
}