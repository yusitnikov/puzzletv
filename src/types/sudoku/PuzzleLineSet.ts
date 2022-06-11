import {HashSet} from "../struct/Set";
import {getPuzzleLineHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {Line} from "../layout/Position";

export class PuzzleLineSet<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> extends HashSet<Line> {
    constructor(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        items: Line[] = []
    ) {
        super(items, getPuzzleLineHasher(puzzle));
    }

    static unserialize<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        items: any
    ) {
        return new PuzzleLineSet(puzzle, items);
    }
}
