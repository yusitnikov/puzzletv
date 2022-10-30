import {HashSet} from "../struct/Set";
import {getPuzzlePositionHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {Position} from "../layout/Position";

export class PuzzlePositionSet<CellType, ExType, ProcessedExType> extends HashSet<Position> {
    constructor(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        items: Position[] = []
    ) {
        super(items, getPuzzlePositionHasher(puzzle));
    }

    static unserialize<CellType, ExType, ProcessedExType>(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        items: any
    ): PuzzlePositionSet<CellType, ExType, ProcessedExType> {
        return new PuzzlePositionSet(puzzle, items);
    }
}
