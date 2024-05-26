import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {useEventListener} from "../../../hooks/useEventListener";
import {controlKeysState} from "../../../hooks/useControlKeysState";
import React, {ReactElement, ReactNode, useState} from "react";
import {FieldCellBackground} from "../cell/CellBackground";
import {CellSelectionByCoords} from "../cell/CellSelection";
import {FieldCellDigits} from "../cell/CellDigits";
import {FieldSvg} from "./FieldSvg";
import {
    gameStateApplyArrowToSelectedCells,
    gameStateClearSelectedCells,
    gameStateSelectAllCells,
} from "../../../types/sudoku/GameState";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {FieldCellMouseHandler} from "./FieldCellMouseHandler";
import {getCellWriteModeGestureHandler} from "../../../types/sudoku/CellWriteModeInfo";
import {PassThrough} from "../../layout/pass-through/PassThrough";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {headerHeight} from "../../app/globals";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {useTranslate} from "../../../hooks/useTranslate";
import {FieldRegionsWithSameCoordsTransformation} from "./FieldRegionsWithSameCoordsTransformation";
import {getGestureHandlerProps, useGestureHandlers, useOutsideClick} from "../../../utils/gestures";
import {usePuzzleContainer} from "../../../contexts/PuzzleContainerContext";
import {GridRegion} from "../../../types/sudoku/GridRegion";
import {useAutoIncrementId} from "../../../hooks/useAutoIncrementId";
import {FieldItems, FieldItemsProps} from "./FieldItems";
import {FieldLoop} from "./FieldLoop";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {settings} from "../../../types/layout/Settings";
import {profiler} from "../../../utils/profiler";
import {FieldCellsLayer} from "./FieldCellsLayer";
import {FieldFireworks} from "./FieldFireworks";

export interface FieldProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    rect: Rect;
}

export const Field = observer(function Field<T extends AnyPTM>({context, rect}: FieldProps<T>) {
    profiler.trace();

    const translate = useTranslate();

    const {
        readOnlySafeContext,
        puzzle,
        fogDemoFieldStateHistory,
        cellWriteModeInfo: {isNoSelectionMode, applyToWholeField},
        cellSize,
        isReady,
    } = context;

    const {
        typeManager,
        fieldMargin = 0,
        fieldWrapperComponent: FieldWrapper = PassThrough,
        fieldFitsWrapper,
        loopHorizontally,
        loopVertically,
        prioritizeSelection,
    } = puzzle;

    const {
        disableArrowLetterShortcuts,
        allowMove,
        allowScale,
        fieldWrapperHandlesScale,
        gridBackgroundColor = "#fff",
        regionBackgroundColor,
        fieldControlsComponent: FieldControls,
    } = typeManager;

    const autoIncrementId = useAutoIncrementId();

    // region Pointer events
    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    const fieldOuterRect = usePuzzleContainer()!;

    const createCellWriteModeGestureHandlers = (forField: boolean) => !isReady ? [] : context.allCellWriteModeInfos
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

    // Handle outside click
    useOutsideClick(() =>  {
        if (!controlKeysState.isAnyKeyDown) {
            context.readOnlySafeContext.onStateChange(gameStateClearSelectedCells);
        }

        for (const {onOutsideClick} of context.allCellWriteModeInfos) {
            onOutsideClick?.(context);
        }
    });
    // endregion

    // Handle arrows
    useEventListener(window, "keydown", (ev) => {
        if (settings.isOpened) {
            return;
        }

        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        // Use the key modifiers from the event - they are always up-to-date
        const isAnyKeyDown = ctrlKey || shiftKey;

        const handleArrow = (xDirection: number, yDirection: number, isMainKeyboard = true) => (isMainKeyboard || !ctrlKey) && readOnlySafeContext.onStateChange(
            (context) => gameStateApplyArrowToSelectedCells(context, xDirection, yDirection, isAnyKeyDown, isMainKeyboard)
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
                    readOnlySafeContext.onStateChange(gameStateSelectAllCells);
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
                    readOnlySafeContext.onStateChange(gameStateClearSelectedCells);
                    ev.preventDefault();
                }
                break;
        }
    });

    const renderCellsLayer = (
        renderer: (top: number, left: number) => ReactNode,
        region?: GridRegion,
        isInteractionMode = false,
    ) => <FieldLoop context={readOnlySafeContext}>
        {(topOffset, leftOffset) => <FieldCellsLayer
            context={context}
            topOffset={topOffset}
            leftOffset={leftOffset}
            region={region}
            isInteractionMode={isInteractionMode}
        >
            {renderer}
        </FieldCellsLayer>}
    </FieldLoop>;

    const selection = (region?: GridRegion) => !isNoSelectionMode && <g data-layer="selection">
        {renderCellsLayer(
            (top, left) => <CellSelectionByCoords
                context={context}
                top={top}
                left={left}
            />,
            region,
        )}
    </g>;

    const applyShadowFilter = !settings.simplifiedGraphics.get();
    const shadowFilterId = `field-shadow-${autoIncrementId}`;
    const shadowFilterStr = applyShadowFilter ? `url(#${shadowFilterId})` : undefined;

    return <>
        <Absolute
            {...rect}
            style={{
                backgroundColor: gridBackgroundColor,
                overflow: loopHorizontally || loopVertically || allowMove || (allowScale && !fieldWrapperHandlesScale) ? "hidden" : undefined,
                pointerEvents: "all",
                cursor: applyToWholeField ? "pointer" : undefined,
            }}
            {...getGestureHandlerProps(fieldGestureHandlers)}
        >
            <FieldWrapper context={context}>
                <Absolute
                    left={context.animatedNormalizedLeft * cellSize}
                    top={context.animatedNormalizedTop * cellSize}
                    width={rect.width}
                    height={rect.height}
                    angle={context.animatedAngle}
                    scale={fieldWrapperHandlesScale ? 1 : context.animatedScale}
                    fitParent={fieldFitsWrapper}
                >
                    <FieldSvg context={readOnlySafeContext}>
                        {applyShadowFilter && <filter id={shadowFilterId} colorInterpolationFilters={"sRGB"}>
                            <feDropShadow dx={0} dy={0} stdDeviation={0.02} floodColor={"#fff"} floodOpacity={1}/>
                        </filter>}

                        <FieldRegionsWithSameCoordsTransformation
                            context={readOnlySafeContext}
                            regionNoClipChildren={(region, regionIndex) => <g data-layer="items-no-clip">
                                <FieldItems
                                    layer={FieldLayer.noClip}
                                    context={readOnlySafeContext}
                                    region={region}
                                    regionIndex={regionIndex}
                                />
                            </g>}
                        >
                            {(region, regionIndex) => {
                                const itemsProps: Omit<FieldItemsProps<T>, "layer"> = {
                                    context,
                                    region,
                                    regionIndex,
                                };

                                const {backgroundColor = regionBackgroundColor} = region ?? {};

                                return <>
                                    {region && backgroundColor && <rect
                                        x={region.left}
                                        y={region.top}
                                        width={region.width}
                                        height={region.height}
                                        fill={backgroundColor}
                                        strokeWidth={0}
                                        stroke={"none"}
                                    />}

                                    <g data-layer="items-before-background" filter={shadowFilterStr}>
                                        <FieldItems layer={FieldLayer.beforeBackground} {...itemsProps}/>
                                    </g>

                                    <g data-layer="background">
                                        {renderCellsLayer((top, left) => <FieldCellBackground
                                            context={context}
                                            top={top}
                                            left={left}
                                        />, region)}
                                    </g>

                                    <g data-layer="items-before-selection" filter={shadowFilterStr}>
                                        <FieldItems layer={FieldLayer.beforeSelection} {...itemsProps}/>
                                    </g>

                                    {!prioritizeSelection && selection(region)}

                                    <g data-layer="items-regular" filter={shadowFilterStr}>
                                        <FieldItems layer={FieldLayer.regular} {...itemsProps}/>
                                    </g>

                                    {prioritizeSelection && selection(region)}

                                    <g data-layer="items-lines">
                                        <FieldItems layer={FieldLayer.lines} {...itemsProps}/>
                                    </g>

                                    <g data-layer="items-after-lines">
                                        <FieldItems layer={FieldLayer.afterLines} {...itemsProps}/>
                                    </g>

                                    <g data-layer="items-given-user-lines">
                                        <FieldItems layer={FieldLayer.givenUserLines} {...itemsProps}/>
                                    </g>

                                    <g data-layer="items-new-user-lines">
                                        <FieldItems layer={FieldLayer.newUserLines} {...itemsProps}/>
                                    </g>

                                    <g data-layer="items-top">
                                        <FieldItems layer={FieldLayer.top} {...itemsProps}/>
                                    </g>

                                    <g data-layer="digits" filter={shadowFilterStr}>
                                        {renderCellsLayer((top, left) => <FieldCellDigits
                                            context={context}
                                            top={top}
                                            left={left}
                                        />, region)}
                                    </g>

                                    {isReady && !region?.noInteraction && <g data-layer="mouse-handler">
                                        {renderCellsLayer(
                                            (top, left) => <FieldCellMouseHandler
                                                context={readOnlySafeContext}
                                                top={top}
                                                left={left}
                                                regionIndex={regionIndex}
                                                handlers={cellGestureHandlers}
                                            />,
                                            region,
                                            true,
                                        )}
                                    </g>}

                                    <g data-layer="items-interactive">
                                        <FieldItems layer={FieldLayer.interactive} {...itemsProps}/>
                                    </g>
                                </>;
                            }}
                        </FieldRegionsWithSameCoordsTransformation>
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

            <Absolute
                top={fieldMargin * cellSize}
                left={fieldMargin * cellSize}
                width={rect.width - 2 * fieldMargin * cellSize}
                height={rect.width - 2 * fieldMargin * cellSize}
            >
                {FieldControls && <FieldControls context={context}/>}

                <FieldFireworks/>
            </Absolute>
        </Absolute>

        {fogDemoFieldStateHistory && <Absolute {...rect} style={{
            opacity: 0.2,
            color: "#f00",
            textAlign: "center",
            verticalAlign: "middle",
            fontSize: rect.width * 0.08,
            padding: "0.5em",
            boxSizing: "border-box",
        }}>
            {translate({
                [LanguageCode.en]: "No fog reveal mode on!",
                [LanguageCode.ru]: "Режим без раскрытия тумана включен!",
                [LanguageCode.de]: "Kein-Nebel-Enthüllungsmodus aktiviert!",
            })}
        </Absolute>}
    </>;
}) as <T extends AnyPTM>(props: FieldProps<T>) => ReactElement;
