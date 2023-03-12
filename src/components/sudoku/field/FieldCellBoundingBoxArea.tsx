import {Position} from "../../../types/layout/Position";
import {ReactNode, useMemo} from "react";
import {transformRect} from "../../../types/layout/Rect";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getRegionBoundingBox} from "../../../utils/regions";
import {TransformedRectGraphics} from "../../../contexts/TransformScaleContext";

interface FieldCellBoundingBoxAreaProps {
    context?: PuzzleContext<any, any, any>;
    cellPosition?: Position;
    children: ReactNode;
}

export const FieldCellBoundingBoxArea = ({context, cellPosition, children}: FieldCellBoundingBoxAreaProps) => {
    const customRect = useMemo(() => {
        if (!context || !cellPosition) {
            return undefined;
        }

        const {puzzle, cellsIndex, state, cellSize} = context;
        const {typeManager: {transformCoords = coords => coords}} = puzzle;
        const {areCustomBounds, bounds: {borders}} = cellsIndex.allCells[cellPosition.top][cellPosition.left];

        return areCustomBounds
            ? transformRect(
                getRegionBoundingBox(borders.flat()),
                position => transformCoords(position, puzzle, state, cellSize)
            )
            : undefined;
    }, [context, cellPosition]);

    return <>
        {customRect && <TransformedRectGraphics rect={customRect}>
            {children}
        </TransformedRectGraphics>}

        {!customRect && children}
    </>;
};
