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
    gameStateClearSelectedCells,
    gameStateGetCurrentFieldState,
    gameStateNormalizeLoopOffset,
    gameStateResetCurrentMultiLine,
    gameStateSelectAllCells,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
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
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {Set} from "../../../types/struct/Set";
import {PassThrough} from "../../layout/pass-through/PassThrough";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {useReadOnlySafeContext} from "../../../hooks/sudoku/useReadOnlySafeContext";
import {applyCurrentMultiLineAction} from "../../../types/sudoku/GameStateAction";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {CellColor} from "../../../types/sudoku/CellColor";

export interface FieldProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    rect: Rect;
}

export const Field = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        context,
        rect,
    }: FieldProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const readOnlySafeContext = useReadOnlySafeContext(context);

    const {puzzle, state, onStateChange, cellSize} = readOnlySafeContext;

    const {
        typeManager,
        fieldSize,
        fieldMargin = 0,
        fieldWrapperComponent: FieldWrapper = PassThrough,
        fieldFitsWrapper,
        customCellBounds,
        initialDigits = {},
        initialColors = {},
        allowOverridingInitialColors = false,
        loopHorizontally,
        loopVertically,
    } = puzzle;

    const {
        isValidCell = () => true,
        getRegionsWithSameCoordsTransformation,
        getCellSelectionType,
        disableConflictChecker,
    } = typeManager;

    const items = useMemo(() => getAllPuzzleConstraintsAndComponents(context), [context]);

    const regionsWithSameCoordsTransformation = getRegionsWithSameCoordsTransformation?.(puzzle);

    const itemsProps: ItemsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> = {
        context: readOnlySafeContext,
        items,
        regionsWithSameCoordsTransformation,
    };

    const {
        selectedCells,
        isReady,
        cellWriteMode,
        cellWriteModeInfo: {isNoSelectionMode},
        enableConflictChecker,
        loopOffset,
        initialDigits: stateInitialDigits,
        excludedDigits,
        isShowingSettings,
    } = state;
    const {cells} = gameStateGetCurrentFieldState(state);

    const userDigits = useMemo(() => prepareGivenDigitsMapForConstraints(context, cells), [context, cells]);

    const {isAnyKeyDown} = useControlKeysState();

    // region Pointer events
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
        onStateChange(applyCurrentMultiLineAction());

        setDragStart(undefined);
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
    // endregion

    // Handle arrows
    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

        const {code, ctrlKey, shiftKey} = ev;

        // Use the key modifiers from the event - they are always up-to-date
        const isAnyKeyDown = ctrlKey || shiftKey;

        const handleArrow = (xDirection: number, yDirection: number, isMainKeyboard = true) => (isMainKeyboard || !ctrlKey) && onStateChange(
            state => gameStateApplyArrowToSelectedCells({...readOnlySafeContext, state}, xDirection, yDirection, isAnyKeyDown, isMainKeyboard)
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
        renderer: (cellState: CellState<CellType>, cellPosition: Position) => ReactNode,
        useShadow = false
    ) =>
        <FieldSvg context={readOnlySafeContext} useShadow={useShadow}>
            {({left: leftOffset, top: topOffset}) => cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
                if (!fieldFitsWrapper && !customCellBounds) {
                    const finalTop = topOffset + loopOffset.top + rowIndex;
                    if (finalTop <= -1 - fieldMargin || finalTop >= fieldSize.fieldSize + fieldMargin) {
                        return null;
                    }

                    const finalLeft = leftOffset + loopOffset.left + columnIndex;
                    if (finalLeft <= -1 - fieldMargin || finalLeft >= fieldSize.fieldSize + fieldMargin) {
                        return null;
                    }
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
                    context={readOnlySafeContext}
                    {...cellPosition}
                >
                    {content}
                </FieldRect>;
            }))}
        </FieldSvg>;

    const initialColorsResolved = typeof initialColors === "function"
        ? initialColors(context)
        : initialColors as GivenDigitsMap<CellColor[]>;

    return <Absolute
        {...rect}
        angle={typeManager.getFieldAngle?.(state)}
        style={{
            backgroundColor: "white",
            overflow: loopHorizontally || loopVertically ? "hidden" : undefined,
        }}
    >
        <FieldWrapper context={context}>
            <Absolute
                left={loopOffset.left * cellSize}
                top={loopOffset.top * cellSize}
                fitParent={fieldFitsWrapper}
            >
                <FieldSvg context={readOnlySafeContext}>
                    <FieldLayerContext.Provider value={FieldLayer.beforeBackground}>
                        <Items {...itemsProps}/>
                    </FieldLayerContext.Provider>
                </FieldSvg>

                {renderCellsLayer("background", ({colors}, cellPosition) => {
                    const initialCellColors = initialColorsResolved[cellPosition.top]?.[cellPosition.left];
                    const finalColors = allowOverridingInitialColors
                        ? (colors?.size ? colors : new Set(initialCellColors || []))
                        : (initialCellColors ? new Set(initialCellColors) : colors);

                    return !!finalColors?.size && <CellBackground
                        context={readOnlySafeContext}
                        cellPosition={cellPosition}
                        colors={finalColors}
                    />;
                })}

                <FieldSvg context={readOnlySafeContext}>
                    <FieldLayerContext.Provider value={FieldLayer.beforeSelection}>
                        <Items {...itemsProps}/>
                    </FieldLayerContext.Provider>
                </FieldSvg>

                {!isNoSelectionMode && renderCellsLayer("selection", (cellState, cellPosition) => {
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
                        context={readOnlySafeContext}
                        cellPosition={cellPosition}
                        size={cellSize}
                        color={color}
                        strokeWidth={width}
                    />;
                })}

                <FieldSvg context={readOnlySafeContext}>
                    <FieldLayerContext.Provider value={FieldLayer.regular}>
                        <Items {...itemsProps}/>
                    </FieldLayerContext.Provider>
                </FieldSvg>

                <FieldSvg context={readOnlySafeContext} useShadow={false}>
                    <FieldLayerContext.Provider value={FieldLayer.lines}>
                        <Items {...itemsProps}/>
                    </FieldLayerContext.Provider>
                </FieldSvg>

                <FieldSvg context={readOnlySafeContext} useShadow={false}>
                    <FieldLayerContext.Provider value={FieldLayer.givenUserLines}>
                        <Items {...itemsProps}/>
                    </FieldLayerContext.Provider>
                </FieldSvg>

                <FieldSvg context={readOnlySafeContext} useShadow={false}>
                    <FieldLayerContext.Provider value={FieldLayer.newUserLines}>
                        <Items {...itemsProps}/>
                    </FieldLayerContext.Provider>
                </FieldSvg>

                <FieldSvg context={readOnlySafeContext} useShadow={false}>
                    <FieldLayerContext.Provider value={FieldLayer.top}>
                        <Items {...itemsProps}/>
                    </FieldLayerContext.Provider>
                </FieldSvg>

                {renderCellsLayer("digits", (cellState, cell) => {
                    const initialData = initialDigits?.[cell.top]?.[cell.left] || stateInitialDigits?.[cell.top]?.[cell.left];
                    const cellExcludedDigits = excludedDigits[cell.top][cell.left];

                    return !shouldSkipCellDigits(initialData, cellExcludedDigits, cellState) && <CellDigits
                        context={readOnlySafeContext}
                        data={cellState}
                        initialData={initialData}
                        excludedDigits={cellExcludedDigits}
                        size={1}
                        cellPosition={cell}
                        isValidUserDigit={!enableConflictChecker || disableConflictChecker || isValidUserDigit(cell, userDigits, items, puzzle, state)}
                    />;
                }, true)}

                {isReady && renderCellsLayer("mouse-handler", (cellState, cellPosition) => <FieldCellMouseHandler
                    context={readOnlySafeContext}
                    cellPosition={cellPosition}
                    isDeleteSelectedCellsStroke={isDeleteSelectedCellsStroke}
                    onIsDeleteSelectedCellsStrokeChange={setIsDeleteSelectedCellsStroke}
                />)}
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
        </FieldWrapper>
    </Absolute>;
};

interface ItemsInOneRegionProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    items: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[];
}

const ItemsInOneRegion = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {context, items}: ItemsInOneRegionProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    return <>
        {items.map((item, index) => {
            if (isConstraint(item)) {
                const {component: Component, ...otherData} = asConstraint(item);

                return Component && <Component
                    key={index}
                    context={context}
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
        context={otherProps.context}
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
