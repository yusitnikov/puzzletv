import {ReactNode} from "react";
import {Position} from "../../../types/layout/Position";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";

export interface FieldRectProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> extends Position, Partial<Size> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    clip?: boolean;
    children: ReactNode;
}

export const FieldRect = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        puzzle,
        clip,
        width = 1,
        height = 1,
        children,
        ...position
    }: FieldRectProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {
        typeManager: {
            transformCoords = coords => coords,
        },
    } = puzzle;

    const base = transformCoords(position, puzzle);
    const right = transformCoords({left: position.left + 1, top: position.top}, puzzle);
    const bottom = transformCoords({left: position.left, top: position.top + 1}, puzzle);
    const rightVector: Position = {
        left: right.left - base.left,
        top: right.top - base.top,
    };
    const bottomVector: Position = {
        left: bottom.left - base.left,
        top: bottom.top - base.top,
    };

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
