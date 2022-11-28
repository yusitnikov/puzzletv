import {HashSet} from "../struct/Set";
import {getPuzzleLineHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {Line} from "../layout/Position";

export class PuzzleLineSet<CellType, ExType, ProcessedExType, LineT extends Line = Line> extends HashSet<LineT> {
    constructor(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        items: LineT[] = []
    ) {
        super(items, getPuzzleLineHasher(puzzle));
    }

    static unserialize<CellType, ExType, ProcessedExType>(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        items: any
    ) {
        return new PuzzleLineSet(puzzle, items);
    }
}
