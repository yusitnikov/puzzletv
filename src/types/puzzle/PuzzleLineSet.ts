import { HashSet } from "../struct/Set";
import { getPuzzleLineHasher, PuzzleDefinition } from "./PuzzleDefinition";
import { Line } from "../layout/Position";
import { AnyPTM } from "./PuzzleTypeMap";
import { LineWithColor } from "./LineWithColor";

export class PuzzleLineSet<T extends AnyPTM, LineT extends Line = Line> extends HashSet<LineT> {
    constructor(puzzle: PuzzleDefinition<T>, items: LineT[] = []) {
        const hasher = getPuzzleLineHasher(puzzle);

        super(items, {
            hasher,
            comparer: (line1, line2) =>
                hasher(line1) === hasher(line2) && (line1 as LineWithColor).color === (line2 as LineWithColor).color,
        });
    }

    static unserialize<T extends AnyPTM>(puzzle: PuzzleDefinition<T>, items: any) {
        return new PuzzleLineSet(puzzle, items);
    }
}
