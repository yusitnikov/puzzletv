import React, { ReactElement, useMemo } from "react";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { formatSvgPointsArray, Position } from "../../../types/layout/Position";
import { CellColorValue, resolveCellColorValue } from "../../../types/puzzle/CellColor";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { GridCellShape } from "../grid/GridCellShape";
import { getRegionBoundingBox } from "../../../utils/regions";
import { getRectCenter, getTransformedRectCenter, Rect } from "../../../types/layout/Rect";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { comparer } from "mobx";
import { settings } from "../../../types/layout/Settings";
import { useComputed, useComputedValue } from "../../../hooks/useComputed";
import { profiler } from "../../../utils/profiler";

export interface GridCellBackgroundProps<T extends AnyPTM> extends Position {
    context: PuzzleContext<T>;
    noGivenColors?: boolean;
}

export const GridCellBackground = observer(function GridCellBackgroundFc<T extends AnyPTM>({
    context,
    noGivenColors,
    top,
    left,
}: GridCellBackgroundProps<T>) {
    profiler.trace();

    const cellPosition = useMemo((): Position => ({ top, left }), [top, left]);

    const colors = context.getCellColors(top, left).items;
    const initialCellColors = useComputedValue(
        () => (noGivenColors ? undefined : context.puzzleInitialColors[top]?.[left]),
        {
            name: `GridCellBackground:initialCellColors[${top}][${left}]`,
            equals: comparer.structural,
        },
        [noGivenColors, top, left],
    );
    const finalColors = context.puzzle.allowOverridingInitialColors
        ? colors.length
            ? colors
            : (initialCellColors ?? [])
        : (initialCellColors ?? colors);

    if (!finalColors.length) {
        return null;
    }

    return (
        <CellBackground
            context={context}
            cellPosition={cellPosition}
            colors={finalColors}
            noOpacity={!!initialCellColors?.length}
        />
    );
}) as <T extends AnyPTM>(props: GridCellBackgroundProps<T>) => ReactElement | null;

export interface CellBackgroundProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    cellPosition?: Position;
    colors: CellColorValue[];
    size?: number;
    noOpacity?: boolean;
}

export const CellBackground = observer(function CellBackground<T extends AnyPTM>({
    context,
    cellPosition,
    colors,
    noOpacity,
    size = 1,
}: CellBackgroundProps<T>) {
    profiler.trace();

    if (context.puzzle.typeManager.disableBackgroundColorOpacity) {
        noOpacity = true;
    }

    const getCustomBounds = useComputed(
        () => cellPosition && context.getCellTransformedBounds(cellPosition.top, cellPosition.left),
        { name: `CellBackground:customBounds[${cellPosition?.top}][${cellPosition?.left}]` },
        [cellPosition],
    );
    const getAreCustomBounds = useComputed(
        () => !!cellPosition && context.puzzleIndex.allCells[cellPosition.top][cellPosition.left].areCustomBounds,
        { name: `CellBackground:areCustomBounds[${cellPosition?.top}][${cellPosition?.left}]` },
        [cellPosition, getCustomBounds],
    );

    const getCellRect = useComputed(
        (): Rect =>
            getAreCustomBounds()
                ? getRegionBoundingBox(getCustomBounds()!.borders.flat(), 0)
                : {
                      left: (cellPosition?.left ?? 0) * size,
                      top: (cellPosition?.top ?? 0) * size,
                      width: size,
                      height: size,
                  },
        { name: `CellBackground:customCellRect[${cellPosition?.top}][${cellPosition?.left}]` },
        [getAreCustomBounds, getCustomBounds, size],
    );
    const getCellCenter = useComputed(
        (): Position =>
            getAreCustomBounds() ? getTransformedRectCenter(getCustomBounds()!.userArea) : getRectCenter(getCellRect()),
        { name: `CellBackground:customCellCenter[${cellPosition?.top}][${cellPosition?.left}]` },
        [getAreCustomBounds, getCustomBounds, getCellRect],
    );

    if (!colors.length) {
        return null;
    }

    const cellRect = getCellRect();
    const cellCenter = getCellCenter();

    const cellRadius = Math.max(
        cellCenter.left - cellRect.left,
        cellRect.left + cellRect.width - cellCenter.left,
        cellCenter.top - cellRect.top,
        cellRect.top + cellRect.height - cellCenter.top,
    );

    const clip = colors.length > 1 || getAreCustomBounds();
    const opacity = noOpacity ? 1 : settings.backgroundOpacity.get();

    return (
        <AutoSvg
            width={size}
            height={size}
            clip={clip && <GridCellShape context={context} cellPosition={cellPosition} />}
            style={{ opacity }}
        >
            <rect
                x={cellRect.left}
                y={cellRect.top}
                width={cellRect.width}
                height={cellRect.height}
                fill={resolveCellColorValue(colors[0])}
                stroke={"none"}
                strokeWidth={0}
            />

            {colors.length > 1 && (
                <>
                    {colors.map(
                        (color, index) =>
                            !!index && (
                                <polygon
                                    key={index}
                                    points={formatSvgPointsArray(
                                        [
                                            [0, index - 0.5],
                                            [1, index - 0.5],
                                            [1, index],
                                            [1, index + 0.5],
                                        ]
                                            .map(([y, i]) => [
                                                y * cellRadius * 4,
                                                Math.PI * ((2 * i) / colors.length - 0.25),
                                            ])
                                            .map(([y, a]) => ({
                                                left: cellCenter.left + y * Math.cos(a),
                                                top: cellCenter.top + y * Math.sin(a),
                                            })),
                                    )}
                                    fill={resolveCellColorValue(color)}
                                />
                            ),
                    )}
                </>
            )}
        </AutoSvg>
    );
}) as <T extends AnyPTM>(props: CellBackgroundProps<T>) => ReactElement;
