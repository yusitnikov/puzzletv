import {HashSet} from "../struct/Set";
import {getPuzzlePositionHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {Position} from "../layout/Position";
import {AnyPTM} from "./PuzzleTypeMap";

export class PuzzlePositionSet<T extends AnyPTM> extends HashSet<Position> {
    constructor(
        puzzle: PuzzleDefinition<T>,
        items: Position[] = []
    ) {
        super(items, {hasher: getPuzzlePositionHasher(puzzle)});
    }

    static unserialize<T extends AnyPTM>(
        puzzle: PuzzleDefinition<T>,
        items: any
    ): PuzzlePositionSet<T> {
        return new PuzzlePositionSet(puzzle, items);
    }
}
