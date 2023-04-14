import {HashSet} from "../struct/Set";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {AnyPTM} from "./PuzzleTypeMap";

export class CellDataSet<T extends AnyPTM> extends HashSet<T["cell"]> {
    constructor(
        puzzle: PuzzleDefinition<T>,
        items: T["cell"][] = []
    ) {
        const {
            typeManager: {areSameCellData, cloneCellData, serializeCellData, getCellDataHash}
        } = puzzle;

        super(
            items,
            {
                comparer: (a, b) => areSameCellData(a, b, puzzle, undefined, false),
                cloner: cloneCellData,
                serializer: serializeCellData,
                hasher: (data) => getCellDataHash(data, puzzle),
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
