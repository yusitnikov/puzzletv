import {Absolute} from "../../layout/absolute/Absolute";
import {Rect, transformRect} from "../../../types/layout/Rect";
import {emptyPosition, isSamePosition, Position} from "../../../types/layout/Position";
import {useEventListener} from "../../../hooks/useEventListener";
import {useControlKeysState} from "../../../hooks/useControlKeysState";
import React, {Fragment, ReactNode, useMemo, useState} from "react";
import {CellState} from "../../../types/sudoku/CellState";
import {CellBackground} from "../cell/CellBackground";
import {CellSelection, CellSelectionColor} from "../cell/CellSelection";
import {CellDigits, shouldSkipCellDigits} from "../cell/CellDigits";
import {FieldSvg} from "./FieldSvg";
import {
    gameStateApplyArrowToSelectedCells,
    gameStateClearSelectedCells,
    gameStateGetCurrentFieldState,
    gameStateHandleCellDoubleClick,
    gameStateNormalizeLoopOffset,
    gameStateSelectAllCells,
    gameStateSetSelectedCells,
    gameStateToggleSelectedCells,
} from "../../../types/sudoku/GameState";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {FieldLayerContext} from "../../../contexts/FieldLayerContext";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {
    Constraint,
    getAllPuzzleConstraints,
    isValidUserDigit,
    prepareGivenDigitsMapForConstraints
} from "../../../types/sudoku/Constraint";
import {FieldCellMouseHandler} from "./FieldCellMouseHandler";
import {getAllowedCellWriteModeInfos} from "../../../types/sudoku/CellWriteMode";
import {HashSet, PlainValueSet} from "../../../types/struct/Set";
import {PassThrough} from "../../layout/pass-through/PassThrough";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {useReadOnlySafeContext} from "../../../hooks/sudoku/useReadOnlySafeContext";
import {mergeGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {PencilmarksCheckerMode} from "../../../types/sudoku/PencilmarksCheckerMode";
import {resolvePuzzleInitialColors} from "../../../types/sudoku/PuzzleDefinition";
import {redColor} from "../../app/globals";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {useTranslate} from "../../../hooks/useTranslate";
import {FieldRegionsWithSameCoordsTransformation} from "./FieldRegionsWithSameCoordsTransformation";
import {FieldCellUserArea} from "./FieldCellUserArea";
import {TransformedRectGraphics} from "../../../contexts/TransformScaleContext";
import {getDefaultCellSelectionType} from "../../../types/sudoku/SudokuTypeManager";
import {
    GestureFinishReason,
    GestureHandler,
    GestureIsValidProps,
    useGestureHandlers,
    useOutsideClick
} from "../../../utils/gestures";
import {
    getCurrentCellWriteModeInfoByGestureExtraData,
    isCellGestureExtraData,
} from "../../../types/sudoku/CellGestureExtraData";

export interface FieldProps<CellType, ExType = {}, ProcessedExType = {}> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
    rect: Rect;
}

export const Field = <CellType, ExType = {}, ProcessedExType = {}>(
    {
        context,
        rect,
    }: FieldProps<CellType, ExType, ProcessedExType>
) => {
    const translate = useTranslate();

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
        allowOverridingInitialColors = false,
        loopHorizontally,
        loopVertically,
        forceEnableConflictChecker,
        prioritizeSelection,
    } = puzzle;

    const {
        getCellTypeProps,
        getCellSelectionType = state.highlightSeenCells ? getDefaultCellSelectionType : undefined,
        disableConflictChecker,
        disableArrowLetterShortcuts,
    } = typeManager;

    const items = useMemo(() => getAllPuzzleConstraints(context), [context]);

    const itemsProps: ItemsProps<CellType, ExType, ProcessedExType> = {
        context: readOnlySafeContext,
        items,
    };

    const {
        selectedCells,
        enableConflictChecker,
        pencilmarksCheckerMode,
        initialDigits: stateInitialDigits,
        excludedDigits,
        isShowingSettings,
        processed: {
            isReady,
            cellWriteModeInfo: {isNoSelectionMode},
            animated,
        },
        fogDemoFieldStateHistory,
    } = state;

    const loopOffset = gameStateNormalizeLoopOffset(puzzle, animated.loopOffset);

    const {cells} = gameStateGetCurrentFieldState(state);

    const userDigits = useMemo(() => prepareGivenDigitsMapForConstraints(context, cells), [context, cells]);

    const {isAnyKeyDown} = useControlKeysState();

    // region Pointer events
    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    // Handle outside click
    useOutsideClick(() => {
        if (!isAnyKeyDown) {
            onStateChange(gameStateClearSelectedCells);
        }
    });

    const cellWriteModeGestureHandlers = useGestureHandlers(getAllowedCellWriteModeInfos(puzzle, true).map(
        (
            {
                mode,
                isValidGesture = (isCurrentCellWriteMode: boolean, {gesture: {pointers}}: GestureIsValidProps) =>
                    isCurrentCellWriteMode && pointers.length === 1,
                isNoSelectionMode,
                onMove,
                onCornerClick,
                onCornerEnter,
                onGestureEnd,
                handlesRightMouseClick,
            }
        ): GestureHandler => {
            const common: Pick<GestureHandler, "isValidGesture"> = {
                isValidGesture: (props) => isValidGesture(
                    getCurrentCellWriteModeInfoByGestureExtraData(context, props.extraData).mode === mode,
                    props,
                    context,
                ),
            };

            if (!isNoSelectionMode) {
                return {
                    contextId: "cell-selection",
                    ...common,
                    onStart: ({extraData, event}) => {
                        const {ctrlKey, metaKey, shiftKey} = event;
                        const isMultiSelection = ctrlKey || metaKey || shiftKey || state.isMultiSelection;

                        if (!isCellGestureExtraData(extraData)) {
                            return;
                        }

                        const cellPosition = extraData.cell;

                        setIsDeleteSelectedCellsStroke(isMultiSelection && selectedCells.contains(cellPosition));
                        onStateChange(
                            gameState => isMultiSelection
                                ? gameStateToggleSelectedCells(gameState, [cellPosition])
                                : gameStateSetSelectedCells(gameState, [cellPosition])
                        );
                    },
                    onContinue: ({prevData, currentData}) => {
                        const [prevCell, currentCell] = [prevData, currentData].map(
                            ({extraData}) => isCellGestureExtraData(extraData) && !extraData.skipEnter ? extraData.cell : undefined
                        );
                        if (currentCell && (!prevCell || !isSamePosition(prevCell, currentCell))) {
                            onStateChange(gameState => gameStateToggleSelectedCells(gameState, [currentCell], !isDeleteSelectedCellsStroke));
                        }
                    },
                    onEnd: ({reason}) => {
                        if (reason === GestureFinishReason.startNewGesture) {
                            onStateChange(gameStateClearSelectedCells);
                        }
                    },
                    onDoubleClick: ({extraData, event: {ctrlKey, metaKey, shiftKey}}) => {
                        if (!isCellGestureExtraData(extraData) || getCurrentCellWriteModeInfoByGestureExtraData(context, extraData).mode !== mode) {
                            return false;
                        }

                        onStateChange(gameStateHandleCellDoubleClick(
                            context,
                            extraData.cell,
                            ctrlKey || metaKey || shiftKey
                        ));
                        return true;
                    },
                }
            }

            return {
                contextId: `cell-write-mode-${mode}`,
                ...common,
                onStart: ({extraData, event: {button}}) => {
                    if (isCellGestureExtraData(extraData)) {
                        onCornerClick?.(context, extraData.exact, !!button);
                    }
                },
                onContinue: (props) => {
                    const {prevData: {extraData: prevData}, currentData: {extraData: currentData}} = props;

                    if (
                        isCellGestureExtraData(currentData) &&
                        (!isCellGestureExtraData(prevData) || JSON.stringify(prevData.exact) !== JSON.stringify(currentData.exact))
                    ) {
                        onCornerEnter?.(context, currentData.exact);
                    }

                    onMove?.(props, context);
                },
                onEnd: (props) => onGestureEnd?.(props, context),
                onContextMenu: ({event, extraData}) => {
                    if (handlesRightMouseClick && getCurrentCellWriteModeInfoByGestureExtraData(context, extraData).mode === mode) {
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
            };
        }
    ));
    // endregion

    // Handle arrows
    useEventListener(window, "keydown", (ev) => {
        if (isShowingSettings) {
            return;
        }

        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

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
                if (!disableArrowLetterShortcuts) {
                    handleArrow(-1, 0, false);
                }
                break;
            case "KeyD":
                if (!disableArrowLetterShortcuts) {
                    handleArrow(1, 0, false);
                }
                break;
            case "KeyW":
                if (!disableArrowLetterShortcuts) {
                    handleArrow(0, -1, false);
                }
                break;
            case "KeyS":
                if (!disableArrowLetterShortcuts) {
                    handleArrow(0, 1, false);
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

    const renderCellsLayer = (
        keyPrefix: string,
        renderer: (cellState: CellState<CellType>, cellPosition: Position) => ReactNode,
        {useShadow = false}: {useShadow?: boolean} = {}
    ) =>
        <FieldSvg context={readOnlySafeContext} useShadow={useShadow}>
            {({left: leftOffset, top: topOffset}) => <FieldRegionsWithSameCoordsTransformation context={readOnlySafeContext}>
                {cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
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

                    if (getCellTypeProps?.(cellPosition, puzzle)?.isVisible === false) {
                        return null;
                    }

                    const content = renderer(cellState, cellPosition);
                    if (!content) {
                        return null;
                    }

                    const key = `cell-${keyPrefix}-${rowIndex}-${columnIndex}`;
                    return customCellBounds
                        ? <Fragment key={key}>{content}</Fragment>
                        : <AutoSvg
                            key={key}
                            {...cellPosition}
                            width={1}
                            height={1}
                        >
                            {content}
                        </AutoSvg>;
                }))}
            </FieldRegionsWithSameCoordsTransformation>}
        </FieldSvg>;

    const initialColorsResolved = resolvePuzzleInitialColors(context);

    const selection = !isNoSelectionMode && renderCellsLayer("selection", (cellState, cellPosition) => {
        let color = "";
        let width = 1;

        if (selectedCells.contains(cellPosition)) {
            color = selectedCells.last()?.left === cellPosition.left && selectedCells.last()?.top === cellPosition.top
                ? CellSelectionColor.mainCurrent
                : CellSelectionColor.mainPrevious;
        } else {
            const customSelection = getCellSelectionType?.(cellPosition, context);
            if (customSelection) {
                color = customSelection.color;
                width = customSelection.strokeWidth;
            }
        }

        return !!color && <CellSelection
            context={readOnlySafeContext}
            cellPosition={cellPosition}
            color={color}
            strokeWidth={width}
        />;
    });

    return <>
        <Absolute
            {...rect}
            angle={animated.angle}
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
                            ? (colors?.size ? colors : new PlainValueSet(initialCellColors || []))
                            : (initialCellColors ? new PlainValueSet(initialCellColors) : colors);

                        return !!finalColors?.size && <CellBackground
                            context={readOnlySafeContext}
                            cellPosition={cellPosition}
                            colors={finalColors}
                            noOpacity={!!initialCellColors?.length}
                        />;
                    })}

                    <FieldSvg context={readOnlySafeContext}>
                        <FieldLayerContext.Provider value={FieldLayer.beforeSelection}>
                            <Items {...itemsProps}/>
                        </FieldLayerContext.Provider>
                    </FieldSvg>

                    {!prioritizeSelection && selection}

                    <FieldSvg context={readOnlySafeContext}>
                        <FieldLayerContext.Provider value={FieldLayer.regular}>
                            <Items {...itemsProps}/>
                        </FieldLayerContext.Provider>
                    </FieldSvg>

                    {prioritizeSelection && selection}

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
                            isValidUserDigit={
                                (digit) =>
                                    !(enableConflictChecker || forceEnableConflictChecker) ||
                                    disableConflictChecker ||
                                    (digit !== undefined && pencilmarksCheckerMode === PencilmarksCheckerMode.Off) ||
                                    isValidUserDigit(
                                        cell,
                                        digit === undefined
                                            ? userDigits
                                            : mergeGivenDigitsMaps(userDigits, {[cell.top]: {[cell.left]: digit}}),
                                        items,
                                        readOnlySafeContext,
                                        false,
                                        digit !== undefined,
                                        digit !== undefined && pencilmarksCheckerMode === PencilmarksCheckerMode.CheckObvious
                                    )
                            }
                        />;
                    }, {useShadow: true})}

                    {isReady && renderCellsLayer("mouse-handler", (cellState, cellPosition) => <FieldCellMouseHandler
                        context={readOnlySafeContext}
                        cellPosition={cellPosition}
                        handlers={cellWriteModeGestureHandlers}
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
        </Absolute>

        {fogDemoFieldStateHistory && <Absolute {...rect} style={{
            opacity: 0.2,
            color: redColor,
            textAlign: "center",
            verticalAlign: "middle",
            fontSize: rect.width * 0.08,
            padding: "0.5em",
            boxSizing: "border-box",
        }}>
            {translate({
                [LanguageCode.en]: "No fog reveal mode on!",
                [LanguageCode.ru]: "Режим без раскрытия тумана включен!",
            })}
        </Absolute>}
    </>;
};

interface ItemsProps<CellType, ExType = {}, ProcessedExType = {}> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
    items: Constraint<CellType, any, ExType, ProcessedExType>[];
}

const Items = <CellType, ExType = {}, ProcessedExType = {}>(
    {context, items}: ItemsProps<CellType, ExType, ProcessedExType>
) => <FieldRegionsWithSameCoordsTransformation context={context}>
    {items.map(({component: Component, cells, renderSingleCellInUserArea, ...otherData}, index) => {
        if (!Component) {
            return null;
        }

        if (renderSingleCellInUserArea && cells.length === 1) {
            const position = cells[0];

            if (position.top % 1 === 0 && position.left % 1 === 0) {
                const processedPosition = context.puzzle.typeManager.processCellDataPosition?.(
                    context.puzzle,
                    {...position, angle: 0},
                    new HashSet<CellType>(),
                    0,
                    () => undefined,
                    position,
                    context.state
                );

                return <AutoSvg key={index} {...(context.puzzle.customCellBounds ? {} : position)}>
                    <FieldCellUserArea context={context} cellPosition={position}>
                        <AutoSvg top={0.5} left={0.5} angle={processedPosition?.angle}>
                            <AutoSvg top={-0.5} left={-0.5}>
                                <Component
                                    context={context}
                                    cells={[emptyPosition]}
                                    {...otherData}
                                />
                            </AutoSvg>
                        </AutoSvg>
                    </FieldCellUserArea>
                </AutoSvg>;
            }
        }

        if (renderSingleCellInUserArea && cells.length === 2) {
            const [cell1, cell2] = cells.map(({top, left}) => {
                const cellInfo = context.cellsIndex.allCells[top]?.[left];
                return cellInfo
                    ? {...cellInfo.center, radius: cellInfo.bounds.userArea.width / 2}
                    : {left: left + 0.5, top: top + 0.5, radius: 0.5};
            });
            const centerPoint = {
                top: (cell1.top + cell2.top) / 2,
                left: (cell1.left + cell2.left) / 2,
                radius: (cell1.radius + cell2.radius) / 2,
            };
            const centerRect: Rect = {
                top: centerPoint.top - centerPoint.radius,
                left: centerPoint.left - centerPoint.radius,
                width: centerPoint.radius * 2,
                height: centerPoint.radius * 2,
            };
            return <TransformedRectGraphics key={index} rect={transformRect(centerRect)}>
                <Component
                    context={context}
                    cells={[emptyPosition, emptyPosition]}
                    {...otherData}
                />
            </TransformedRectGraphics>
        }

        return <Component
            key={index}
            context={context}
            cells={cells}
            {...otherData}
        />;
    })}
</FieldRegionsWithSameCoordsTransformation>;
