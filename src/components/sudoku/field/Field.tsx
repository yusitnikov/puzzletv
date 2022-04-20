import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {Line} from "../../layout/line/Line";
import {indexes} from "../../../utils/indexes";
import {Position} from "../../../types/layout/Position";
import {useEventListener} from "../../../hooks/useEventListener";
import {useControlKeysState} from "../../../hooks/useControlKeysState";
import {MouseEvent, PointerEvent, ReactNode, useState} from "react";
import {CellState} from "../../../types/sudoku/CellState";
import {CellBackground} from "../cell/CellBackground";
import {CellSelection} from "../cell/CellSelection";
import {CellDigits} from "../cell/CellDigits";
import {FieldSvg} from "./FieldSvg";
import {
    gameStateApplyArrowToSelectedCells,
    gameStateClearSelectedCells,
    gameStateGetCurrentFieldState,
    gameStateSelectAllCells,
    gameStateSetSelectedCells,
    gameStateToggleSelectedCell,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";

export interface FieldProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
    rect: Rect;
    cellSize: number;
}

export const Field = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        puzzle,
        state,
        onStateChange,
        rect,
        cellSize
    }: FieldProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {
        typeManager,
        fieldSize: {
            fieldSize,
            verticalLines,
            horizontalLines,
        },
        fieldMargin = 0,
        initialDigits,
        items,
    } = puzzle;

    const {selectedCells, isReady} = state;
    const {cells} = gameStateGetCurrentFieldState(state);

    if (!isReady) {
        onStateChange = () => {};
    }

    const {isAnyKeyDown} = useControlKeysState();

    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    // Handle outside click
    useEventListener(window, "mousedown", () => {
        if (!isAnyKeyDown) {
            onStateChange(gameStateClearSelectedCells);
        }

        setIsDeleteSelectedCellsStroke(false);
    });

    // Handle arrows
    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, shiftKey} = ev;

        // Use the key modifiers from the event - they are always up-to-date
        const isAnyKeyDown = ctrlKey || shiftKey;

        const handleArrow = (xDirection: number, yDirection: number) => onStateChange(
            gameState => gameStateApplyArrowToSelectedCells(puzzle, gameState, xDirection, yDirection, isAnyKeyDown)
        );

        switch (code) {
            case "ArrowLeft":
                handleArrow(-1, 0);
                break;
            case "ArrowRight":
                handleArrow(1, 0);
                break;
            case "ArrowUp":
                handleArrow(0, -1);
                break;
            case "ArrowDown":
                handleArrow(0, 1);
                break;
            case "KeyA":
                if (ctrlKey && !shiftKey) {
                    onStateChange(gameState => gameStateSelectAllCells(puzzle, gameState));
                    ev.preventDefault();
                }
                break;
            case "Escape":
                if (!isAnyKeyDown) {
                    onStateChange(gameStateClearSelectedCells);
                    ev.preventDefault();
                }
                break;
        }
    });

    const absoluteFieldMargin = cellSize * fieldMargin;
    const renderInnerFieldRect = (children: ReactNode) => <Absolute
        left={absoluteFieldMargin}
        top={absoluteFieldMargin}
        width={rect.width - absoluteFieldMargin}
        height={rect.height - absoluteFieldMargin}
    >
        {children}
    </Absolute>;

    const renderCellsLayer = (keyPrefix: string, renderer: (cellState: CellState<CellType>, cellPosition: Position) => ReactNode) =>
        renderInnerFieldRect(cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
        const cellPosition: Position = {
            left: columnIndex,
            top: rowIndex,
        };

        return <Absolute
            key={`cell-${keyPrefix}-${rowIndex}-${columnIndex}`}
            left={cellSize * cellPosition.left}
            top={cellSize * cellPosition.top}
            width={cellSize}
            height={cellSize}
        >
            {renderer(cellState, cellPosition)}
        </Absolute>;
    })));

    return <>
        <style dangerouslySetInnerHTML={{__html: `
            html,
            body {
                overflow: hidden;
            }
        `}}/>

        <Absolute
            {...rect}
            angle={typeManager.getFieldAngle?.(state)}
            style={{backgroundColor: "white"}}
        >
            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
                layer={FieldLayer.beforeBackground}
            >
                {items}
            </FieldSvg>

            {renderCellsLayer("background", ({colors}) => <CellBackground
                colors={colors}
                size={cellSize}
            />)}

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
                layer={FieldLayer.beforeSelection}
            >
                {items}
            </FieldSvg>

            {renderCellsLayer("selection", (cellState, cellPosition) => selectedCells.contains(cellPosition) && <CellSelection
                size={cellSize}
                isSecondary={selectedCells.last()?.left !== cellPosition.left || selectedCells.last()?.top !== cellPosition.top}
            />)}

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
                layer={FieldLayer.regular}
            >
                {items}
            </FieldSvg>

            {renderInnerFieldRect(indexes(fieldSize, true).map(index => <Line
                key={`h-line-${index}`}
                x1={0}
                y1={cellSize * index}
                x2={cellSize * fieldSize}
                y2={cellSize * index}
                width={[0, fieldSize, ...horizontalLines].includes(index) ? 3 : 1}
            />))}

            {renderInnerFieldRect(indexes(fieldSize, true).map(index => <Line
                key={`v-line-${index}`}
                x1={cellSize * index}
                y1={0}
                x2={cellSize * index}
                y2={cellSize * fieldSize}
                width={[0, fieldSize, ...verticalLines].includes(index) ? 3 : 1}
            />))}

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
                layer={FieldLayer.top}
            >
                {items}
            </FieldSvg>

            {renderCellsLayer("digits", (cellState, {top, left}) => <CellDigits
                typeManager={typeManager}
                data={cellState}
                initialData={initialDigits?.[top]?.[left]}
                size={cellSize}
                state={state}
            />)}

            {renderCellsLayer("mouse-handler", (cellState, cellPosition) => <Absolute
                width={cellSize}
                height={cellSize}
                pointerEvents={true}
                style={{
                    cursor: isReady ? "pointer" : undefined,
                    touchAction: "none",
                    userSelect: "none",
                }}
                onMouseDown={(ev: MouseEvent<HTMLDivElement>) => {
                    // Make sure that clicking on the grid won't be recognized as an outside click and won't try to drag
                    ev.preventDefault();
                    ev.stopPropagation();
                }}
                onPointerDown={({target, pointerId, ctrlKey, shiftKey, isPrimary}: PointerEvent<HTMLDivElement>) => {
                    if ((target as HTMLDivElement).hasPointerCapture?.(pointerId)) {
                        (target as HTMLDivElement).releasePointerCapture?.(pointerId);
                    }

                    const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

                    setIsDeleteSelectedCellsStroke(isMultiSelection && selectedCells.contains(cellPosition));
                    onStateChange(
                        gameState => isMultiSelection
                            ? gameStateToggleSelectedCell(gameState, cellPosition)
                            : gameStateSetSelectedCells(gameState, [cellPosition])
                    );
                }}
                onPointerEnter={({buttons}: PointerEvent<HTMLDivElement>) => {
                    if (buttons !== 1) {
                        return;
                    }

                    onStateChange(gameState => gameStateToggleSelectedCell(gameState, cellPosition, !isDeleteSelectedCellsStroke));
                }}
            />)}
        </Absolute>
    </>;
};
