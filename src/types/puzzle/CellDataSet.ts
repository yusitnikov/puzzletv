import { HashSet } from "../struct/Set";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";

export class CellDataSet<T extends AnyPTM> extends HashSet<T["cell"]> {
    constructor(context: PuzzleContext<T>, items: T["cell"][] = []) {
        const { puzzle } = context;
        const {
            typeManager: { areSameCellData, cloneCellData, serializeCellData, getCellDataHash },
        } = puzzle;

        super(items, {
            comparer: (a, b) => areSameCellData(a, b, context),
            cloner: cloneCellData,
            serializer: serializeCellData,
            hasher: (data) => getCellDataHash(data, puzzle),
        });
    }

    static unserialize<T extends AnyPTM>(context: PuzzleContext<T>, items: any) {
        return new CellDataSet(context, (items as any[]).map(context.puzzle.typeManager.unserializeCellData));
    }
}
