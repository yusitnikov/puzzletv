import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellState} from "../../../types/sudoku/CellState";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {ProcessedGameState} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {useCallback} from "react";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";

export interface CellWriteModeButtonProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    cellWriteMode: CellWriteMode;
    top: number;
    data: Partial<CellState<CellType>>;
    title?: string;

    cellSize: number;
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
}

export const CellWriteModeButton = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {cellWriteMode, top, data, title, cellSize, puzzle, state, onStateChange}: CellWriteModeButtonProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const handleSetCellWriteMode = useCallback(
        () => onStateChange({persistentCellWriteMode: cellWriteMode} as any),
        [onStateChange, cellWriteMode]
    );

    return <ControlButton
        left={3}
        top={top}
        cellSize={cellSize}
        innerBorderWidth={1}
        checked={state.cellWriteMode === cellWriteMode}
        onClick={handleSetCellWriteMode}
        title={title}
    >
        {contentSize => <CellContent
            puzzle={puzzle}
            data={data}
            size={contentSize}
            mainColor={true}
        />}
    </ControlButton>;
};
