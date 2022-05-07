import {
    gameStateContinueMultiLine,
    gameStateGetCurrentFieldState,
    gameStateSetSelectedCells,
    gameStateStartMultiLine,
    gameStateToggleSelectedCells,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {Position} from "../../../types/layout/Position";
import {MouseEvent, PointerEvent} from "react";
import {Rect} from "../../../types/layout/Rect";
import {globalPaddingCoeff} from "../../app/globals";
import {indexes} from "../../../utils/indexes";
import {CellWriteMode, isNoSelectionWriteMode} from "../../../types/sudoku/CellWriteMode";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {CellState} from "../../../types/sudoku/CellState";

const borderPaddingCoeff = Math.max(0.25, globalPaddingCoeff);

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
        puzzle,
        state,
        onStateChange,
        cellPosition,
        isDeleteSelectedCellsStroke,
        onIsDeleteSelectedCellsStrokeChange,
    }: FieldCellMouseHandlerProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const isSelecting = !isNoSelectionWriteMode(state.cellWriteMode);
    const isDrawing = state.cellWriteMode === CellWriteMode.lines;

    const handleCellClick = ({ctrlKey, shiftKey, isPrimary}: PointerEvent<any>) => {
        const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

        onIsDeleteSelectedCellsStrokeChange(isMultiSelection && state.selectedCells.contains(cellPosition));
        onStateChange(
            gameState => isMultiSelection
                ? gameStateToggleSelectedCells(gameState, [cellPosition])
                : gameStateSetSelectedCells(gameState, [cellPosition])
        );
    };

    const handleCellDoubleClick = ({ctrlKey, shiftKey}: MouseEvent<any>) => {
        const {initialDigits, typeManager: {areSameCellData}} = puzzle;
        const {cells} = gameStateGetCurrentFieldState(state);

        const {usersDigit, colors, centerDigits, cornerDigits} = cells[cellPosition.top][cellPosition.left];
        const mainDigit = initialDigits?.[cellPosition.top]?.[cellPosition.left] || usersDigit;

        let filter: (cell: CellState<CellType>, initialDigit?: CellType) => boolean;
        if (mainDigit) {
            filter = ({usersDigit}, initialDigit) => {
                const otherMainDigit = initialDigit || usersDigit;
                return otherMainDigit !== undefined && areSameCellData(mainDigit, otherMainDigit, state, true);
            };
        } else if (colors.size) {
            filter = ({colors: otherColors}) => otherColors.containsOneOf(colors.items);
        } else if (centerDigits.size) {
            filter = ({centerDigits: otherCenterDigits}) => otherCenterDigits.containsOneOf(centerDigits.items);
        } else if (cornerDigits.size) {
            filter = ({cornerDigits: otherCornerDigits}) => otherCornerDigits.containsOneOf(cornerDigits.items);
        } else {
            return;
        }

        const matchingPositions: Position[] = cells
            .flatMap((row, top) => row.map((cellState, left) => ({
                position: {top, left},
                cellState,
                initialDigit: initialDigits?.[top]?.[left],
            })))
            .filter(({cellState, initialDigit}) => filter(cellState, initialDigit))
            .map(({position}) => position);

        if (ctrlKey || shiftKey) {
            onStateChange(gameState => gameStateToggleSelectedCells(gameState, matchingPositions, true));
        } else {
            onStateChange(gameState => gameStateSetSelectedCells(gameState, matchingPositions));
        }
    };

    const handleContinueCellSelection = () => {
        if (!state.currentMultiLine.length) {
            onStateChange(gameState => gameStateToggleSelectedCells(gameState, [cellPosition], !isDeleteSelectedCellsStroke));
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
                onEnter={() => onStateChange(gameState => gameStateContinueMultiLine(puzzle, gameState, cornerPosition))}
            />;
        }))}

        {!isDrawing && isSelecting && <>
            <MouseHandlerRect
                key={"cell-selection"}
                onClick={handleCellClick}
                onDoubleClick={handleCellDoubleClick}
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
                    onDoubleClick={handleCellDoubleClick}
                />;
            }))}
        </>}
    </>;
};

interface MouseHandlerRectProps extends Partial<Rect> {
    onClick?: (ev: PointerEvent<any>) => void;
    onDoubleClick?: (ev: MouseEvent<any>) => void;
    onEnter?: (ev: PointerEvent<any>) => void;
}

export const MouseHandlerRect = ({onClick, onDoubleClick, onEnter, left = 0, top = 0, width = 1, height = 1}: MouseHandlerRectProps) => <rect
    x={left}
    y={top}
    width={width}
    height={height}
    fill={"none"}
    stroke={"none"}
    strokeWidth={0}
    style={{
        cursor: "pointer",
        pointerEvents: "all",
    }}
    onMouseDown={(ev: MouseEvent<any>) => {
        // Make sure that clicking on the grid won't be recognized as an outside click and won't try to drag
        ev.preventDefault();
        ev.stopPropagation();
    }}
    onDoubleClick={onDoubleClick}
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
