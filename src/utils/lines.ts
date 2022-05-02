import {Position} from "../types/layout/Position";
import {indexes} from "./indexes";

export const splitLine = (start: Position, end: Position, inclusive = true): Position[] => {
    const {left: x1, top: y1} = start;
    const {left: x2, top: y2} = end;

    if (x1 !== x2 && y1 !== y2 && Math.abs(x1 - x2) !== Math.abs(y1 - y2)) {
        // The line has a strange angle - return it as is
        return inclusive ? [start, end] : [start];
    }

    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    const n = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));

    return indexes(n, inclusive).map(i => ({
        left: x1 + i * dx,
        top: y1 + i * dy,
    }));
};

export const splitMultiLine = (points: Position[]): Position[] => points.flatMap((start, index) => {
    const end = points[index + 1];

    return end ? splitLine(start, end, false) : [start];
});
