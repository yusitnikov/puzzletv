import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellState} from "../../../types/sudoku/CellState";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {ProcessedGameState} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {ReactNode, useCallback} from "react";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";

export interface CellWriteModeButtonProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    cellWriteMode: CellWriteMode;
    top: number;
    left?: number;
    data: Partial<CellState<CellType>> | ((contentSize: number) => ReactNode);
    title?: string;

    cellSize: number;
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
    childrenOnTopOfBorders?: boolean;
}

export const CellWriteModeButton = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        cellWriteMode,
        top,
        left = 3,
        data,
        title,
        cellSize,
        puzzle,
        state,
        onStateChange,
        childrenOnTopOfBorders,
    }: CellWriteModeButtonProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const handleSetCellWriteMode = useCallback(
        () => onStateChange({persistentCellWriteMode: cellWriteMode} as any),
        [onStateChange, cellWriteMode]
    );

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        innerBorderWidth={1}
        checked={state.cellWriteMode === cellWriteMode}
        onClick={handleSetCellWriteMode}
        title={title}
        childrenOnTopOfBorders={childrenOnTopOfBorders}
    >
        {
            typeof data === "function"
                ? data
                : contentSize => <CellContent
                    puzzle={puzzle}
                    data={data}
                    size={contentSize}
                    mainColor={true}
                />
        }
    </ControlButton>;
};
