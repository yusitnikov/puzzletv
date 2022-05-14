import {emptyPosition, Position} from "./Position";
import {emptySize, Size} from "./Size";

export interface Rect extends Position, Size {
}

export const emptyRect: Rect = {
    ...emptyPosition,
    ...emptySize,
};

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
