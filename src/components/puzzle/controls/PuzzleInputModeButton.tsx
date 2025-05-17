import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { CellState } from "../../../types/puzzle/CellState";
import { ReactElement, ReactNode, useCallback } from "react";
import { ControlButton } from "./ControlButton";
import { CellContent } from "../cell/CellContent";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface PuzzleInputModeButtonProps<T extends AnyPTM> {
    inputMode: PuzzleInputMode;
    top: number;
    left?: number;
    data: Partial<CellState<T>> | ((contentSize: number) => ReactNode);
    title?: string;

    context: PuzzleContext<T>;

    noBorders?: boolean;
    childrenOnTopOfBorders?: boolean;
    fullHeight?: boolean;
}

export const PuzzleInputModeButton = observer(function PuzzleInputModeButtonFc<T extends AnyPTM>({
    inputMode,
    top,
    left = 3,
    data,
    title,
    context,
    noBorders,
    childrenOnTopOfBorders,
    fullHeight,
}: PuzzleInputModeButtonProps<T>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize } = context;

    const handleSetInputMode = useCallback(
        () => context.onStateChange({ persistentInputMode: inputMode }),
        [context, inputMode],
    );

    return (
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            innerBorderWidth={noBorders ? 0 : 1}
            checked={context.inputMode === inputMode}
            onClick={handleSetInputMode}
            title={title}
            childrenOnTopOfBorders={childrenOnTopOfBorders}
            fullHeight={fullHeight}
        >
            {typeof data === "function"
                ? data
                : (contentSize) => <CellContent context={context} data={data} size={contentSize} mainColor={true} />}
        </ControlButton>
    );
}) as <T extends AnyPTM>(props: PuzzleInputModeButtonProps<T>) => ReactElement;
