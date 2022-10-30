import {CellWriteMode, getAllowedCellWriteModeInfos} from "../../../types/sudoku/CellWriteMode";
import {CellState} from "../../../types/sudoku/CellState";
import {ReactNode, useCallback} from "react";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

export interface CellWriteModeButtonProps<CellType, ExType = {}, ProcessedExType = {}> {
    cellWriteMode: CellWriteMode;
    top: number;
    left?: number;
    data: Partial<CellState<CellType>> | ((contentSize: number) => ReactNode);
    title?: string;

    context: PuzzleContext<CellType, ExType, ProcessedExType>;

    noBorders?: boolean;
    childrenOnTopOfBorders?: boolean;
    fullSize?: boolean;
}

export const CellWriteModeButton = <CellType, ExType = {}, ProcessedExType = {}>(
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
    }: CellWriteModeButtonProps<CellType, ExType, ProcessedExType>
) => {
    const {puzzle, state, onStateChange, cellSizeForSidePanel: cellSize} = context;

    const handleSetCellWriteMode = useCallback(
        () => onStateChange({persistentCellWriteMode: cellWriteMode}),
        [onStateChange, cellWriteMode]
    );

    const allowedModeInfos = getAllowedCellWriteModeInfos(puzzle);
    if (allowedModeInfos.length <= 1 || !allowedModeInfos.find(({mode}) => mode === cellWriteMode)) {
        return null;
    }

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        innerBorderWidth={noBorders ? 0 : 1}
        checked={state.processed.cellWriteMode === cellWriteMode}
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
