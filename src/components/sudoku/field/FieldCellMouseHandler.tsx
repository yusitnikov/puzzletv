import {
    gameStateContinueMultiLine,
    gameStateSetSelectedCells,
    gameStateStartMultiLine,
    gameStateToggleSelectedCell,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {Position} from "../../../types/layout/Position";
import {MouseEvent, PointerEvent} from "react";
import {Rect} from "../../../types/layout/Rect";
import {globalPaddingCoeff} from "../../app/globals";
import {indexes} from "../../../utils/indexes";
import {CellWriteMode, isNoSelectionWriteMode} from "../../../types/sudoku/CellWriteMode";

const borderPaddingCoeff = Math.max(0.25, globalPaddingCoeff);

export interface FieldCellMouseHandlerProps<CellType, ProcessedGameStateExtensionType = {}> {
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
    cellPosition: Position;
    isDeleteSelectedCellsStroke: boolean;
    onIsDeleteSelectedCellsStrokeChange: (newValue: boolean) => void;
}

export const FieldCellMouseHandler = <CellType, ProcessedGameStateExtensionType = {}>(
    {
        state,
        onStateChange,
        cellPosition,
        isDeleteSelectedCellsStroke,
        onIsDeleteSelectedCellsStrokeChange,
    }: FieldCellMouseHandlerProps<CellType, ProcessedGameStateExtensionType>
) => {
    const isSelecting = !isNoSelectionWriteMode(state.cellWriteMode);
    const isDrawing = state.cellWriteMode === CellWriteMode.lines;

    const handleCellClick = ({ctrlKey, shiftKey, isPrimary}: PointerEvent<any>) => {
        const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

        onIsDeleteSelectedCellsStrokeChange(isMultiSelection && state.selectedCells.contains(cellPosition));
        onStateChange(
            gameState => isMultiSelection
                ? gameStateToggleSelectedCell(gameState, cellPosition)
                : gameStateSetSelectedCells(gameState, [cellPosition])
        );
    };

    const handleContinueCellSelection = () => {
        if (!state.currentMultiLine.length) {
            onStateChange(gameState => gameStateToggleSelectedCell(gameState, cellPosition, !isDeleteSelectedCellsStroke));
        }
    };

    return <>
        {isDrawing && indexes(2).flatMap(topOffset => indexes(2).map(leftOffset => {
            const cornerPosition: Position = {
                left: cellPosition.left + leftOffset,
                top: cellPosition.top + topOffset,
            };

            return <MouseHandlerRect
                key={`draw-corner-${topOffset}-${leftOffset}`}
                left={leftOffset * 0.5}
                top={topOffset * 0.5}
                width={0.5}
                height={0.5}
                onClick={() => onStateChange(gameState => gameStateStartMultiLine(gameState, cornerPosition))}
                onEnter={() => onStateChange(gameState => gameStateContinueMultiLine(gameState, cornerPosition))}
            />;
        }))}

        {!isDrawing && isSelecting && <>
            <MouseHandlerRect
                key={"cell-selection"}
                onClick={handleCellClick}
                onEnter={handleContinueCellSelection}
            />

            {indexes(2).flatMap(topOffset => indexes(2).map(leftOffset => {
                return <MouseHandlerRect
                    key={`no-interaction-corner-${topOffset}-${leftOffset}`}
                    left={leftOffset * (1 - borderPaddingCoeff)}
                    top={topOffset * (1 - borderPaddingCoeff)}
                    width={borderPaddingCoeff}
                    height={borderPaddingCoeff}
                    onClick={handleCellClick}
                />;
            }))}
        </>}
    </>;
};

interface MouseHandlerRectProps extends Partial<Rect> {
    onClick?: (ev: PointerEvent<any>) => void;
    onEnter?: (ev: PointerEvent<any>) => void;
}

export const MouseHandlerRect = ({onClick, onEnter, left = 0, top = 0, width = 1, height = 1}: MouseHandlerRectProps) => <rect
    x={left}
    y={top}
    width={width}
    height={height}
    fill={"none"}
    stroke={"none"}
    strokeWidth={0}
    style={{
        cursor: "pointer",
        touchAction: "none",
        userSelect: "none",
        pointerEvents: "all",
    }}
    onMouseDown={(ev: MouseEvent<any>) => {
        // Make sure that clicking on the grid won't be recognized as an outside click and won't try to drag
        ev.preventDefault();
        ev.stopPropagation();
    }}
    onPointerDown={(ev: PointerEvent<any>) => {
        if ((ev.target as Element).hasPointerCapture?.(ev.pointerId)) {
            (ev.target as Element).releasePointerCapture?.(ev.pointerId);
        }

        onClick?.(ev);
    }}
    onPointerEnter={(ev: PointerEvent<any>) => {
        if (ev.buttons !== 1) {
            return;
        }

        onEnter?.(ev);
    }}
/>;
