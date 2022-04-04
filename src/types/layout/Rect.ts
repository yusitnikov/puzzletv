import {emptyPosition, Position} from "./Position";
import {emptySize, Size} from "./Size";

export interface Rect extends Position, Size {
}

export const emptyRect: Rect = {
    ...emptyPosition,
    ...emptySize,
};
