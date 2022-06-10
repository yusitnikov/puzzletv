import {Position} from "../../../types/layout/Position";
import {ReactNode, useMemo} from "react";
import {getTransformedRectMatrix} from "../../../types/layout/Rect";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

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

        const {areCustomBounds, getTransformedBounds} = context.cellsIndex.allCells[cellPosition.top][cellPosition.left];

        return areCustomBounds ? getTransformedBounds(context.state).userArea : undefined;
    }, [context, cellPosition]);

    return <>
        {customRect && <g transform={getTransformedRectMatrix(customRect)}>
            {children}
        </g>}

        {!customRect && children}
    </>;
};
