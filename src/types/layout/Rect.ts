import {emptyPosition, getLineVector, Position} from "./Position";
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
    transformCoords: (position: Position) => Position = position => position
): TransformedRect => {
    const base = transformCoords({top, left});
    const right = transformCoords({top, left: left + width});
    const bottom = transformCoords({top: top + height, left});

    return {
        base,
        rightVector: getLineVector({start: base, end: right}),
        bottomVector: getLineVector({start: base, end: bottom}),
    };
};

export const getTransformedRectCenter = ({base, rightVector, bottomVector}: TransformedRect): Position => ({
    top: base.top + rightVector.top / 2 + bottomVector.top / 2,
    left: base.left + rightVector.left / 2 + bottomVector.left / 2,
});

export const getTransformedRectMatrix = ({base, rightVector, bottomVector}: TransformedRect) =>
    `matrix(${rightVector.left} ${rightVector.top} ${bottomVector.left} ${bottomVector.top} ${base.left} ${base.top})`;

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
