import {HashSet} from "../struct/Set";
import {PuzzleDefinition} from "./PuzzleDefinition";

export class CellDataSet<CellType, ExType, ProcessedExType> extends HashSet<CellType> {
    constructor(
        {
            typeManager: {areSameCellData, cloneCellData, serializeCellData, getCellDataHash}
        }: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        items: CellType[] = []
    ) {
        super(
            items,
            {
                comparer: (a, b) => areSameCellData(a, b, undefined, false),
                cloner: cloneCellData,
                serializer: serializeCellData,
                hasher: getCellDataHash,
            }
        );
    }

    static unserialize<CellType, ExType, ProcessedExType>(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        items: any
    ) {
        return new CellDataSet(puzzle, (items as any[]).map(puzzle.typeManager.unserializeCellData));
    }
}
