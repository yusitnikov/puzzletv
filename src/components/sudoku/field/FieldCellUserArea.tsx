import {Position} from "../../../types/layout/Position";
import {ReactNode, useMemo} from "react";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {TransformedRectGraphics} from "../../../contexts/TransformScaleContext";

interface FieldCellUserAreaProps {
    context?: PuzzleContext<any, any, any>;
    cellPosition?: Position;
    children: ReactNode;
}

export const FieldCellUserArea = ({context, cellPosition, children}: FieldCellUserAreaProps) => {
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
