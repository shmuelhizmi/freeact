import { BaseProps, GridTemplate, Size } from "../../types/ui/base";
import { styled } from "@mui/joy";

export type StyleEnabled = {
    className?: string;
};

const makeGridTemplate = (template?: GridTemplate) => {
    if (Array.isArray(template)) {
        return template.join(" ");
    }
    return template;
}

const stringSize = (size?: Size | number) => {
    if (typeof size === "number") {
        return `${size}px`;
    }
    return size || "initial";
}

export const Base = <P extends BaseProps & StyleEnabled> (Comp: React.ComponentType<P>): React.ComponentType<Omit<P, keyof StyleEnabled>> => {
    const StyledComp = styled(Comp)(({ columns: gridTemplateColumns, rows: gridTemplateRows, gap, padding, radius, rowEnd, rowStart, columnEnd, columnStart }) => ({
        display: "grid",
        gridTemplateColumns: makeGridTemplate(gridTemplateColumns),
        gridTemplateRows: makeGridTemplate(gridTemplateRows),
        placeItems: "center",
        placeContent: "center",
        height: "100%",
        width: "100%",
        gap: stringSize(gap),
        padding: stringSize(padding),
        boxSizing: "border-box",
        margin: 0,
        borderRadius: radius,
        gridRowEnd: rowEnd,
        gridRowStart: rowStart,
        gridColumnEnd: columnEnd,
        gridColumnStart: columnStart,
    }))
    return StyledComp as any;
}