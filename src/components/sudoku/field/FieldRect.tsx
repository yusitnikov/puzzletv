import {ReactNode} from "react";
import {emptyPosition, Position} from "../../../types/layout/Position";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getTransformedRectMatrix, TransformedRect, transformRect} from "../../../types/layout/Rect";

export interface FieldRectProps<CellType, ExType = {}, ProcessedExType = {}> extends Position, Partial<Size> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
    clip?: boolean;
    children: ReactNode;
}

export const FieldRect = <CellType, ExType = {}, ProcessedExType = {}>(
    {
        context,
        clip,
        width = 1,
        height = 1,
        children,
        ...position
    }: FieldRectProps<CellType, ExType, ProcessedExType>
) => {
    const transformedRect = getFieldRectTransform(context, position);

    return <g transform={getTransformedRectMatrix(transformedRect)}>
        <AutoSvg
            width={width}
            height={height}
            clip={clip}
        >
            {children}
        </AutoSvg>
    </g>;
};

export const getFieldRectTransform = <CellType, ExType = {}, ProcessedExType = {}>(
    {puzzle, state, cellSize}: PuzzleContext<CellType, ExType, ProcessedExType>,
    position: Position
): TransformedRect => {
    const {
        typeManager: {
            transformCoords = coords => coords,
        },
        customCellBounds,
    } = puzzle;

    if (customCellBounds) {
        return {
            base: emptyPosition,
            rightVector: {top: 0, left: 1},
            bottomVector: {top: 1, left: 0},
        };
    }

    return transformRect(
        {...position, width: 1, height: 1},
        position => transformCoords(position, puzzle, state, cellSize),
        0.1
    );
};
