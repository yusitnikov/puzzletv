import { observer } from "mobx-react-lite";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { headerPadding } from "../globals";
import { GridPreview } from "../../sudoku/grid/GridPreview";
import { loadPuzzle, PuzzleDefinitionOrLoader } from "../../../types/sudoku/PuzzleDefinition";
import { useMemo } from "react";

export interface ExampleTabProps<T extends AnyPTM> {
    title: string;
    puzzle: PuzzleDefinitionOrLoader<T>;
}

export const ExampleTab = observer(function ExampleTab<T extends AnyPTM>({ title, puzzle }: ExampleTabProps<T>) {
    profiler.trace();

    const loadedPuzzle = useMemo(() => loadPuzzle(puzzle, undefined, true), [puzzle]);

    return (
        <>
            <div style={{ marginBottom: headerPadding }}>{title}</div>
            <div style={{ background: "#fff", padding: headerPadding / 2, borderRadius: headerPadding / 2 }}>
                <GridPreview puzzle={loadedPuzzle} width={100} />
            </div>
        </>
    );
});
