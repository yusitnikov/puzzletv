import { getLineVector, getVectorLength, Position, stringifyPosition } from "../../../types/layout/Position";
import { Rect } from "../../../types/layout/Rect";
import { globalPaddingCoeff } from "../../app/globals";
import { indexes } from "../../../utils/indexes";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { FieldCellShape } from "./FieldCellShape";
import { CellExactPosition } from "../../../types/sudoku/CellExactPosition";
import { CellPart } from "../../../types/sudoku/CellPart";
import { mergeEventHandlerProps } from "../../../utils/mergeEventHandlerProps";
import { cancelOutsideClickProps, GestureHandler, getGestureHandlerProps } from "../../../utils/gestures";
import { CellGestureExtraData, cellGestureExtraDataTag } from "../../../types/sudoku/CellGestureExtraData";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { ReactElement, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useComputed, useComputedValue } from "../../../hooks/useComputed";
import { profiler } from "../../../utils/profiler";

const borderPaddingCoeff = Math.max(0.25, globalPaddingCoeff);

export interface FieldCellMouseHandlerProps<T extends AnyPTM> extends Position {
    context: PuzzleContext<T>;
    regionIndex?: number;
    handlers: GestureHandler<any>[];
}

export const FieldCellMouseHandler = observer(function FieldCellMouseHandler<T extends AnyPTM>(
    props: FieldCellMouseHandlerProps<T>,
) {
    profiler.trace();

    const { context, top, left } = props;

    const getCellWriteModeInfo = useComputed(
        function getCellWriteModeInfo() {
            return context.puzzleIndex.getCellTypeProps({ top, left }).forceCellWriteMode ?? context.cellWriteModeInfo;
        },
        undefined,
        [top, left],
    );
    const disableCellHandlers = useComputedValue(
        function getDisableCellHandlers() {
            return getCellWriteModeInfo().disableCellHandlers;
        },
        undefined,
        [getCellWriteModeInfo],
    );
    const hasCellHandlers = useComputedValue(
        function getHasCellHandlers() {
            const { onCornerClick, onCornerEnter } = getCellWriteModeInfo();
            return !!(onCornerClick || onCornerEnter);
        },
        undefined,
        [getCellWriteModeInfo],
    );

    if (disableCellHandlers) {
        return null;
    }

    return <FieldCellMouseHandlerInner {...props} hasCellHandlers={hasCellHandlers} />;
}) as <T extends AnyPTM>(props: FieldCellMouseHandlerProps<T>) => ReactElement | null;

interface FieldCellMouseHandlerInnerProps<T extends AnyPTM> extends FieldCellMouseHandlerProps<T> {
    hasCellHandlers: boolean;
}
const FieldCellMouseHandlerInner = observer(function FieldCellMouseHandlerInner<T extends AnyPTM>({
    context,
    top,
    left,
    regionIndex,
    handlers,
    hasCellHandlers,
}: FieldCellMouseHandlerInnerProps<T>) {
    profiler.trace();

    const { puzzleIndex } = context;

    const { areCustomBounds, center, borderSegments } = puzzleIndex.allCells[top][left];

    const getCornersMap = () => {
        const cornersMap: Record<string, { corner: Position; length: number }> = {};
        for (const { line } of Object.values(borderSegments)) {
            const start = line[0],
                end = line[line.length - 1];
            const startKey = stringifyPosition(start),
                endKey = stringifyPosition(end);
            const length = getVectorLength(getLineVector({ start, end }));

            const startCorner = (cornersMap[startKey] ??= { corner: start, length: length });
            startCorner.length = Math.min(startCorner.length, length);

            const endCorner = (cornersMap[endKey] ??= { corner: end, length: length });
            endCorner.length = Math.min(endCorner.length, length);
        }
        return cornersMap;
    };

    const cellPosition = useMemo((): Position => ({ top, left }), [top, left]);

    const centerExactPosition = useMemo(
        (): CellExactPosition => ({
            center,
            corner: cellPosition,
            round: center,
            type: CellPart.center,
        }),
        [center, cellPosition],
    );

    return (
        <>
            {hasCellHandlers && (
                <>
                    {!areCustomBounds &&
                        indexes(4).flatMap((topOffset) =>
                            indexes(4).map((leftOffset) => {
                                const isTopCenter = [1, 2].includes(topOffset);
                                const isLeftCenter = [1, 2].includes(leftOffset);

                                const exactPosition: CellExactPosition = {
                                    center,
                                    corner: {
                                        left: left + (leftOffset >> 1),
                                        top: top + (topOffset >> 1),
                                    },
                                    round: {
                                        left: left + (isLeftCenter ? 0.5 : leftOffset ? 1 : 0),
                                        top: top + (isTopCenter ? 0.5 : topOffset ? 1 : 0),
                                    },
                                    type:
                                        isTopCenter && isLeftCenter
                                            ? CellPart.center
                                            : !isTopCenter && !isLeftCenter
                                              ? CellPart.corner
                                              : CellPart.border,
                                };

                                return (
                                    <MouseHandlerRect
                                        key={`draw-corner-${topOffset}-${leftOffset}`}
                                        context={context}
                                        cellPosition={cellPosition}
                                        cellExactPosition={exactPosition}
                                        regionIndex={regionIndex}
                                        handlers={handlers}
                                        left={leftOffset * 0.25}
                                        top={topOffset * 0.25}
                                        width={0.25}
                                        height={0.25}
                                    />
                                );
                            }),
                        )}

                    {areCustomBounds && (
                        <>
                            {Object.entries(borderSegments).flatMap(([key, { line, halves, center: borderCenter }]) =>
                                halves.flatMap((half, halfIndex) => {
                                    const corner = line[halfIndex ? line.length - 1 : 0];

                                    return [
                                        <MouseHandlerRect
                                            key={`draw-center-segment-${key}-${halfIndex}`}
                                            context={context}
                                            cellPosition={cellPosition}
                                            cellExactPosition={{
                                                center,
                                                corner,
                                                round: center,
                                                type: CellPart.center,
                                            }}
                                            regionIndex={regionIndex}
                                            polygon={[...half, center]}
                                            handlers={handlers}
                                        />,
                                        <MouseHandlerRect
                                            key={`draw-border-${key}-${halfIndex}`}
                                            context={context}
                                            cellPosition={cellPosition}
                                            cellExactPosition={{
                                                center,
                                                corner,
                                                round: borderCenter,
                                                type: CellPart.border,
                                            }}
                                            regionIndex={regionIndex}
                                            line={half}
                                            handlers={handlers}
                                        />,
                                    ];
                                }),
                            )}

                            {Object.entries(getCornersMap()).map(([key, { corner, length }]) => (
                                <MouseHandlerRect
                                    key={`draw-corner-${key}`}
                                    context={context}
                                    cellPosition={cellPosition}
                                    cellExactPosition={{
                                        center,
                                        corner,
                                        round: corner,
                                        type: CellPart.corner,
                                    }}
                                    regionIndex={regionIndex}
                                    point={corner}
                                    width={0.25 * length}
                                    height={0.25 * length}
                                    handlers={handlers}
                                />
                            ))}
                        </>
                    )}
                </>
            )}

            {!hasCellHandlers && (
                <>
                    <MouseHandlerRect
                        key={"cell-selection"}
                        context={context}
                        cellPosition={cellPosition}
                        cellExactPosition={centerExactPosition}
                        regionIndex={regionIndex}
                        handlers={handlers}
                    />

                    {!areCustomBounds &&
                        indexes(2).flatMap((topOffset) =>
                            indexes(2).map((leftOffset) => {
                                return (
                                    <MouseHandlerRect
                                        key={`no-interaction-corner-${topOffset}-${leftOffset}`}
                                        context={context}
                                        cellPosition={cellPosition}
                                        cellExactPosition={centerExactPosition}
                                        regionIndex={regionIndex}
                                        left={leftOffset * (1 - borderPaddingCoeff)}
                                        top={topOffset * (1 - borderPaddingCoeff)}
                                        width={borderPaddingCoeff}
                                        height={borderPaddingCoeff}
                                        handlers={handlers}
                                        skipEnter={true}
                                    />
                                );
                            }),
                        )}
                </>
            )}
        </>
    );
}) as <T extends AnyPTM>(props: FieldCellMouseHandlerInnerProps<T>) => ReactElement;

interface MouseHandlerRectProps<T extends AnyPTM> extends Partial<Rect> {
    context: PuzzleContext<T>;
    cellPosition: Position;
    cellExactPosition: CellExactPosition;
    regionIndex?: number;
    line?: Position[];
    polygon?: Position[];
    point?: Position;
    handlers: GestureHandler<any>[];
    skipEnter?: boolean;
}

const MouseHandlerRect = observer(function MouseHandlerRect<T extends AnyPTM>({
    context,
    cellPosition,
    cellExactPosition,
    regionIndex,
    handlers,
    skipEnter,
    ...other
}: MouseHandlerRectProps<T>) {
    profiler.trace();

    return (
        <FieldCellShape
            context={context}
            cellPosition={cellPosition}
            style={{
                cursor: "pointer",
                pointerEvents: "all",
            }}
            {...mergeEventHandlerProps(
                // Make sure that clicking on the grid won't be recognized as an outside click
                cancelOutsideClickProps,
                // Make sure that clicking on the grid won't try to drag
                {
                    onMouseDown: (ev) => ev.preventDefault(),
                },
                getGestureHandlerProps(
                    handlers,
                    (): CellGestureExtraData => ({
                        tags: [cellGestureExtraDataTag],
                        cell: cellPosition,
                        exact: cellExactPosition,
                        regionIndex,
                        skipEnter,
                    }),
                ),
            )}
            {...other}
        />
    );
}) as <T extends AnyPTM>(props: MouseHandlerRectProps<T>) => ReactElement;
