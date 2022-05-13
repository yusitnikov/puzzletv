import {ReactNode} from "react";
import {getLineVector, Position} from "../../../types/layout/Position";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

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
    const {base, rightVector, bottomVector} = getFieldRectTransform(context, position);

    return <g
        transform={`matrix(${rightVector.left} ${rightVector.top} ${bottomVector.left} ${bottomVector.top} ${base.left} ${base.top})`}
    >
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
) => {
    const {
        typeManager: {
            transformCoords = coords => coords,
        },
        customCellBounds,
    } = puzzle;

    const cellUserArea = customCellBounds?.[position.top]?.[position.left]?.userArea;

    const base = transformCoords(
        cellUserArea || position,
        puzzle,
        state
    );
    const right = transformCoords(
        cellUserArea
            ? {left: cellUserArea.left + cellUserArea.width, top: cellUserArea.top}
            : {left: position.left + 1, top: position.top},
        puzzle,
        state
    );
    const bottom = transformCoords(
        cellUserArea
            ? {left: cellUserArea.left, top: cellUserArea.top + cellUserArea.height}
            : {left: position.left, top: position.top + 1},
        puzzle,
        state
    );
    const rightVector = getLineVector({start: base, end: right});
    const bottomVector = getLineVector({start: base, end: bottom});

    return {
        base,
        rightVector,
        bottomVector,
    };
};
