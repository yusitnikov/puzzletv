import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { doesGridRegionContainCell, GridRegion } from "../../../types/sudoku/GridRegion";
import React, { Fragment, ReactElement, ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { indexes } from "../../../utils/indexes";
import { Position } from "../../../types/layout/Position";
import { isInteractableCell, isVisibleCell } from "../../../types/sudoku/CellTypeProps";

export interface FieldCellsLayerProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    topOffset: number;
    leftOffset: number;
    region?: GridRegion;
    isInteractionMode?: boolean;
    children: (top: number, left: number) => ReactNode;
}

export const FieldCellsLayer = observer(function FieldCellsLayer<T extends AnyPTM>({
    context,
    topOffset,
    leftOffset,
    children,
    region,
    isInteractionMode = false,
}: FieldCellsLayerProps<T>) {
    profiler.trace();

    const { puzzleIndex, puzzle } = context;

    const { typeManager, fieldSize, fieldMargin = 0, customCellBounds } = puzzle;

    const { allowRotation, allowScale, transformCoords, fieldFitsWrapper } = typeManager;

    return (
        <>
            {indexes(fieldSize.rowsCount).flatMap((rowIndex) =>
                indexes(fieldSize.columnsCount).map((columnIndex) => {
                    const cellPosition: Position = {
                        left: columnIndex,
                        top: rowIndex,
                    };

                    // Skip the cell if it doesn't belong to the currently rendered region
                    if (region && !customCellBounds && !doesGridRegionContainCell(region, cellPosition)) {
                        return null;
                    }

                    // Skip the cell if it's out of the view because of panning and toroidal grid's looping
                    if (!fieldFitsWrapper && !customCellBounds && !allowScale && !allowRotation && !transformCoords) {
                        const finalTop = topOffset + context.animatedNormalizedTop + rowIndex;
                        if (finalTop <= -1 - fieldMargin || finalTop >= fieldSize.fieldSize + fieldMargin) {
                            return null;
                        }

                        const finalLeft = leftOffset + context.animatedNormalizedLeft + columnIndex;
                        if (finalLeft <= -1 - fieldMargin || finalLeft >= fieldSize.fieldSize + fieldMargin) {
                            return null;
                        }
                    }

                    // Skip the cell if it's not interactable (when rendering the interactions layer) or not visible
                    const cellTypeProps = puzzleIndex.getCellTypeProps(cellPosition);
                    if (!(isInteractionMode ? isInteractableCell(cellTypeProps) : isVisibleCell(cellTypeProps))) {
                        return null;
                    }

                    // Skip the cell if it has no contents
                    const content = children(cellPosition.top, cellPosition.left);
                    if (!content) {
                        return null;
                    }

                    return <Fragment key={`cell-${rowIndex}-${columnIndex}`}>{content}</Fragment>;
                }),
            )}
        </>
    );
}) as <T extends AnyPTM>(props: FieldCellsLayerProps<T>) => ReactElement;
