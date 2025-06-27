/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Absolute } from "../../layout/absolute/Absolute";
import { Rect } from "../../../types/layout/Rect";
import { useEventListener } from "../../../hooks/useEventListener";
import { controlKeysState } from "../../../hooks/useControlKeysState";
import React, { ReactElement, ReactNode, useState } from "react";
import { GridCellBackground } from "../cell/CellBackground";
import { CellSelectionByCoords } from "../cell/CellSelection";
import { GridCellDigits } from "../cell/CellDigits";
import { GridSvg } from "./GridSvg";
import {
    gameStateApplyArrowToSelectedCells,
    gameStateClearSelectedCells,
    gameStateSelectAllCells,
} from "../../../types/puzzle/GameState";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { GridCellMouseHandler } from "./GridCellMouseHandler";
import { getPuzzleInputModeGestureHandler } from "../../../types/puzzle/PuzzleInputModeInfo";
import { PassThrough } from "../../layout/pass-through/PassThrough";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { GridRegionsWithSameCoordsTransformation } from "./GridRegionsWithSameCoordsTransformation";
import { getGestureHandlerProps, useGestureHandlers, useOutsideClick } from "../../../utils/gestures";
import { usePuzzleContainer } from "../../../contexts/PuzzleContainerContext";
import { GridRegion } from "../../../types/puzzle/GridRegion";
import { useAutoIncrementId } from "../../../hooks/useAutoIncrementId";
import { GridItems, GridItemsProps } from "./GridItems";
import { GridLoop } from "./GridLoop";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { GridCellsLayer } from "./GridCellsLayer";
import { GridFireworks } from "./GridFireworks";
import { translate } from "../../../utils/translate";

export interface GridProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    rect: Rect;
}

/**
 * Render puzzle's grid and everything on it: cells, pen tool's lines and mark, constraints, custom on-grid elements.
 *
 * See the "docs/Puzzle rendering.md" file for more details about how the puzzle grid is rendered.
 */
export const Grid = observer(function GridFc<T extends AnyPTM>({ context, rect }: GridProps<T>) {
    profiler.trace();

    const {
        readOnlySafeContext,
        puzzle,
        fogDemoGridStateHistory,
        inputModeInfo: { isNoSelectionMode, applyToWholeGrid },
        cellSize,
        isReady,
    } = context;

    const { typeManager, gridMargin = 0, loopHorizontally, loopVertically, prioritizeSelection } = puzzle;

    const {
        disableArrowLetterShortcuts,
        allowMove,
        allowScale,
        gridWrapperHandlesScale,
        gridBackgroundColor = "#fff",
        regionBackgroundColor,
        gridWrapperComponent: GridWrapper = PassThrough,
        gridFitsWrapper,
        gridControlsComponent: GridControls,
        disableMouseHandlers,
    } = typeManager;

    const autoIncrementId = useAutoIncrementId();

    // region Pointer events
    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    const gridOuterRect = usePuzzleContainer(true)!;

    const createInputModeGestureHandlers = (forGrid: boolean) =>
        !isReady
            ? []
            : context.allInputModeInfos
                  .filter(({ applyToWholeGrid, disableCellHandlers }) =>
                      forGrid ? applyToWholeGrid : !disableCellHandlers,
                  )
                  .map((inputModeInfo) =>
                      getPuzzleInputModeGestureHandler(
                          context,
                          inputModeInfo,
                          isDeleteSelectedCellsStroke,
                          setIsDeleteSelectedCellsStroke,
                          gridOuterRect,
                      ),
                  );
    const gridGestureHandlers = useGestureHandlers(createInputModeGestureHandlers(true));
    const cellGestureHandlers = useGestureHandlers(createInputModeGestureHandlers(false));

    // Handle outside click
    useOutsideClick(() => {
        if (!controlKeysState.isAnyKeyDown) {
            context.readOnlySafeContext.onStateChange(gameStateClearSelectedCells);
        }

        for (const { onOutsideClick } of context.allInputModeInfos) {
            onOutsideClick?.(context);
        }
    });
    // endregion

    // Handle arrows
    useEventListener(window, "keydown", (ev) => {
        if (settings.isOpened) {
            return;
        }

        const { code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey } = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        // Use the key modifiers from the event - they are always up-to-date
        const isAnyKeyDown = ctrlKey || shiftKey;

        const handleArrow = (xDirection: number, yDirection: number, isMainKeyboard = true) =>
            (isMainKeyboard || !ctrlKey) &&
            readOnlySafeContext.onStateChange((context) =>
                gameStateApplyArrowToSelectedCells(context, xDirection, yDirection, isAnyKeyDown, isMainKeyboard),
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
    ) => (
        <GridLoop context={readOnlySafeContext}>
            {(topOffset, leftOffset) => (
                <GridCellsLayer
                    context={context}
                    topOffset={topOffset}
                    leftOffset={leftOffset}
                    region={region}
                    isInteractionMode={isInteractionMode}
                >
                    {renderer}
                </GridCellsLayer>
            )}
        </GridLoop>
    );

    const selection = (region?: GridRegion) =>
        !isNoSelectionMode && (
            <g data-layer="selection">
                {renderCellsLayer(
                    (top, left) => (
                        <CellSelectionByCoords context={context} top={top} left={left} />
                    ),
                    region,
                )}
            </g>
        );

    const applyShadowFilter = !settings.simplifiedGraphics.get();
    const shadowFilterId = `grid-shadow-${autoIncrementId}`;
    const shadowFilterStr = applyShadowFilter ? `url(#${shadowFilterId})` : undefined;

    return (
        <>
            {/* the main absolutely-positioned container of the grid area - applies the background and handles mouse gestures */}
            <StyledWrapper
                {...rect}
                style={{
                    backgroundColor: gridBackgroundColor,
                    overflow:
                        loopHorizontally || loopVertically || allowMove || (allowScale && !gridWrapperHandlesScale)
                            ? "hidden"
                            : undefined,
                    pointerEvents: "all",
                    cursor: applyToWholeGrid ? "pointer" : undefined,
                }}
                {...getGestureHandlerProps(gridGestureHandlers)}
            >
                {/* custom wrapper defined by the type manager - implement it to modify the DOM structure */}
                <GridWrapper context={context}>
                    {/* apply panning, rotating and zooming transformations to the grid */}
                    <Absolute
                        left={context.animatedNormalizedLeft * cellSize}
                        top={context.animatedNormalizedTop * cellSize}
                        width={rect.width}
                        height={rect.height}
                        angle={context.animatedAngle}
                        scale={gridWrapperHandlesScale ? 1 : context.animatedScale}
                        fitParent={gridFitsWrapper}
                    >
                        {/* The main SVG element that contains all drawings and interactions of the grid */}
                        <GridSvg context={readOnlySafeContext}>
                            {applyShadowFilter && (
                                <filter id={shadowFilterId} colorInterpolationFilters={"sRGB"}>
                                    <feDropShadow
                                        dx={0}
                                        dy={0}
                                        stdDeviation={0.02}
                                        floodColor={"#fff"}
                                        floodOpacity={1}
                                    />
                                </filter>
                            )}

                            {/* transformed regions returned from PuzzleTypeManager.getRegionsWithSameCoordsTransformation() */}
                            <GridRegionsWithSameCoordsTransformation
                                context={readOnlySafeContext}
                                regionNoClipChildren={(region, regionIndex) => (
                                    <g data-layer="items-no-clip">
                                        <GridItems
                                            layer={GridLayer.noClip}
                                            context={readOnlySafeContext}
                                            region={region}
                                            regionIndex={regionIndex}
                                        />
                                    </g>
                                )}
                            >
                                {(region, regionIndex) => {
                                    const itemsProps: Omit<GridItemsProps<T>, "layer"> = {
                                        context,
                                        region,
                                        regionIndex,
                                    };

                                    const { backgroundColor = regionBackgroundColor } = region ?? {};

                                    return (
                                        <>
                                            {region && backgroundColor && (
                                                <rect
                                                    x={region.left}
                                                    y={region.top}
                                                    width={region.width}
                                                    height={region.height}
                                                    fill={backgroundColor}
                                                    strokeWidth={0}
                                                    stroke={"none"}
                                                />
                                            )}

                                            <g data-layer="items-before-background" filter={shadowFilterStr}>
                                                <GridItems layer={GridLayer.beforeBackground} {...itemsProps} />
                                            </g>

                                            <g data-layer="background">
                                                {renderCellsLayer(
                                                    (top, left) => (
                                                        <GridCellBackground context={context} top={top} left={left} />
                                                    ),
                                                    region,
                                                )}
                                            </g>

                                            <g data-layer="items-before-selection" filter={shadowFilterStr}>
                                                <GridItems layer={GridLayer.beforeSelection} {...itemsProps} />
                                            </g>

                                            {!prioritizeSelection && selection(region)}

                                            <g data-layer="items-regular" filter={shadowFilterStr}>
                                                <GridItems layer={GridLayer.regular} {...itemsProps} />
                                            </g>

                                            {prioritizeSelection && selection(region)}

                                            <g data-layer="items-lines">
                                                <GridItems layer={GridLayer.lines} {...itemsProps} />
                                            </g>

                                            <g data-layer="items-after-lines">
                                                <GridItems layer={GridLayer.afterLines} {...itemsProps} />
                                            </g>

                                            <g data-layer="items-given-user-lines">
                                                <GridItems layer={GridLayer.givenUserLines} {...itemsProps} />
                                            </g>

                                            <g data-layer="items-new-user-lines">
                                                <GridItems layer={GridLayer.newUserLines} {...itemsProps} />
                                            </g>

                                            <g data-layer="items-top">
                                                <GridItems layer={GridLayer.top} {...itemsProps} />
                                            </g>

                                            <g data-layer="digits" filter={shadowFilterStr}>
                                                {renderCellsLayer(
                                                    (top, left) => (
                                                        <GridCellDigits context={context} top={top} left={left} />
                                                    ),
                                                    region,
                                                )}
                                            </g>

                                            {isReady && !disableMouseHandlers && !region?.noInteraction && (
                                                <g data-layer="mouse-handler">
                                                    {/* Render mouse handlers for outside cells with no clipping first */}
                                                    {renderCellsLayer(
                                                        (top, left) => (
                                                            <GridCellMouseHandler
                                                                context={readOnlySafeContext}
                                                                top={top}
                                                                left={left}
                                                                regionIndex={regionIndex}
                                                                handlers={cellGestureHandlers}
                                                                outsideHandlers={true}
                                                            />
                                                        ),
                                                        region,
                                                        true,
                                                    )}

                                                    {/* Then render accurate mouse handlers for all cells over them */}
                                                    {renderCellsLayer(
                                                        (top, left) => (
                                                            <GridCellMouseHandler
                                                                context={readOnlySafeContext}
                                                                top={top}
                                                                left={left}
                                                                regionIndex={regionIndex}
                                                                handlers={cellGestureHandlers}
                                                            />
                                                        ),
                                                        region,
                                                        true,
                                                    )}
                                                </g>
                                            )}

                                            <g data-layer="items-interactive">
                                                <GridItems layer={GridLayer.interactive} {...itemsProps} />
                                            </g>
                                        </>
                                    );
                                }}
                            </GridRegionsWithSameCoordsTransformation>
                        </GridSvg>
                    </Absolute>

                    {/* toroidal grid's "shade out" effect */}
                    {loopHorizontally && gridMargin && (
                        <>
                            <Absolute
                                width={gridMargin * cellSize}
                                height={rect.height}
                                style={{
                                    background: "linear-gradient(to right, white, transparent)",
                                }}
                            />

                            <Absolute
                                left={rect.width - gridMargin * cellSize}
                                width={gridMargin * cellSize}
                                height={rect.height}
                                style={{
                                    background: "linear-gradient(to left, white, transparent)",
                                }}
                            />
                        </>
                    )}

                    {/* toroidal grid's "shade out" effect */}
                    {loopVertically && gridMargin && (
                        <>
                            <Absolute
                                width={rect.width}
                                height={gridMargin * cellSize}
                                style={{
                                    background: "linear-gradient(to bottom, white, transparent)",
                                }}
                            />

                            <Absolute
                                top={rect.height - gridMargin * cellSize}
                                width={rect.width}
                                height={gridMargin * cellSize}
                                style={{
                                    background: "linear-gradient(to top, white, transparent)",
                                }}
                            />
                        </>
                    )}
                </GridWrapper>

                {/* custom controls that are not related to specific cells, defined by the type manager */}
                <Absolute
                    top={gridMargin * cellSize}
                    left={gridMargin * cellSize}
                    width={rect.width - 2 * gridMargin * cellSize}
                    height={rect.width - 2 * gridMargin * cellSize}
                >
                    {GridControls && <GridControls context={context} />}

                    <GridFireworks />
                </Absolute>
            </StyledWrapper>

            {/* "no fog reveal mode" warning layer */}
            {fogDemoGridStateHistory && (
                <Absolute
                    {...rect}
                    style={{
                        opacity: 0.2,
                        color: "#f00",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontSize: rect.width * 0.08,
                        padding: "0.5em",
                        boxSizing: "border-box",
                    }}
                >
                    {translate({
                        [LanguageCode.en]: "No fog reveal mode on!",
                        [LanguageCode.ru]: "Режим без раскрытия тумана включен!",
                        [LanguageCode.de]: "Kein-Nebel-Enthüllungsmodus aktiviert!",
                    })}
                </Absolute>
            )}
        </>
    );
}) as <T extends AnyPTM>(props: GridProps<T>) => ReactElement;

const StyledWrapper = styled(Absolute)`
    touch-action: none;
    user-select: none;
    * {
        -webkit-tap-highlight-color: transparent;
    },
`;
