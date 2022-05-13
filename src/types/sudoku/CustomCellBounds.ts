import {Position} from "../layout/Position";
import {Rect} from "../layout/Rect";

export interface CustomCellBounds {
    borders: Position[][];
    userArea: Rect;
}

export const transformPointToUserAreaCoords = (point: Position, {left, top, width, height}: Rect): Position => ({
    left: (point.left - left) / width,
    top: (point.top - top) / height,
});

export const transformRectToUserAreaCoords = (rect: Rect, userArea: Rect): Rect => {
    const {left, top, width, height} = rect;

    return {
        ...transformPointToUserAreaCoords({left, top}, userArea),
        width: width / userArea.width,
        height: height / userArea.height,
    }
};
