import {Position} from "../../../types/layout/Position";
import {ReactElement, ReactNode} from "react";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {TransformedRectGraphics} from "../../../contexts/TransformContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

interface FieldCellUserAreaProps<T extends AnyPTM> {
    context?: PuzzleContext<T>;
    cellPosition?: Position;
    children: ReactNode;
}

export const FieldCellUserArea = observer(function FieldCellUserArea<T extends AnyPTM>({context, cellPosition, children}: FieldCellUserAreaProps<T>) {
    profiler.trace();

    const customRect = context && cellPosition && context.puzzleIndex.allCells[cellPosition.top]?.[cellPosition.left]?.areCustomBounds
        ? context.getCellTransformedBounds(cellPosition.top, cellPosition.left).userArea
        : undefined;

    return <>
        {customRect && <TransformedRectGraphics rect={customRect}>
            {children}
        </TransformedRectGraphics>}

        {!customRect && children}
    </>;
}) as <T extends AnyPTM>(props: FieldCellUserAreaProps<T>) => ReactElement;
