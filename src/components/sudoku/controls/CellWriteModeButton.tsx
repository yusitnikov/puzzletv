import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellState} from "../../../types/sudoku/CellState";
import {ReactNode, useCallback} from "react";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export interface CellWriteModeButtonProps<T extends AnyPTM> {
    cellWriteMode: CellWriteMode;
    top: number;
    left?: number;
    data: Partial<CellState<T>> | ((contentSize: number) => ReactNode);
    title?: string;

    context: PuzzleContext<T>;

    noBorders?: boolean;
    childrenOnTopOfBorders?: boolean;
    fullHeight?: boolean;
}

export const CellWriteModeButton = <T extends AnyPTM>(
    {
        cellWriteMode,
        top,
        left = 3,
        data,
        title,
        context,
        noBorders,
        childrenOnTopOfBorders,
        fullHeight,
    }: CellWriteModeButtonProps<T>
) => {
    const {
        state,
        onStateChange,
        cellSizeForSidePanel: cellSize,
    } = context;

    const handleSetCellWriteMode = useCallback(
        () => onStateChange({persistentCellWriteMode: cellWriteMode}),
        [onStateChange, cellWriteMode]
    );

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        innerBorderWidth={noBorders ? 0 : 1}
        checked={state.processed.cellWriteMode === cellWriteMode}
        onClick={handleSetCellWriteMode}
        title={title}
        childrenOnTopOfBorders={childrenOnTopOfBorders}
        fullHeight={fullHeight}
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
