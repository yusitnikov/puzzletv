import { Absolute } from "../absolute/Absolute";
import { textColor } from "../../app/globals";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export interface LineProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width?: number;
    color?: string;
}

export const Line = observer(function LineFc({ x1, y1, x2, y2, width = 1, color = textColor }: LineProps) {
    profiler.trace();

    const padding = (width - 1) / 2;

    return (
        <Absolute
            left={x1 - padding}
            top={y1 - padding}
            width={x2 - x1 + width}
            height={y2 - y1 + width}
            style={{ backgroundColor: color }}
        />
    );
});
