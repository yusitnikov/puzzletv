import {ReactNode} from "react";
import {emptyPosition, Position} from "../../../types/layout/Position";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getTransformedRectMatrix, TransformedRect, transformRect} from "../../../types/layout/Rect";

export interface FieldRectProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> extends Position, Partial<Size> {
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    clip?: boolean;
    children: ReactNode;
}

export const FieldRect = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        context,
        clip,
        width = 1,
        height = 1,
        children,
        ...position
    }: FieldRectProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
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

export const getFieldRectTransform = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {puzzle, state}: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
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
        position => transformCoords(position, puzzle, state)
    );
};
