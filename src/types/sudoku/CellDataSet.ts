import {HashSet} from "../struct/Set";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {AnyPTM} from "./PuzzleTypeMap";

export class CellDataSet<T extends AnyPTM> extends HashSet<T["cell"]> {
    constructor(
        {
            typeManager: {areSameCellData, cloneCellData, serializeCellData, getCellDataHash}
        }: PuzzleDefinition<T>,
        items: T["cell"][] = []
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

    static unserialize<T extends AnyPTM>(
        puzzle: PuzzleDefinition<T>,
        items: any
    ) {
        return new CellDataSet(puzzle, (items as any[]).map(puzzle.typeManager.unserializeCellData));
    }
}
