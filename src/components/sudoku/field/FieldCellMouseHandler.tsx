import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {
    gameStateContinueMultiLine,
    gameStateResetCurrentMultiLine,
    gameStateSetSelectedCells,
    gameStateStartMultiLine,
    gameStateSetSelectingCells,
    gameStateToggleSelectedCell,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {Position} from "../../../types/layout/Position";
import {MouseEvent, PointerEvent} from "react";
import {Rect} from "../../../types/layout/Rect";
import {globalPaddingCoeff} from "../../app/globals";
import {indexes} from "../../../utils/indexes";

const borderPaddingCoeff = Math.max(0.15, globalPaddingCoeff);

export interface FieldCellMouseHandlerProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
    cellPosition: Position;
    isDeleteSelectedCellsStroke: boolean;
    onIsDeleteSelectedCellsStrokeChange: (newValue: boolean) => void;
}

export const FieldCellMouseHandler = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        puzzle: {allowDrawingBorders},
        state,
        onStateChange,
        cellPosition,
        isDeleteSelectedCellsStroke,
        onIsDeleteSelectedCellsStrokeChange,
    }: FieldCellMouseHandlerProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const cellSelectionPadding = state.isSelectingCells ? 0 : borderPaddingCoeff;

    const handleCellClick = ({ctrlKey, shiftKey, isPrimary}: PointerEvent<any>) => {
        const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

        onIsDeleteSelectedCellsStrokeChange(isMultiSelection && state.selectedCells.contains(cellPosition));
        onStateChange(gameState => ({
            ...(
                isMultiSelection
                    ? gameStateToggleSelectedCell(gameState, cellPosition)
                    : gameStateSetSelectedCells(gameState, [cellPosition])
            ),
            ...gameStateSetSelectingCells(true),
        }));
    };

    const handleContinueCellSelection = () => {
        if (!state.currentMultiLine.length) {
            onStateChange(gameState => gameStateToggleSelectedCell(gameState, cellPosition, !isDeleteSelectedCellsStroke));
        }
    };

    const handleCornerClick = (ev: PointerEvent<any>, point: Position) => {
        if (allowDrawingBorders) {
            onStateChange(gameState => gameStateStartMultiLine(gameState, point));
        } else {
            handleCellClick(ev);
        }
    };

    return <>
        {indexes(2).flatMap(topOffset => indexes(2).map(leftOffset => {
            const cornerPosition: Position = {
                left: cellPosition.left + leftOffset,
                top: cellPosition.top + topOffset,
            };

            return <MouseHandlerRect
                key={`draw-corner-${topOffset}-${leftOffset}`}
                disabled={state.isSelectingCells}
                left={leftOffset * 0.5}
                top={topOffset * 0.5}
                width={0.5}
                height={0.5}
                onClick={(ev) => handleCornerClick(ev, cornerPosition)}
                onEnter={() => {
                    handleContinueCellSelection();

                    if (allowDrawingBorders) {
                        onStateChange(gameState => gameStateContinueMultiLine(gameState, cornerPosition));
                    }
                }}
            />;
        }))}

        <MouseHandlerRect
            key={"cell-selection"}
            disabled={state.currentMultiLine.length !== 0}
            left={cellSelectionPadding}
            top={cellSelectionPadding}
            width={1 - 2 * cellSelectionPadding}
            height={1 - 2 * cellSelectionPadding}
            onClick={(ev) => {
                handleCellClick(ev);
                onStateChange(gameStateResetCurrentMultiLine);
            }}
            onEnter={handleContinueCellSelection}
        />

        {indexes(2).flatMap(topOffset => indexes(2).map(leftOffset => {
            return <MouseHandlerRect
                key={`no-interaction-corner-${topOffset}-${leftOffset}`}
                disabled={!state.isSelectingCells}
                left={leftOffset * (1 - borderPaddingCoeff)}
                top={topOffset * (1 - borderPaddingCoeff)}
                width={borderPaddingCoeff}
                height={borderPaddingCoeff}
            />;
        }))}
    </>;
};

interface MouseHandlerRectProps extends Partial<Rect> {
    disabled?: boolean;
    onClick?: (ev: PointerEvent<any>) => void;
    onEnter?: (ev: PointerEvent<any>) => void;
}

export const MouseHandlerRect = ({disabled, onClick, onEnter, left = 0, top = 0, width = 1, height = 1}: MouseHandlerRectProps) => <rect
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
        pointerEvents: disabled ? "none" : "all",
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
