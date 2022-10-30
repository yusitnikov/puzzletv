import {ComparableSet} from "../struct/Set";
import {PuzzleDefinition} from "./PuzzleDefinition";

export class CellDataSet<CellType, ExType, ProcessedExType> extends ComparableSet<CellType> {
    constructor(
        {
            typeManager: {areSameCellData, cloneCellData, serializeCellData}
        }: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        items: CellType[] = []
    ) {
        super(
            items,
            (a, b) => areSameCellData(a, b, undefined, false),
            cloneCellData,
            serializeCellData
        );
    }

    static unserialize<CellType, ExType, ProcessedExType>(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        items: any
    ) {
        return new CellDataSet(puzzle, (items as any[]).map(puzzle.typeManager.unserializeCellData));
    }
}
