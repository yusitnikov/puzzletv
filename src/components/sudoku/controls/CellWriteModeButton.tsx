import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellState} from "../../../types/sudoku/CellState";
import {ReactNode, useCallback} from "react";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

export interface CellWriteModeButtonProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    cellWriteMode: CellWriteMode;
    top: number;
    left?: number;
    data: Partial<CellState<CellType>> | ((contentSize: number) => ReactNode);
    title?: string;

    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;

    noBorders?: boolean;
    childrenOnTopOfBorders?: boolean;
    fullSize?: boolean;
}

export const CellWriteModeButton = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        cellWriteMode,
        top,
        left = 3,
        data,
        title,
        context,
        noBorders,
        childrenOnTopOfBorders,
        fullSize,
    }: CellWriteModeButtonProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {state, onStateChange, cellSize} = context;

    const handleSetCellWriteMode = useCallback(
        () => onStateChange({persistentCellWriteMode: cellWriteMode} as any),
        [onStateChange, cellWriteMode]
    );

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        innerBorderWidth={noBorders ? 0 : 1}
        checked={state.cellWriteMode === cellWriteMode}
        onClick={handleSetCellWriteMode}
        title={title}
        childrenOnTopOfBorders={childrenOnTopOfBorders}
        fullSize={fullSize}
    >
        {
            typeof data === "function"
                ? data
                : contentSize => <CellContent
                    context={context}
                    data={data}
                    size={contentSize}
                    mainColor={true}
                />
        }
    </ControlButton>;
};
