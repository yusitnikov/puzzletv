import { Position } from "../types/layout/Position";
import { indexes } from "./indexes";

export const splitLine = (start: Position, end: Position, inclusive = true): Position[] => {
    const { left: x1, top: y1 } = start;
    const { left: x2, top: y2 } = end;

    if (x1 !== x2 && y1 !== y2 && Math.abs(x1 - x2) !== Math.abs(y1 - y2)) {
        // The line has a strange angle - return it as is
        return inclusive ? [start, end] : [start];
    }

    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    const n = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));

    return indexes(n, inclusive).map((i) => ({
        left: x1 + i * dx,
        top: y1 + i * dy,
    }));
};

export const splitMultiLine = (points: Position[]): Position[] =>
    points.flatMap((start, index) => {
        const end = points[index + 1];

        return end ? splitLine(start, end, false) : [start];
    });

export interface OrthogonalLine {
    start: number;
    end: number;
}

// Concat 1-cell long lines that start at startPoints[i]
export const concatContinuousLines = (startPoints: number[]) =>
    startPoints.reduce<OrthogonalLine[]>(
        (lines, point) =>
            point === lines[lines.length - 1]?.end
                ? [
                      ...lines.slice(0, -1),
                      {
                          start: lines[lines.length - 1].start,
                          end: point + 1,
                      },
                  ]
                : [
                      ...lines,
                      {
                          start: point,
                          end: point + 1,
                      },
                  ],
        [],
    );
