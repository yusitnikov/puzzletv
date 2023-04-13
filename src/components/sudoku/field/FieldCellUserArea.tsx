import {Position} from "../../../types/layout/Position";
import {ReactNode, useMemo} from "react";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {TransformedRectGraphics} from "../../../contexts/TransformScaleContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

interface FieldCellUserAreaProps<T extends AnyPTM> {
    context?: PuzzleContext<T>;
    cellPosition?: Position;
    children: ReactNode;
}

export const FieldCellUserArea = <T extends AnyPTM>({context, cellPosition, children}: FieldCellUserAreaProps<T>) => {
    const customRect = useMemo(() => {
        if (!context || !cellPosition) {
            return undefined;
        }

        const cellInfo = context.cellsIndexForState.getAllCells()?.[cellPosition.top]?.[cellPosition.left];
        return cellInfo?.areCustomBounds ? cellInfo?.transformedBounds?.userArea : undefined;
    }, [context, cellPosition]);

    return <>
        {customRect && <TransformedRectGraphics rect={customRect}>
            {children}
        </TransformedRectGraphics>}

        {!customRect && children}
    </>;
};
