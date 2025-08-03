import { HashSet } from "../struct/Set";
import { getPuzzlePositionHasher, PuzzleDefinition } from "./PuzzleDefinition";
import { Position } from "../layout/Position";
import { AnyPTM } from "./PuzzleTypeMap";

export class PuzzlePositionSet<T extends AnyPTM, PositionT extends Position> extends HashSet<PositionT> {
    constructor(puzzle: PuzzleDefinition<T>, items: PositionT[] = []) {
        super(items, { hasher: getPuzzlePositionHasher(puzzle) });
    }

    static unserialize<T extends AnyPTM, PositionT extends Position>(puzzle: PuzzleDefinition<T>, items: any) {
        return new PuzzlePositionSet<T, PositionT>(puzzle, items);
    }
}
