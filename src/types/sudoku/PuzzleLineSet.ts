import {HashSet} from "../struct/Set";
import {getPuzzleLineHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {Line} from "../layout/Position";
import {AnyPTM} from "./PuzzleTypeMap";

export class PuzzleLineSet<T extends AnyPTM, LineT extends Line = Line> extends HashSet<LineT> {
    constructor(
        puzzle: PuzzleDefinition<T>,
        items: LineT[] = []
    ) {
        super(items, {hasher: getPuzzleLineHasher(puzzle)});
    }

    static unserialize<T extends AnyPTM>(
        puzzle: PuzzleDefinition<T>,
        items: any
    ) {
        return new PuzzleLineSet(puzzle, items);
    }
}
