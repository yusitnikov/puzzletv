import {Position} from "../layout/Position";
import {getPuzzlePositionHasher, PuzzleDefinition} from "./PuzzleDefinition";

export interface CellMark {
    position: Position;
    isCircle: boolean;
    isCenter?: boolean;
}

export const getMarkHasher = (puzzle: PuzzleDefinition<any, any, any>) => {
    const positionHasher = getPuzzlePositionHasher(puzzle);

    return ({position, isCircle = false, isCenter = false}: CellMark) => `${positionHasher(position)}:${isCircle}:${isCenter}`;
};
