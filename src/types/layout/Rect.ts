import { emptyPosition, getLineVector, getVectorLength, Position, scaleVector } from "./Position";
import { emptySize, Size } from "./Size";

export interface Rect extends Position, Size {}

export interface TransformedRect {
    base: Position;
    rightVector: Position;
    bottomVector: Position;
}

export const emptyRect: Rect = {
    ...emptyPosition,
    ...emptySize,
};

export const getRectByBounds = ({ top, left }: Position, { top: bottom, left: right }: Position): Rect => ({
    top,
    left,
    width: right - left,
    height: bottom - top,
});

export const transformRect = (
    { top, left, width, height }: Rect,
    transformCoords: (position: Position) => Position = (position) => position,
    coeff = 1,
): TransformedRect => {
    const base = transformCoords({ top, left });
    const right = transformCoords({ top, left: left + width * coeff });
    const bottom = transformCoords({ top: top + height * coeff, left });

    return {
        base,
        rightVector: scaleVector(getLineVector({ start: base, end: right }), 1 / coeff),
        bottomVector: scaleVector(getLineVector({ start: base, end: bottom }), 1 / coeff),
    };
};

export const getTransformedRectCenter = ({ base, rightVector, bottomVector }: TransformedRect): Position => ({
    top: base.top + rightVector.top / 2 + bottomVector.top / 2,
    left: base.left + rightVector.left / 2 + bottomVector.left / 2,
});

export const getTransformedRectMatrix = ({ base, rightVector, bottomVector }: TransformedRect) =>
    `matrix(${rightVector.left} ${rightVector.top} ${bottomVector.left} ${bottomVector.top} ${base.left} ${base.top})`;

export const getTransformedRectAverageSize = ({ rightVector, bottomVector }: TransformedRect) =>
    (getVectorLength(rightVector) + getVectorLength(bottomVector)) / 2;

export const getTransformedRectAverageAngle = ({ rightVector, bottomVector }: TransformedRect) =>
    (Math.atan2(rightVector.top + bottomVector.top, rightVector.left + bottomVector.left) * 180) / Math.PI - 45;

export const getRectPoints = ({ left, top, width, height }: Rect): Position[] => [
    { left, top },
    { left: left + width, top },
    { left: left + width, top: top + height },
    { left, top: top + height },
];

export const getRectCenter = ({ left, top, width, height }: Rect): Position => ({
    left: left + width / 2,
    top: top + height / 2,
});

export const getPointsBoundingBox = (...points: Position[]): Rect => {
    if (points.length === 0) {
        return emptyRect;
    }

    const tops = points.map(({ top }) => top);
    const lefts = points.map(({ left }) => left);

    return getRectByBounds(
        {
            top: Math.min(...tops),
            left: Math.min(...lefts),
        },
        {
            top: Math.max(...tops),
            left: Math.max(...lefts),
        },
    );
};

// noinspection JSUnusedGlobalSymbols
export const getRectsBoundingBox = (...rects: Rect[]) => getPointsBoundingBox(...rects.flatMap(getRectPoints));

export const isPointInRect = ({ top, left, width, height }: Rect, point: Position) =>
    point.left >= left && point.left <= left + width && point.top >= top && point.top <= top + height;

export const isCellInRect = ({ top, left, width, height }: Rect, point: Position) =>
    point.left >= left && point.left < left + width && point.top >= top && point.top < top + height;

const areSegmentsIntersecting = (start1: number, end1: number, start2: number, end2: number) =>
    end1 > start2 && end2 > start1;

export const areRectsIntersecting = (rect1: Rect, rect2: Rect) =>
    areSegmentsIntersecting(rect1.left, rect1.left + rect1.width, rect2.left, rect2.left + rect2.width) &&
    areSegmentsIntersecting(rect1.top, rect1.top + rect1.height, rect2.top, rect2.top + rect2.height);
