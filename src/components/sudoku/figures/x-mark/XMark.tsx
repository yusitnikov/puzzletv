import {Position} from "../../../../types/layout/Position";
import {blackColor} from "../../../app/globals";

const radius = 0.2;
const lineWidth = 0.02;

export interface XMarkProps extends Position {
    isFilled?: boolean;
}

export const XMark = ({left, top}: XMarkProps) => <>
    <line
        x1={left - radius * 0.7}
        y1={top - radius * 0.7}
        x2={left + radius * 0.7}
        y2={top + radius * 0.7}
        strokeWidth={lineWidth}
        stroke={blackColor}
    />

    <line
        x1={left + radius * 0.7}
        y1={top - radius * 0.7}
        x2={left - radius * 0.7}
        y2={top + radius * 0.7}
        strokeWidth={lineWidth}
        stroke={blackColor}
    />
</>;
