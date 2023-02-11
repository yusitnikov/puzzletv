import {Position} from "../layout/Position";
import {getPuzzlePositionHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {HashSet} from "../struct/Set";
import {CellColor} from "./CellColor";

export enum CellMarkType {
    Any = "",
    X = "X",
    O = "O",
    LeftArrow = "←",
    RightArrow = "→",
}

export interface CellMark {
    position: Position;
    color?: CellColor;
    type: CellMarkType;
    isCenter?: boolean;
}

export const getMarkHasher = (puzzle: PuzzleDefinition<any, any, any>) => {
    const positionHasher = getPuzzlePositionHasher(puzzle);

    return ({position, isCenter = false}: CellMark) => `${positionHasher(position)}:${isCenter}`;
};

export class CellMarkSet extends HashSet<CellMark> {
    constructor(
        puzzle: PuzzleDefinition<any, any, any>,
        items: CellMark[] = []
    ) {
        const hasher = getMarkHasher(puzzle);

        super(items, {
            hasher,
            comparer: (item1, item2) => hasher(item1) === hasher(item2) && item1.type === item2.type,
        });
    }

    static unserialize(
        puzzle: PuzzleDefinition<any, any, any>,
        items: any
    ) {
        return new CellMarkSet(puzzle, items);
    }
}
