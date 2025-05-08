import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { CellState } from "../../../types/puzzle/CellState";
import { ReactElement, ReactNode, useCallback } from "react";
import { ControlButton } from "./ControlButton";
import { CellContent } from "../cell/CellContent";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

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

export const CellWriteModeButton = observer(function CellWriteModeButtonFc<T extends AnyPTM>({
    cellWriteMode,
    top,
    left = 3,
    data,
    title,
    context,
    noBorders,
    childrenOnTopOfBorders,
    fullHeight,
}: CellWriteModeButtonProps<T>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize } = context;

    const handleSetCellWriteMode = useCallback(
        () => context.onStateChange({ persistentCellWriteMode: cellWriteMode }),
        [context, cellWriteMode],
    );

    return (
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            innerBorderWidth={noBorders ? 0 : 1}
            checked={context.cellWriteMode === cellWriteMode}
            onClick={handleSetCellWriteMode}
            title={title}
            childrenOnTopOfBorders={childrenOnTopOfBorders}
            fullHeight={fullHeight}
        >
            {typeof data === "function"
                ? data
                : (contentSize) => <CellContent context={context} data={data} size={contentSize} mainColor={true} />}
        </ControlButton>
    );
}) as <T extends AnyPTM>(props: CellWriteModeButtonProps<T>) => ReactElement;
