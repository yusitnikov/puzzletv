import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {Position} from "../../../types/layout/Position";
import {useEventListener} from "../../../hooks/useEventListener";
import {useControlKeysState} from "../../../hooks/useControlKeysState";
import {Fragment, ReactNode, useMemo, useState} from "react";
import {CellState} from "../../../types/sudoku/CellState";
import {CellBackground} from "../cell/CellBackground";
import {CellSelection, CellSelectionColor} from "../cell/CellSelection";
import {CellDigits, shouldSkipCellDigits} from "../cell/CellDigits";
import {FieldSvg} from "./FieldSvg";
import {
    gameStateApplyArrowToSelectedCells,
    gameStateApplyCurrentMultiLine,
    gameStateClearSelectedCells,
    gameStateGetCurrentFieldState,
    gameStateNormalizeLoopOffset,
    gameStateResetCurrentMultiLine,
    gameStateSelectAllCells,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {FieldLayerContext} from "../../../contexts/FieldLayerContext";
import {FieldRect} from "./FieldRect";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {
    asConstraint,
    ConstraintOrComponent,
    getAllPuzzleConstraintsAndComponents,
    isConstraint,
    isValidUserDigit,
    prepareGivenDigitsMapForConstraints
} from "../../../types/sudoku/Constraint";
import {FieldCellMouseHandler} from "./FieldCellMouseHandler";
import {CellWriteMode, isNoSelectionWriteMode} from "../../../types/sudoku/CellWriteMode";
import {indexesFromTo} from "../../../utils/indexes";
import {Set} from "../../../types/struct/Set";

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
        fieldSize,
        fieldMargin = 0,
        initialDigits = {},
        initialColors = {},
        loopHorizontally,
        loopVertically,
    } = puzzle;

    const {
        isValidCell = () => true,
        getRegionsWithSameCoordsTransformation,
        getCellSelectionType,
    } = typeManager;

    const items = useMemo(() => getAllPuzzleConstraintsAndComponents(puzzle, state, cellSize), [puzzle, state, cellSize]);

    const regionsWithSameCoordsTransformation = getRegionsWithSameCoordsTransformation?.(puzzle);

    const itemsProps: ItemsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> = {
        items,
        puzzle,
        state,
        regionsWithSameCoordsTransformation,
        cellSize,
    };

    const {
        selectedCells,
        isReady,
        cellWriteMode,
        enableConflictChecker,
        loopOffset,
    } = state;
    const {cells} = gameStateGetCurrentFieldState(state);

    if (!isReady) {
        onStateChange = () => {};
    }

    const userDigits = useMemo(() => prepareGivenDigitsMapForConstraints(puzzle, cells), [puzzle, cells]);

    const {isAnyKeyDown} = useControlKeysState();

    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    const [dragStart, setDragStart] = useState<Position | undefined>(undefined);

    // Handle outside click
    useEventListener(window, "mousedown", () => {
        if (!isAnyKeyDown) {
            onStateChange(gameStateClearSelectedCells);
        }

        setIsDeleteSelectedCellsStroke(false);
        onStateChange(gameStateResetCurrentMultiLine);
    });

    useEventListener(window, "pointerup", () => {
        onStateChange(gameState => gameStateApplyCurrentMultiLine(typeManager, gameState));
    });

    useEventListener(window, "pointerdown", ({screenX, screenY}: PointerEvent) => {
        if (cellWriteMode === CellWriteMode.move) {
            setDragStart({
                left: loopOffset.left - screenX / cellSize,
                top: loopOffset.top - screenY / cellSize,
            });
        }
    });

    useEventListener(window, "pointermove", ({screenX, screenY}: PointerEvent) => {
        if (dragStart) {
            onStateChange({
                loopOffset: gameStateNormalizeLoopOffset(puzzle, {
                    left: loopHorizontally
                        ? dragStart.left + screenX / cellSize
                        : loopOffset.left,
                    top: loopVertically
                        ? dragStart.top + screenY / cellSize
                        : loopOffset.top,
                }),
            } as Partial<ProcessedGameState<CellType>> as any);
        }
    });

    useEventListener(window, "pointerup", () => {
        setDragStart(undefined);
    });

    useEventListener(window, "contextmenu", (ev: MouseEvent) => {
        ev.preventDefault();
        return false;
    });

    // Handle arrows
    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, shiftKey} = ev;

        // Use the key modifiers from the event - they are always up-to-date
        const isAnyKeyDown = ctrlKey || shiftKey;

        const handleArrow = (xDirection: number, yDirection: number, isMainKeyboard = true) => (isMainKeyboard || !ctrlKey) && onStateChange(
            gameState => gameStateApplyArrowToSelectedCells(puzzle, gameState, xDirection, yDirection, isAnyKeyDown, isMainKeyboard)
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
                handleArrow(-1, 0, false);
                break;
            case "KeyD":
                handleArrow(1, 0, false);
                break;
            case "KeyW":
                handleArrow(0, -1, false);
                break;
            case "KeyS":
                handleArrow(0, 1, false);
                break;
            case "Escape":
                if (!isAnyKeyDown) {
                    onStateChange(gameStateClearSelectedCells);
                    ev.preventDefault();
                }
                break;
        }
    });

    const renderCellsLayer = (
        keyPrefix: string,
        topOffset: number,
        leftOffset: number,
        renderer: (cellState: CellState<CellType>, cellPosition: Position) => ReactNode,
        useShadow = false
    ) =>
        <FieldSvg
            fieldSize={fieldSize}
            fieldMargin={fieldMargin}
            cellSize={cellSize}
            useShadow={useShadow}
        >
            {cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
                const finalTop = topOffset * fieldSize.rowsCount + loopOffset.top + rowIndex;
                if (finalTop <= -1 - fieldMargin || finalTop >= fieldSize.fieldSize + fieldMargin) {
                    return null;
                }

                const finalLeft = leftOffset * fieldSize.columnsCount + loopOffset.left + columnIndex;
                if (finalLeft <= -1 - fieldMargin || finalLeft >= fieldSize.fieldSize + fieldMargin) {
                    return null;
                }

                const cellPosition: Position = {
                    left: columnIndex,
                    top: rowIndex,
                };

                if (!isValidCell(cellPosition, puzzle)) {
                    return null;
                }

                const content = renderer(cellState, cellPosition);

                return content && <FieldRect
                    key={`cell-${keyPrefix}-${rowIndex}-${columnIndex}`}
                    puzzle={puzzle}
                    {...cellPosition}
                >
                    {content}
                </FieldRect>;
            }))}
        </FieldSvg>;

    return <Absolute
        {...rect}
        angle={typeManager.getFieldAngle?.(state)}
        style={{
            backgroundColor: "white",
            overflow: loopHorizontally || loopVertically ? "hidden" : undefined,
        }}
    >
        <Absolute
            left={loopOffset.left * cellSize}
            top={loopOffset.top * cellSize}
        >
            {indexesFromTo(loopVertically ? -1 : 0, loopVertically ? 1 : 0, true).flatMap(
                topOffset => indexesFromTo(loopHorizontally ? -1 : 0, loopHorizontally ? 1 : 0, true).map(
                    leftOffset => <Absolute
                        key={`${topOffset}-${leftOffset}`}
                        left={leftOffset * fieldSize.columnsCount * cellSize}
                        top={topOffset * fieldSize.rowsCount * cellSize}
                    >
                        <FieldSvg
                            fieldSize={fieldSize}
                            fieldMargin={fieldMargin}
                            cellSize={cellSize}
                        >
                            <FieldLayerContext.Provider value={FieldLayer.beforeBackground}>
                                <Items {...itemsProps}/>
                            </FieldLayerContext.Provider>
                        </FieldSvg>

                        {renderCellsLayer("background", topOffset, leftOffset, ({colors}, {left , top}) => {
                            const finalColors = colors?.size ? colors : new Set(initialColors[top]?.[left] || []);

                            return !!finalColors?.size && <CellBackground
                                colors={finalColors}
                            />;
                        })}

                        <FieldSvg
                            fieldSize={fieldSize}
                            fieldMargin={fieldMargin}
                            cellSize={cellSize}
                        >
                            <FieldLayerContext.Provider value={FieldLayer.beforeSelection}>
                                <Items {...itemsProps}/>
                            </FieldLayerContext.Provider>
                        </FieldSvg>

                        {!isNoSelectionWriteMode(cellWriteMode) && renderCellsLayer("selection", topOffset, leftOffset, (cellState, cellPosition) => {
                            let color = "";
                            let width = 1;

                            if (selectedCells.contains(cellPosition)) {
                                color = selectedCells.last()?.left === cellPosition.left && selectedCells.last()?.top === cellPosition.top
                                    ? CellSelectionColor.mainCurrent
                                    : CellSelectionColor.mainPrevious;
                            } else if (getCellSelectionType) {
                                const customSelection = getCellSelectionType(cellPosition, puzzle, state);
                                if (customSelection) {
                                    color = customSelection.color;
                                    width = customSelection.strokeWidth;
                                }
                            }

                            return !!color && <CellSelection
                                size={cellSize}
                                color={color}
                                strokeWidth={width}
                            />;
                        })}

                        <FieldSvg
                            fieldSize={fieldSize}
                            fieldMargin={fieldMargin}
                            cellSize={cellSize}
                        >
                            <FieldLayerContext.Provider value={FieldLayer.regular}>
                                <Items {...itemsProps}/>
                            </FieldLayerContext.Provider>
                        </FieldSvg>

                        <FieldSvg
                            fieldSize={fieldSize}
                            fieldMargin={fieldMargin}
                            cellSize={cellSize}
                            useShadow={false}
                        >
                            <FieldLayerContext.Provider value={FieldLayer.lines}>
                                <Items {...itemsProps}/>
                            </FieldLayerContext.Provider>
                        </FieldSvg>

                        <FieldSvg
                            fieldSize={fieldSize}
                            fieldMargin={fieldMargin}
                            cellSize={cellSize}
                        >
                            <FieldLayerContext.Provider value={FieldLayer.top}>
                                <Items {...itemsProps}/>
                            </FieldLayerContext.Provider>
                        </FieldSvg>

                        {renderCellsLayer("digits", topOffset, leftOffset, (cellState, cell) => {
                            const initialData = initialDigits?.[cell.top]?.[cell.left];

                            return !shouldSkipCellDigits(initialData, cellState) && <CellDigits
                                puzzle={puzzle}
                                data={cellState}
                                initialData={initialData}
                                size={1}
                                cellPosition={cell}
                                state={state}
                                isValidUserDigit={!enableConflictChecker || isValidUserDigit(cell, userDigits, items, puzzle, state)}
                            />;
                        }, true)}

                        {isReady && renderCellsLayer("mouse-handler", topOffset, leftOffset, (cellState, cellPosition) => <FieldCellMouseHandler
                            puzzle={puzzle}
                            state={state}
                            onStateChange={onStateChange}
                            cellPosition={cellPosition}
                            isDeleteSelectedCellsStroke={isDeleteSelectedCellsStroke}
                            onIsDeleteSelectedCellsStrokeChange={setIsDeleteSelectedCellsStroke}
                        />)}
                    </Absolute>
                )
            )}
        </Absolute>

        {loopHorizontally && <>
            <Absolute
                width={fieldMargin * cellSize}
                height={rect.height}
                style={{
                    background: "linear-gradient(to right, white, transparent)",
                }}
            />

            <Absolute
                left={rect.width - fieldMargin * cellSize}
                width={fieldMargin * cellSize}
                height={rect.height}
                style={{
                    background: "linear-gradient(to left, white, transparent)",
                }}
            />
        </>}

        {loopVertically && <>
            <Absolute
                width={rect.width}
                height={fieldMargin * cellSize}
                style={{
                    background: "linear-gradient(to bottom, white, transparent)",
                }}
            />

            <Absolute
                top={rect.height - fieldMargin * cellSize}
                width={rect.width}
                height={fieldMargin * cellSize}
                style={{
                    background: "linear-gradient(to top, white, transparent)",
                }}
            />
        </>}
    </Absolute>;
};

interface ItemsInOneRegionProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    items: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[];
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    cellSize: number;
}

const ItemsInOneRegion = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {items, puzzle, state, cellSize}: ItemsInOneRegionProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    return <>
        {items.map((item, index) => {
            if (isConstraint(item)) {
                const {component: Component, ...otherData} = asConstraint(item);

                return Component && <Component
                    key={index}
                    puzzle={puzzle}
                    gameState={state}
                    cellSize={cellSize}
                    {...otherData}
                />;
            } else {
                return (item as any)?.key
                    ? item as ReactNode
                    : <Fragment key={index}>{item as ReactNode}</Fragment>;
            }
        })}
    </>;
};

interface ItemsProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>
    extends ItemsInOneRegionProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    regionsWithSameCoordsTransformation?: Rect[];
}

const Items = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        regionsWithSameCoordsTransformation,
        ...otherProps
    }: ItemsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => <>
    {regionsWithSameCoordsTransformation?.map((rect, index) => <FieldRect
        key={`items-region-${index}`}
        puzzle={otherProps.puzzle}
        clip={true}
        {...rect}
    >
        <AutoSvg
            left={-rect.left}
            top={-rect.top}
            width={1}
            height={1}
        >
            <ItemsInOneRegion {...otherProps}/>
        </AutoSvg>
    </FieldRect>)}

    {!regionsWithSameCoordsTransformation && <ItemsInOneRegion {...otherProps}/>}
</>;
