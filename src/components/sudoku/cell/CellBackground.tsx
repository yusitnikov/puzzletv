import React, { ReactElement, useMemo } from "react";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { formatSvgPointsArray, Position } from "../../../types/layout/Position";
import { CellColorValue, resolveCellColorValue } from "../../../types/sudoku/CellColor";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { FieldCellShape } from "../field/FieldCellShape";
import { getRegionBoundingBox } from "../../../utils/regions";
import { getTransformedRectCenter, Rect } from "../../../types/layout/Rect";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { comparer } from "mobx";
import { settings } from "../../../types/layout/Settings";
import { useComputed, useComputedValue } from "../../../hooks/useComputed";
import { profiler } from "../../../utils/profiler";

export interface FieldCellBackgroundProps<T extends AnyPTM> extends Position {
    context: PuzzleContext<T>;
    noGivenColors?: boolean;
}

export const FieldCellBackground = observer(function FieldCellBackground<T extends AnyPTM>({
    context,
    noGivenColors,
    top,
    left,
}: FieldCellBackgroundProps<T>) {
    profiler.trace();

    const cellPosition = useMemo((): Position => ({ top, left }), [top, left]);

    const colors = context.getCellColors(top, left).items;
    const initialCellColors = useComputedValue(
        () => (noGivenColors ? undefined : context.puzzleInitialColors[top]?.[left]),
        {
            name: `FieldCellBackground:initialCellColors[${top}][${left}]`,
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
}) as <T extends AnyPTM>(props: FieldCellBackgroundProps<T>) => ReactElement | null;

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

    if (context.puzzle.disableBackgroundColorOpacity) {
        noOpacity = true;
    }

    const getCustomBounds = useComputed(
        () => cellPosition && context.getCellTransformedBounds(cellPosition.top, cellPosition.left),
        { name: `CellBackground:customBounds[${cellPosition?.top}][${cellPosition?.left}]` },
        [cellPosition],
    );
    const getAreCustomBounds = useComputed(
        () =>
            cellPosition &&
            !!getCustomBounds &&
            context.puzzleIndex.allCells[cellPosition.top][cellPosition.left].areCustomBounds,
        { name: `CellBackground:areCustomBounds[${cellPosition?.top}][${cellPosition?.left}]` },
        [cellPosition, getCustomBounds],
    );

    const getCustomCellRect = useComputed(
        (): Rect =>
            getAreCustomBounds()
                ? getRegionBoundingBox(getCustomBounds()!.borders.flat(), 0)
                : {
                      left: 0,
                      top: 0,
                      width: size,
                      height: size,
                  },
        { name: `CellBackground:customCellRect[${cellPosition?.top}][${cellPosition?.left}]` },
        [getAreCustomBounds, getCustomBounds, size],
    );
    const getCustomCellCenter = useComputed(
        (): Position =>
            getAreCustomBounds()
                ? getTransformedRectCenter(getCustomBounds()!.userArea)
                : {
                      left: size / 2,
                      top: size / 2,
                  },
        { name: `CellBackground:customCellCenter[${cellPosition?.top}][${cellPosition?.left}]` },
        [getAreCustomBounds, getCustomBounds, size],
    );

    if (!colors.length) {
        return null;
    }

    const customCellRect = getCustomCellRect();
    const customCellCenter = getCustomCellCenter();

    const customCellRadius = Math.max(
        customCellCenter.left - customCellRect.left,
        customCellRect.left + customCellRect.width - customCellCenter.left,
        customCellCenter.top - customCellRect.top,
        customCellRect.top + customCellRect.height - customCellCenter.top,
    );

    const clip = colors.length > 1 || !!getAreCustomBounds();
    const opacity = noOpacity ? 1 : settings.backgroundOpacity.get();

    return (
        <AutoSvg
            width={size}
            height={size}
            clip={clip && <FieldCellShape context={context} cellPosition={cellPosition} />}
            style={{ opacity }}
        >
            <rect
                x={customCellRect.left}
                y={customCellRect.top}
                width={customCellRect.width}
                height={customCellRect.height}
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
                                                y * customCellRadius * 4,
                                                Math.PI * ((2 * i) / colors.length - 0.25),
                                            ])
                                            .map(([y, a]) => ({
                                                left: customCellCenter.left + y * Math.cos(a),
                                                top: customCellCenter.top + y * Math.sin(a),
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
