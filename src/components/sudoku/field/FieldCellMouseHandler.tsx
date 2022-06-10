import {
    gameStateGetCurrentFieldState,
    gameStateSetSelectedCells,
    gameStateToggleSelectedCells
} from "../../../types/sudoku/GameState";
import {Position} from "../../../types/layout/Position";
import {MouseEvent, PointerEvent} from "react";
import {Rect} from "../../../types/layout/Rect";
import {globalPaddingCoeff} from "../../app/globals";
import {indexes} from "../../../utils/indexes";
import {CellState} from "../../../types/sudoku/CellState";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FieldCellShape} from "./FieldCellShape";
import {CellExactPosition} from "../../../types/sudoku/CellExactPosition";
import {CellPart} from "../../../types/sudoku/CellPart";

const borderPaddingCoeff = Math.max(0.25, globalPaddingCoeff);

export interface FieldCellMouseHandlerProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    cellPosition: Position;
    isDeleteSelectedCellsStroke: boolean;
    onIsDeleteSelectedCellsStrokeChange: (newValue: boolean) => void;
}

export const FieldCellMouseHandler = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        context,
        cellPosition,
        isDeleteSelectedCellsStroke,
        onIsDeleteSelectedCellsStrokeChange,
    }: FieldCellMouseHandlerProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {puzzle, cellsIndex, state, onStateChange} = context;

    const {cellWriteModeInfo: {isNoSelectionMode, onCornerClick, onCornerEnter}, selectedCells, currentMultiLineEnd, initialDigits: stateInitialDigits} = state;

    const {areCustomBounds, center, borderSegments} = cellsIndex.allCells[cellPosition.top][cellPosition.left];

    const centerExactPosition: CellExactPosition = {
        center,
        corner: cellPosition,
        round: center,
        type: CellPart.center,
    };

    const handleCellClick = ({ctrlKey, shiftKey, isPrimary}: PointerEvent<any>) => {
        const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

        onIsDeleteSelectedCellsStrokeChange(isMultiSelection && selectedCells.contains(cellPosition));
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
        const mainDigit = initialDigits?.[cellPosition.top]?.[cellPosition.left]
            || stateInitialDigits?.[cellPosition.top]?.[cellPosition.left]
            || usersDigit;

        let filter: (cell: CellState<CellType>, initialDigit?: CellType) => boolean;
        if (mainDigit) {
            filter = ({usersDigit}, initialDigit) => {
                const otherMainDigit = initialDigit || usersDigit;
                return otherMainDigit !== undefined && areSameCellData(mainDigit, otherMainDigit, undefined, false);
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
                initialDigit: initialDigits?.[top]?.[left] || stateInitialDigits?.[top]?.[left],
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
        if (!currentMultiLineEnd) {
            onStateChange(gameState => gameStateToggleSelectedCells(gameState, [cellPosition], !isDeleteSelectedCellsStroke));
        }
    };

    return <>
        {(onCornerClick || onCornerEnter) && <>
            {!areCustomBounds && indexes(4).flatMap(topOffset => indexes(4).map(leftOffset => {
                const isTopCenter = [1, 2].includes(topOffset);
                const isLeftCenter = [1, 2].includes(leftOffset);

                const exactPosition: CellExactPosition = {
                    center,
                    corner: {
                        left: cellPosition.left + (leftOffset >> 1),
                        top: cellPosition.top + (topOffset >> 1),
                    },
                    round: {
                        left: cellPosition.left + (isLeftCenter ? 0.5 : (leftOffset ? 1 : 0)),
                        top: cellPosition.top + (isTopCenter ? 0.5 : (topOffset ? 1 : 0)),
                    },
                    type: isTopCenter && isLeftCenter ? CellPart.center : (!isTopCenter && !isLeftCenter ? CellPart.corner : CellPart.border),
                };

                return <MouseHandlerRect
                    key={`draw-corner-${topOffset}-${leftOffset}`}
                    context={context}
                    cellPosition={cellPosition}
                    left={leftOffset * 0.25}
                    top={topOffset * 0.25}
                    width={0.25}
                    height={0.25}
                    onClick={() => onCornerClick?.(context, exactPosition)}
                    onEnter={() => onCornerEnter?.(context, exactPosition)}
                />;
            }))}

            {areCustomBounds && <>
                <MouseHandlerRect
                    key={"draw-center"}
                    context={context}
                    cellPosition={cellPosition}
                    onClick={() => onCornerClick?.(context, centerExactPosition)}
                    onEnter={() => onCornerEnter?.(context, centerExactPosition)}
                />

                {Object.entries(borderSegments).map(([key, {line, center: borderCenter}]) => {
                    const exactPosition: CellExactPosition = {
                        center,
                        corner: cellPosition,
                        round: borderCenter,
                        type: CellPart.border,
                    };

                    return <MouseHandlerRect
                        key={`draw-border-${key}`}
                        context={context}
                        cellPosition={cellPosition}
                        line={line}
                        onClick={() => onCornerClick?.(context, exactPosition)}
                        onEnter={() => onCornerEnter?.(context, exactPosition)}
                    />
                })}
            </>}
        </>}

        {!isNoSelectionMode && <>
            <MouseHandlerRect
                key={"cell-selection"}
                context={context}
                cellPosition={cellPosition}
                onClick={handleCellClick}
                onDoubleClick={handleCellDoubleClick}
                onEnter={handleContinueCellSelection}
            />

            {!areCustomBounds && indexes(2).flatMap(topOffset => indexes(2).map(leftOffset => {
                return <MouseHandlerRect
                    key={`no-interaction-corner-${topOffset}-${leftOffset}`}
                    context={context}
                    cellPosition={cellPosition}
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
    context: PuzzleContext<any, any, any>;
    cellPosition: Position;
    line?: Position[];
    onClick?: (ev: PointerEvent<any>) => void;
    onDoubleClick?: (ev: MouseEvent<any>) => void;
    onEnter?: (ev: PointerEvent<any>) => void;
}

export const MouseHandlerRect = ({context, cellPosition, line, onClick, onDoubleClick, onEnter, ...rect}: MouseHandlerRectProps) => <FieldCellShape
    context={context}
    cellPosition={cellPosition}
    line={line}
    style={{
        cursor: "pointer",
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
    onDoubleClick={onDoubleClick}
    onPointerEnter={(ev: PointerEvent<any>) => {
        if (ev.buttons !== 1) {
            return;
        }

        onEnter?.(ev);
    }}
    {...rect}
/>;
