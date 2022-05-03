import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {
    gameStateSetSelectedCells,
    gameStateToggleSelectedCell,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {Position} from "../../../types/layout/Position";
import {CellState} from "../../../types/sudoku/CellState";
import {MouseEvent, PointerEvent} from "react";
import {Rect} from "../../../types/layout/Rect";
import {globalPaddingCoeff} from "../../app/globals";
import {indexes} from "../../../utils/indexes";

const paddingCoeff = Math.max(0.25, globalPaddingCoeff);

export interface FieldCellMouseHandlerProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
    cellPosition: Position;
    cellState: CellState<CellType>;
    isDeleteSelectedCellsStroke: boolean;
    onIsDeleteSelectedCellsStrokeChange: (newValue: boolean) => void;
}

export const FieldCellMouseHandler = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        // puzzle,
        state,
        onStateChange,
        cellPosition,
        // cellState,
        isDeleteSelectedCellsStroke,
        onIsDeleteSelectedCellsStrokeChange,
    }: FieldCellMouseHandlerProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const handleClick = ({ctrlKey, shiftKey, isPrimary}: PointerEvent<any>) => {
        const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

        onIsDeleteSelectedCellsStrokeChange(isMultiSelection && state.selectedCells.contains(cellPosition));
        onStateChange(
            gameState => isMultiSelection
                ? gameStateToggleSelectedCell(gameState, cellPosition)
                : gameStateSetSelectedCells(gameState, [cellPosition])
        );
    };

    return <>
        <MouseHandlerRect
            onClick={handleClick}
            onEnter={() => {
                onStateChange(gameState => gameStateToggleSelectedCell(gameState, cellPosition, !isDeleteSelectedCellsStroke));
            }}
        />

        {indexes(2).flatMap(top => indexes(2).map(left => <MouseHandlerRect
            key={`corner-${top}-${left}`}
            left={left * (1 - paddingCoeff)}
            top={top * (1 - paddingCoeff)}
            width={paddingCoeff}
            height={paddingCoeff}
            onClick={handleClick}
            onEnter={() => {
                // TODO: drawing mode
            }}
        />))}
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
