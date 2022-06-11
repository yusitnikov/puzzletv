import {HashSet} from "../struct/Set";
import {getPuzzlePositionHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {Position} from "../layout/Position";

export class PuzzlePositionSet<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> extends HashSet<Position> {
    constructor(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        items: Position[] = []
    ) {
        super(items, getPuzzlePositionHasher(puzzle));
    }

    static unserialize<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        items: any
    ): PuzzlePositionSet<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
        return new PuzzlePositionSet(puzzle, items);
    }
}
