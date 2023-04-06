import {HashSet} from "../struct/Set";
import {average} from "../../utils/math";

export interface Position {
    left: number;
    top: number;
}

export interface PositionWithAngle extends Position {
    angle: number;
}

export interface Position3D {
    x: number;
    y: number;
    z: number;
}

export interface Line {
    start: Position;
    end: Position;
}

export const emptyPosition: Position = {
    left: 0,
    top: 0,
};

export const emptyPositionWithAngle: PositionWithAngle = {
    ...emptyPosition,
    angle: 0,
};

// Position object or "x,y" or "RyCx"
export type PositionLiteral = Position | string;

export const stringifyPosition = ({left, top}: Position) => `${left},${top}`;
export const formatSvgPointsArray = (points: Position[]) => points.map(stringifyPosition).join(" ");

export const stringifyCellCoords = ({left, top}: Position) => `R${top + 1}C${left + 1}`;
export const parsePositionLiteral = (position: PositionLiteral): Position => {
    if (typeof position !== "string") {
        return position;
    } else if (/^[UDLR]+$/.test(position)) {
        // Direction string, compatible with FPuzzlesLittleKillerSumDirection
        const result: Position = {top: 0, left: 0};

        for (const direction of position.split("")) {
            switch (direction) {
                case "U":
                    result.top--;
                    break;
                case "D":
                    result.top++;
                    break;
                case "L":
                    result.left--;
                    break;
                case "R":
                    result.left++;
                    break;
            }
        }

        return result;
    } else if (position[0] === "R") {
        const [top, left] = position.substring(1).split("C");

        return {
            left: Number(left) - 1,
            top: Number(top) - 1,
        };
    } else {
        const [left, top] = position.split(",");

        return {
            left: Number(left),
            top: Number(top),
        };
    }
};

export const parsePositionLiterals = (positions: PositionLiteral[]): Position[] => positions.map(parsePositionLiteral);
export const parsePositionLiterals2 = (positions: PositionLiteral[][]): Position[][] => positions.map(parsePositionLiterals);

export const isSamePosition = (p1: Position, p2: Position) => p1.left === p2.left && p1.top === p2.top;
export const isSameLine = (line1: Line, line2: Line) =>
    (isSamePosition(line1.start, line2.start) && isSamePosition(line1.end, line2.end)) ||
    (isSamePosition(line1.start, line2.end) && isSamePosition(line1.end, line2.start));

export const invertPosition = ({left, top}: Position): Position => ({
    left: -left,
    top: -top,
});

export const invertLine = <LineT extends Line = Line>(line: LineT): LineT => ({
    ...line,
    start: line.end,
    end: line.start,
});

export const getLineVector = ({start, end}: Line): Position => ({
    left: end.left - start.left,
    top: end.top - start.top,
});

export const getVectorLength = ({left, top}: Position) => Math.hypot(left, top);

export const scaleVector = (vector: Position, coeff: number): Position => ({
    left: vector.left * coeff,
    top: vector.top * coeff,
});

export const normalizeVector = (vector: Position): Position => scaleVector(vector, 1 / (getVectorLength(vector) || 1));

export const getCircleConnectionPoint = <T extends Position>({left: x1, top: y1, ...other}: T, {left: x2, top: y2}: T, circleRadius: number): T => {
    let dx = x2 - x1;
    let dy = y2 - y1;
    const dLength = Math.hypot(dx, dy);
    dx /= dLength;
    dy /= dLength;
    return {
        left: x1 + circleRadius * dx,
        top: y1 + circleRadius * dy,
        ...other,
    } as T;
};

export const stringifyLine = ({start, end}: Line) => `${stringifyPosition(start)}>${stringifyPosition(end)}`;

export const getAveragePosition = (positions: Position[]): Position => {
    if (!positions.length) {
        return emptyPosition;
    }

    return {
        top: average(positions.map(({top}) => top)),
        left: average(positions.map(({left}) => left)),
    };
};

export class PositionSet extends HashSet<Position> {
    constructor(items: Position[] = []) {
        super(items, {hasher: stringifyPosition});
    }

    static unserialize(items: any) {
        return new PositionSet(items);
    }
}
