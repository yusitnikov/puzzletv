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
export const parsePositionLiterals3 = (positions: PositionLiteral[][][]): Position[][][] => positions.map(parsePositionLiterals2);

export const isSamePosition = (p1: Position, p2: Position) => p1.left === p2.left && p1.top === p2.top;
export const isSameLine = (line1: Line, line2: Line) =>
    (isSamePosition(line1.start, line2.start) && isSamePosition(line1.end, line2.end)) ||
    (isSamePosition(line1.start, line2.end) && isSamePosition(line1.end, line2.start));

export const invertPosition = ({left, top}: Position): Position => ({
    left: -left,
    top: -top,
});

export const invertLine = ({start, end}: Line): Line => ({
    start: end,
    end: start,
});

export const getLineVector = ({start, end}: Line): Position => ({
    left: end.left - start.left,
    top: end.top - start.top,
});

export const getVectorLength = ({left, top}: Position) => Math.hypot(left, top);

export const normalizeVector = (vector: Position, length = getVectorLength(vector) || 1): Position => ({
    left: vector.left / length,
    top: vector.top / length,
});
