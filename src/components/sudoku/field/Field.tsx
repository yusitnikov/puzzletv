import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {indexes} from "../../../utils/indexes";
import {Position} from "../../../types/layout/Position";
import {useEventListener} from "../../../hooks/useEventListener";
import {useControlKeysState} from "../../../hooks/useControlKeysState";
import {FC, MouseEvent, PointerEvent, ReactNode, useState} from "react";
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
import {textColor} from "../../app/globals";
import {RoundedPolyLine} from "../../svg/rounded-poly-line/RoundedPolyLine";
import {FieldLayerContext} from "../../../contexts/FieldLayerContext";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";

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

    const Items: FC<ProcessedGameState<CellType> & ProcessedGameStateExtensionType> = typeof items === "function"
        ? items as FC<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>
        : () => <>{items}</>;

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

    const renderCellsLayer = (keyPrefix: string, renderer: (cellState: CellState<CellType>, cellPosition: Position) => ReactNode, clip = false, useShadow = false) =>
        <FieldSvg
            fieldSize={fieldSize}
            fieldMargin={fieldMargin}
            cellSize={cellSize}
            useShadow={useShadow}
        >
            {cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
                const cellPosition: Position = {
                    left: columnIndex,
                    top: rowIndex,
                };

                return <AutoSvg
                    key={`cell-${keyPrefix}-${rowIndex}-${columnIndex}`}
                    left={cellPosition.left}
                    top={cellPosition.top}
                    width={1}
                    height={1}
                    clip={clip}
                >
                    {renderer(cellState, cellPosition)}
                </AutoSvg>;
            }))}
        </FieldSvg>;

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
            >
                <FieldLayerContext.Provider value={FieldLayer.beforeBackground}>
                    <Items {...state}/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            {renderCellsLayer("background", ({colors}) => <CellBackground
                colors={colors}
            />)}

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
            >
                <FieldLayerContext.Provider value={FieldLayer.beforeSelection}>
                    <Items {...state}/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            {renderCellsLayer("selection", (cellState, cellPosition) => selectedCells.contains(cellPosition) && <CellSelection
                size={cellSize}
                isSecondary={selectedCells.last()?.left !== cellPosition.left || selectedCells.last()?.top !== cellPosition.top}
            />)}

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
            >
                <FieldLayerContext.Provider value={FieldLayer.regular}>
                    <Items {...state}/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
                useShadow={false}
            >
                {indexes(fieldSize, true).map(index => <RoundedPolyLine
                    key={`h-line-${index}`}
                    points={[
                        [0, index],
                        [fieldSize, index],
                    ]}
                    stroke={textColor}
                    strokeWidth={([0, fieldSize, ...horizontalLines].includes(index) ? 3 : 1) / cellSize}
                />)}

                {indexes(fieldSize, true).map(index => <RoundedPolyLine
                    key={`v-line-${index}`}
                    points={[
                        [index, 0],
                        [index, fieldSize],
                    ]}
                    stroke={textColor}
                    strokeWidth={([0, fieldSize, ...verticalLines].includes(index) ? 3 : 1) / cellSize}
                />)}
            </FieldSvg>

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
            >
                <FieldLayerContext.Provider value={FieldLayer.top}>
                    <Items {...state}/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            {renderCellsLayer("digits", (cellState, {top, left}) => <CellDigits
                typeManager={typeManager}
                data={cellState}
                initialData={initialDigits?.[top]?.[left]}
                size={1}
                state={state}
            />, false, true)}

            {renderCellsLayer("mouse-handler", (cellState, cellPosition) => <rect
                width={1}
                height={1}
                fill={"none"}
                stroke={"none"}
                style={{
                    cursor: isReady ? "pointer" : undefined,
                    touchAction: "none",
                    userSelect: "none",
                    pointerEvents: "all",
                }}
                onMouseDown={(ev: MouseEvent<any>) => {
                    // Make sure that clicking on the grid won't be recognized as an outside click and won't try to drag
                    ev.preventDefault();
                    ev.stopPropagation();
                }}
                onPointerDown={({target, pointerId, ctrlKey, shiftKey, isPrimary}: PointerEvent<any>) => {
                    if ((target as Element).hasPointerCapture?.(pointerId)) {
                        (target as Element).releasePointerCapture?.(pointerId);
                    }

                    const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

                    setIsDeleteSelectedCellsStroke(isMultiSelection && selectedCells.contains(cellPosition));
                    onStateChange(
                        gameState => isMultiSelection
                            ? gameStateToggleSelectedCell(gameState, cellPosition)
                            : gameStateSetSelectedCells(gameState, [cellPosition])
                    );
                }}
                onPointerEnter={({buttons}: PointerEvent<any>) => {
                    if (buttons !== 1) {
                        return;
                    }

                    onStateChange(gameState => gameStateToggleSelectedCell(gameState, cellPosition, !isDeleteSelectedCellsStroke));
                }}
            />, true)}
        </Absolute>
    </>;
};
