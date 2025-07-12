import { blueColor, lighterBlueColor, lightOrangeColor } from "../../app/globals";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { Position } from "../../../types/layout/Position";
import { getTransformedRectAverageSize } from "../../../types/layout/Rect";
import { GridCellShape } from "../grid/GridCellShape";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { useTransformScale } from "../../../contexts/TransformContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { ReactElement, useMemo } from "react";
import { settings } from "../../../types/layout/Settings";
import { getDefaultCellHighlight } from "../../../types/puzzle/PuzzleTypeManager";
import { profiler } from "../../../utils/profiler";

export const CellHighlightColor = {
    mainCurrent: blueColor,
    mainPrevious: lighterBlueColor,
    secondary: lightOrangeColor,
};

export interface CellHighlightByCoordsProps<T extends AnyPTM> extends Position {
    context: PuzzleContext<T>;
}

export const CellHighlightByCoords = observer(function CellHighlightByCoords<T extends AnyPTM>({
    context,
    top,
    left,
}: CellHighlightByCoordsProps<T>) {
    profiler.trace();

    const cellPosition = useMemo((): Position => ({ top, left }), [top, left]);

    let color = "";
    let width = 1;

    if (context.isSelectedCell(top, left)) {
        color = context.isLastSelectedCell(top, left)
            ? CellHighlightColor.mainCurrent
            : CellHighlightColor.mainPrevious;
    } else {
        const { getCellHighlight = settings.highlightSeenCells.get() ? getDefaultCellHighlight : undefined } =
            context.puzzle.typeManager;

        const customHighlight = getCellHighlight?.(cellPosition, context);
        if (customHighlight) {
            color = customHighlight.color;
            width = customHighlight.strokeWidth;
        }
    }

    if (!color) {
        return null;
    }

    return <CellHighlightByData context={context} cellPosition={cellPosition} color={color} strokeWidth={width} />;
}) as <T extends AnyPTM>(props: CellHighlightByCoordsProps<T>) => ReactElement | null;

export interface CellHighlightByDataProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    cellPosition: Position;
    color?: string;
    strokeWidth?: number;
}

export const CellHighlightByData = observer(function CellHighlightByData<T extends AnyPTM>({
    context,
    cellPosition,
    color = CellHighlightColor.mainCurrent,
    strokeWidth = 1,
}: CellHighlightByDataProps<T>) {
    profiler.trace();

    const scale = useTransformScale();

    let highlightBorderWidth = 0.1 * strokeWidth;
    const highlightBorderWidth2 = 2 / scale;

    const { areCustomBounds } = context.puzzleIndex.allCells[cellPosition.top][cellPosition.left];

    if (areCustomBounds) {
        const { userArea } = context.getCellTransformedBounds(cellPosition.top, cellPosition.left);
        const cellTransformedSize = getTransformedRectAverageSize(userArea);

        highlightBorderWidth = Math.max(highlightBorderWidth * cellTransformedSize, 7 / scale);

        return (
            <AutoSvg clip={<GridCellShape context={context} cellPosition={cellPosition} />}>
                <GridCellShape
                    context={context}
                    cellPosition={cellPosition}
                    stroke={"#fff"}
                    strokeWidth={highlightBorderWidth + highlightBorderWidth2}
                />
                <GridCellShape
                    context={context}
                    cellPosition={cellPosition}
                    stroke={color}
                    strokeWidth={highlightBorderWidth}
                />
            </AutoSvg>
        );
    }

    return (
        <>
            <rect
                x={cellPosition.left + highlightBorderWidth / 2}
                y={cellPosition.top + highlightBorderWidth / 2}
                width={1 - highlightBorderWidth}
                height={1 - highlightBorderWidth}
                fill={"none"}
                strokeWidth={highlightBorderWidth}
                stroke={color}
            />
            <rect
                x={cellPosition.left + highlightBorderWidth + highlightBorderWidth2 / 2}
                y={cellPosition.top + highlightBorderWidth + highlightBorderWidth2 / 2}
                width={1 - highlightBorderWidth * 2 - highlightBorderWidth2}
                height={1 - highlightBorderWidth * 2 - highlightBorderWidth2}
                fill={"none"}
                strokeWidth={highlightBorderWidth2}
                stroke={"#fff"}
            />
        </>
    );
}) as <T extends AnyPTM>(props: CellHighlightByDataProps<T>) => ReactElement;
