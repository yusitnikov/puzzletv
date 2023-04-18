import {emptyPosition, getLineVector, getVectorLength, Position, scaleVector} from "./Position";
import {emptySize, Size} from "./Size";

export interface Rect extends Position, Size {
}

export interface TransformedRect {
    base: Position;
    rightVector: Position;
    bottomVector: Position;
}

export const emptyRect: Rect = {
    ...emptyPosition,
    ...emptySize,
};

export const transformRect = (
    {top, left, width, height}: Rect,
    transformCoords: (position: Position) => Position = position => position,
    coeff = 1
): TransformedRect => {
    const base = transformCoords({top, left});
    const right = transformCoords({top, left: left + width * coeff});
    const bottom = transformCoords({top: top + height * coeff, left});

    return {
        base,
        rightVector: scaleVector(getLineVector({start: base, end: right}), 1 / coeff),
        bottomVector: scaleVector(getLineVector({start: base, end: bottom}), 1 / coeff),
    };
};

export const getTransformedRectCenter = ({base, rightVector, bottomVector}: TransformedRect): Position => ({
    top: base.top + rightVector.top / 2 + bottomVector.top / 2,
    left: base.left + rightVector.left / 2 + bottomVector.left / 2,
});

export const getTransformedRectMatrix = ({base, rightVector, bottomVector}: TransformedRect) =>
    `matrix(${rightVector.left} ${rightVector.top} ${bottomVector.left} ${bottomVector.top} ${base.left} ${base.top})`;

export const getTransformedRectAverageSize = ({rightVector, bottomVector}: TransformedRect) =>
    (getVectorLength(rightVector) + getVectorLength(bottomVector)) / 2;

export const getRectPoints = ({left, top, width, height}: Rect): Position[] => [
    {left, top},
    {left: left + width, top},
    {left: left + width, top: top + height},
    {left, top: top + height},
];

export const getRectCenter = ({left, top, width, height}: Rect): Position => ({
    left: left + width / 2,
    top: top + height / 2,
});

export const getPointsBoundingBox = (...points: Position[]): Rect => {
    if (points.length === 0) {
        return emptyRect;
    }

    const tops = points.map(({top}) => top);
    const lefts = points.map(({left}) => left);

    const top = Math.min(...tops);
    const left = Math.min(...lefts);
    const bottom = Math.max(...tops);
    const right = Math.max(...lefts);

    return {
        top,
        left,
        width: right - left,
        height: bottom - top,
    };
};

export const getRectsBoundingBox = (...rects: Rect[]) => getPointsBoundingBox(...rects.flatMap(getRectPoints));
