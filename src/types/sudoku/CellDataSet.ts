import {ComparableSet} from "../struct/Set";
import {PuzzleDefinition} from "./PuzzleDefinition";

export class CellDataSet<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> extends ComparableSet<CellType> {
    constructor(
        {
            typeManager: {areSameCellData, cloneCellData, serializeCellData}
        }: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        items: CellType[] = []
    ) {
        super(
            items,
            (a, b) => areSameCellData(a, b, undefined, false),
            cloneCellData,
            serializeCellData
        );
    }

    static unserialize<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        items: any
    ) {
        return new CellDataSet(puzzle, (items as any[]).map(puzzle.typeManager.unserializeCellData));
    }
}
