import {Position} from "../layout/Position";
import {getPuzzlePositionHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {HashSet} from "../struct/Set";

export interface CellMark {
    position: Position;
    isCircle: boolean;
    isCenter?: boolean;
}

export const getMarkHasher = (puzzle: PuzzleDefinition<any, any, any>) => {
    const positionHasher = getPuzzlePositionHasher(puzzle);

    return ({position, isCircle = false, isCenter = false}: CellMark) => `${positionHasher(position)}:${isCircle}:${isCenter}`;
};

export class CellMarkSet extends HashSet<CellMark> {
    constructor(
        puzzle: PuzzleDefinition<any, any, any>,
        items: CellMark[] = []
    ) {
        super(items, getMarkHasher(puzzle));
    }

    static unserialize(
        puzzle: PuzzleDefinition<any, any, any>,
        items: any
    ) {
        return new CellMarkSet(puzzle, items);
    }
}
