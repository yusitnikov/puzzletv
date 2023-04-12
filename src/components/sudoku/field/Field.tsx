import {Absolute} from "../../layout/absolute/Absolute";
import {Rect, transformRect} from "../../../types/layout/Rect";
import {emptyPosition, Position} from "../../../types/layout/Position";
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
    gameStateNormalizeLoopOffset,
    gameStateSelectAllCells,
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
import {getAllowedCellWriteModeInfos, getCellWriteModeGestureHandler} from "../../../types/sudoku/CellWriteMode";
import {HashSet, PlainValueSet} from "../../../types/struct/Set";
import {PassThrough} from "../../layout/pass-through/PassThrough";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {useReadOnlySafeContext} from "../../../hooks/sudoku/useReadOnlySafeContext";
import {mergeGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {PencilmarksCheckerMode} from "../../../types/sudoku/PencilmarksCheckerMode";
import {resolvePuzzleInitialColors} from "../../../types/sudoku/PuzzleDefinition";
import {headerHeight, redColor} from "../../app/globals";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {useTranslate} from "../../../hooks/useTranslate";
import {FieldRegionsWithSameCoordsTransformation} from "./FieldRegionsWithSameCoordsTransformation";
import {FieldCellUserArea} from "./FieldCellUserArea";
import {TransformedRectGraphics} from "../../../contexts/TransformScaleContext";
import {getDefaultCellSelectionType} from "../../../types/sudoku/SudokuTypeManager";
import {getGestureHandlerProps, useGestureHandlers, useOutsideClick} from "../../../utils/gestures";
import {usePuzzleContainer} from "../../../contexts/PuzzleContainerContext";
import {doesGridRegionContainCell, GridRegion} from "../../../types/sudoku/GridRegion";
import {useAutoIncrementId} from "../../../hooks/useAutoIncrementId";

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
        allowMove,
        allowRotation,
        allowScale,
        fieldWrapperHandlesScale,
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
            cellWriteModeInfo: {isNoSelectionMode, applyToWholeField},
            animated,
        },
        fogDemoFieldStateHistory,
    } = state;

    const loopOffset = gameStateNormalizeLoopOffset(puzzle, animated.loopOffset);

    const {cells} = gameStateGetCurrentFieldState(state);

    const userDigits = useMemo(() => prepareGivenDigitsMapForConstraints(context, cells), [context, cells]);

    const {isAnyKeyDown} = useControlKeysState();

    const autoIncrementId = useAutoIncrementId();

    // region Pointer events
    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    // Handle outside click
    useOutsideClick(() => {
        if (!isAnyKeyDown) {
            onStateChange(gameStateClearSelectedCells);
        }
    });

    const fieldOuterRect = usePuzzleContainer()!;

    const cellWriteModesForGestures = getAllowedCellWriteModeInfos(puzzle, true);
    const createCellWriteModeGestureHandlers = (forField: boolean) => !isReady ? [] : cellWriteModesForGestures
        .filter(({applyToWholeField, disableCellHandlers}) => forField ? applyToWholeField : !disableCellHandlers)
        .map((cellWriteModeInfo) => getCellWriteModeGestureHandler(
            context,
            cellWriteModeInfo,
            isDeleteSelectedCellsStroke,
            setIsDeleteSelectedCellsStroke,
            {
                ...fieldOuterRect,
                top: fieldOuterRect.top + headerHeight,
            },
        ));
    const fieldGestureHandlers = useGestureHandlers(createCellWriteModeGestureHandlers(true));
    const cellGestureHandlers = useGestureHandlers(createCellWriteModeGestureHandlers(false));
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
        {left: leftOffset, top: topOffset}: Position,
        region?: GridRegion,
    ) => <>
        {cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
            const cellPosition: Position = {
                left: columnIndex,
                top: rowIndex,
            };

            if (region && !doesGridRegionContainCell(region, cellPosition)) {
                return null;
            }

            if (!fieldFitsWrapper && !customCellBounds && !allowScale && !allowRotation) {
                const finalTop = topOffset + loopOffset.top + rowIndex;
                if (finalTop <= -1 - fieldMargin || finalTop >= fieldSize.fieldSize + fieldMargin) {
                    return null;
                }

                const finalLeft = leftOffset + loopOffset.left + columnIndex;
                if (finalLeft <= -1 - fieldMargin || finalLeft >= fieldSize.fieldSize + fieldMargin) {
                    return null;
                }
            }

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
    </>;

    const initialColorsResolved = resolvePuzzleInitialColors(context);

    const selection = (offset: Position, region?: GridRegion) => !isNoSelectionMode && renderCellsLayer(
        "selection",
        (cellState, cellPosition) => {
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
        },
        offset,
        region,
    );

    return <>
        <Absolute
            {...rect}
            style={{
                backgroundColor: "white",
                overflow: loopHorizontally || loopVertically || allowMove || (allowScale && !fieldWrapperHandlesScale) ? "hidden" : undefined,
                pointerEvents: "all",
                cursor: applyToWholeField ? "pointer" : undefined,
            }}
            {...getGestureHandlerProps(fieldGestureHandlers)}
        >
            <FieldWrapper context={context}>
                <Absolute
                    left={loopOffset.left * cellSize}
                    top={loopOffset.top * cellSize}
                    width={rect.width}
                    height={rect.height}
                    angle={animated.angle}
                    scale={fieldWrapperHandlesScale ? 1 : animated.scale}
                    fitParent={fieldFitsWrapper}
                >
                    <FieldSvg context={readOnlySafeContext}>
                        {(offset) => <FieldRegionsWithSameCoordsTransformation context={readOnlySafeContext}>
                            {(region, regionIndex = 0) => {
                                const shadowFilterId = `field-shadow-${autoIncrementId}-${offset.top}-${offset.left}-${regionIndex}`;

                                return <>
                                    <filter id={shadowFilterId} colorInterpolationFilters={"sRGB"}>
                                        <feDropShadow dx={0} dy={0} stdDeviation={0.05} floodColor={"#fff"} floodOpacity={1}/>
                                    </filter>

                                    <g filter={`url(#${shadowFilterId})`}>
                                        <FieldLayerContext.Provider value={FieldLayer.beforeBackground}>
                                            <Items {...itemsProps}/>
                                        </FieldLayerContext.Provider>
                                    </g>

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
                                    }, offset, region)}

                                    <g filter={`url(#${shadowFilterId})`}>
                                        <FieldLayerContext.Provider value={FieldLayer.beforeSelection}>
                                            <Items {...itemsProps}/>
                                        </FieldLayerContext.Provider>
                                    </g>

                                    {!prioritizeSelection && selection(offset, region)}

                                    <g filter={`url(#${shadowFilterId})`}>
                                        <FieldLayerContext.Provider value={FieldLayer.regular}>
                                            <Items {...itemsProps}/>
                                        </FieldLayerContext.Provider>
                                    </g>

                                    {prioritizeSelection && selection(offset, region)}

                                    <FieldLayerContext.Provider value={FieldLayer.lines}>
                                        <Items {...itemsProps}/>
                                    </FieldLayerContext.Provider>

                                    <FieldLayerContext.Provider value={FieldLayer.givenUserLines}>
                                        <Items {...itemsProps}/>
                                    </FieldLayerContext.Provider>

                                    <FieldLayerContext.Provider value={FieldLayer.newUserLines}>
                                        <Items {...itemsProps}/>
                                    </FieldLayerContext.Provider>

                                    <FieldLayerContext.Provider value={FieldLayer.top}>
                                        <Items {...itemsProps}/>
                                    </FieldLayerContext.Provider>

                                    <g filter={`url(#${shadowFilterId})`}>
                                        {renderCellsLayer("digits", (cellState, cell) => {
                                            const initialData = initialDigits?.[cell.top]?.[cell.left] || stateInitialDigits?.[cell.top]?.[cell.left];
                                            const cellExcludedDigits = excludedDigits[cell.top][cell.left];

                                            return !shouldSkipCellDigits(initialData, cellExcludedDigits, cellState) &&
                                                <CellDigits
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
                                        }, offset, region)}
                                    </g>

                                    {isReady && renderCellsLayer(
                                        "mouse-handler",
                                        (cellState, cellPosition) => <FieldCellMouseHandler
                                            context={readOnlySafeContext}
                                            cellPosition={cellPosition}
                                            handlers={cellGestureHandlers}
                                        />,
                                        offset,
                                        region
                                    )}
                                </>;
                            }}
                        </FieldRegionsWithSameCoordsTransformation>}
                    </FieldSvg>
                </Absolute>

                {loopHorizontally && fieldMargin && <>
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

                {loopVertically && fieldMargin && <>
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
) => <>
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
</>;
