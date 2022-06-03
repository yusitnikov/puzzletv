import {getLineVector, Position} from "../layout/Position";
import {PuzzleDefinition} from "./PuzzleDefinition";

export interface CellMark {
    position: Position;
    isCircle: boolean;
}

export const getMarkComparer = (
    {fieldSize: {rowsCount, columnsCount}, loopHorizontally, loopVertically}: PuzzleDefinition<any, any, any>
) => ({position: position1, isCircle: isCircle1}: CellMark, {position: position2, isCircle: isCircle2}: CellMark) => {
    if (isCircle1 !== isCircle2) {
        return false;
    }

    let {left, top} = getLineVector({start: position1, end: position2});

    if (loopVertically) {
        top %= rowsCount;
    }

    if (loopHorizontally) {
        left %= columnsCount;
    }

    return !left && !top;
};
