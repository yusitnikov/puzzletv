import {
    gameStateContinueMultiLine,
    gameStateGetCurrentFieldState,
    gameStateSetSelectedCells,
    gameStateStartMultiLine,
    gameStateToggleSelectedCells,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {formatSvgPointsArray, getVectorLength, Position} from "../../../types/layout/Position";
import {MouseEvent, PointerEvent, SVGAttributes} from "react";
import {Rect} from "../../../types/layout/Rect";
import {globalPaddingCoeff, textColor} from "../../app/globals";
import {indexes} from "../../../utils/indexes";
import {CellWriteMode, isNoSelectionWriteMode} from "../../../types/sudoku/CellWriteMode";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {CellState} from "../../../types/sudoku/CellState";
import {getFieldRectTransform} from "./FieldRect";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FieldCellShape} from "./FieldCellShape";

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
    const {puzzle, state, onStateChange} = context;

    const isSelecting = !isNoSelectionWriteMode(state.cellWriteMode);
    const isDrawing = state.cellWriteMode === CellWriteMode.lines;

    const customCellBounds = puzzle.customCellBounds?.[cellPosition.top]?.[cellPosition.left];
    let customCellBorders: Position[][] | undefined = undefined;
    if (customCellBounds) {
        const {left, top, width, height} = customCellBounds.userArea;
        customCellBorders = customCellBounds.borders.map(
            (border) => border.map(
                (point) => ({
                    left: (point.left - left) / width,
                    top: (point.top - top) / height,
                })
            )
        );
    }

    const {rightVector, bottomVector} = getFieldRectTransform(context, cellPosition);
    const cellTransformedSize = (getVectorLength(rightVector) + getVectorLength(bottomVector)) / 2;

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
                context={context}
                cellPosition={cellPosition}
                cellTransformedSize={cellTransformedSize}
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
                context={context}
                cellPosition={cellPosition}
                cellTransformedSize={cellTransformedSize}
                customCellBorders={customCellBorders}
                onClick={handleCellClick}
                onDoubleClick={handleCellDoubleClick}
                onEnter={handleContinueCellSelection}
            />

            {!customCellBounds && indexes(2).flatMap(topOffset => indexes(2).map(leftOffset => {
                return <MouseHandlerRect
                    key={`no-interaction-corner-${topOffset}-${leftOffset}`}
                    context={context}
                    cellPosition={cellPosition}
                    cellTransformedSize={cellTransformedSize}
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
    cellTransformedSize: number;
    customCellBorders?: Position[][];
    onClick?: (ev: PointerEvent<any>) => void;
    onDoubleClick?: (ev: MouseEvent<any>) => void;
    onEnter?: (ev: PointerEvent<any>) => void;
}

export const MouseHandlerRect = ({context, cellPosition, cellTransformedSize, customCellBorders, onClick, onDoubleClick, onEnter, left = 0, top = 0, width = 1, height = 1}: MouseHandlerRectProps) => {
    const props: Omit<SVGAttributes<SVGRectElement | SVGPolygonElement>, keyof Rect> = {
        fill: "none",
        style: {
            cursor: "pointer",
            pointerEvents: "all",
        },
        onMouseDown: (ev: MouseEvent<any>) => {
            // Make sure that clicking on the grid won't be recognized as an outside click and won't try to drag
            ev.preventDefault();
            ev.stopPropagation();
        },
        onPointerDown: (ev: PointerEvent<any>) => {
            if ((ev.target as Element).hasPointerCapture?.(ev.pointerId)) {
                (ev.target as Element).releasePointerCapture?.(ev.pointerId);
            }

            onClick?.(ev);
        },
        onDoubleClick,
        onPointerEnter: (ev: PointerEvent<any>) => {
            if (ev.buttons !== 1) {
                return;
            }

            onEnter?.(ev);
        },
    };

    return <FieldCellShape
        context={context}
        cellPosition={cellPosition}
        {...props}
    />;
    return <>
        {!customCellBorders && <rect
            x={left}
            y={top}
            width={width}
            height={height}
            stroke={"none"}
            strokeWidth={0}
            {...props}
        />}

        {customCellBorders?.map((border, index) => <polygon
            key={`part-${index}`}
            points={formatSvgPointsArray(border)}
            stroke={textColor}
            // strokeWidth={3 / cellTransformedSize}
            strokeWidth={0}
            {...props}
        />)}
    </>;
};
