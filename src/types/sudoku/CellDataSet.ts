import {HashSet} from "../struct/Set";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {AnyPTM} from "./PuzzleTypeMap";
import {createEmptyContextForPuzzle, PuzzleContext} from "./PuzzleContext";
import {runInAction} from "mobx";

export class CellDataSet<T extends AnyPTM> extends HashSet<T["cell"]> {
    constructor(
        puzzle: PuzzleDefinition<T>,
        items: T["cell"][] = []
    ) {
        const {
            typeManager: {areSameCellData, cloneCellData, serializeCellData, getCellDataHash}
        } = puzzle;

        const contextCache = puzzle as {_emptyContext?: PuzzleContext<T>};
        if (!contextCache._emptyContext) {
            runInAction(() => {
                contextCache._emptyContext = createEmptyContextForPuzzle(puzzle, 1, true);
            });
        }
        const context = contextCache._emptyContext!;

        super(
            items,
            {
                comparer: (a, b) => areSameCellData(a, b, context, false, false),
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
