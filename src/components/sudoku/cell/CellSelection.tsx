import { blueColor, lighterBlueColor, lightOrangeColor } from "../../app/globals";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { Position } from "../../../types/layout/Position";
import { getTransformedRectAverageSize } from "../../../types/layout/Rect";
import { GridCellShape } from "../grid/GridCellShape";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { useTransformScale } from "../../../contexts/TransformContext";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { ReactElement, useMemo } from "react";
import { settings } from "../../../types/layout/Settings";
import { getDefaultCellSelectionType } from "../../../types/sudoku/SudokuTypeManager";
import { profiler } from "../../../utils/profiler";

export const CellSelectionColor = {
    mainCurrent: blueColor,
    mainPrevious: lighterBlueColor,
    secondary: lightOrangeColor,
};

export interface CellSelectionByCoordsProps<T extends AnyPTM> extends Position {
    context: PuzzleContext<T>;
}

export const CellSelectionByCoords = observer(function CellSelectionByCoords<T extends AnyPTM>({
    context,
    top,
    left,
}: CellSelectionByCoordsProps<T>) {
    profiler.trace();

    const cellPosition = useMemo((): Position => ({ top, left }), [top, left]);

    let color = "";
    let width = 1;

    if (context.isSelectedCell(top, left)) {
        color = context.isLastSelectedCell(top, left)
            ? CellSelectionColor.mainCurrent
            : CellSelectionColor.mainPrevious;
    } else {
        const { getCellSelectionType = settings.highlightSeenCells.get() ? getDefaultCellSelectionType : undefined } =
            context.puzzle.typeManager;

        const customSelection = getCellSelectionType?.(cellPosition, context);
        if (customSelection) {
            color = customSelection.color;
            width = customSelection.strokeWidth;
        }
    }

    if (!color) {
        return null;
    }

    return <CellSelectionByData context={context} cellPosition={cellPosition} color={color} strokeWidth={width} />;
}) as <T extends AnyPTM>(props: CellSelectionByCoordsProps<T>) => ReactElement | null;

export interface CellSelectionByDataProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    cellPosition: Position;
    color?: string;
    strokeWidth?: number;
}

export const CellSelectionByData = observer(function CellSelectionByData<T extends AnyPTM>({
    context,
    cellPosition,
    color = CellSelectionColor.mainCurrent,
    strokeWidth = 1,
}: CellSelectionByDataProps<T>) {
    profiler.trace();

    const scale = useTransformScale();

    let selectionBorderWidth = 0.1 * strokeWidth;
    const selectionBorderWidth2 = 2 / scale;

    const { areCustomBounds } = context.puzzleIndex.allCells[cellPosition.top][cellPosition.left];

    if (areCustomBounds) {
        const { userArea } = context.getCellTransformedBounds(cellPosition.top, cellPosition.left);
        const cellTransformedSize = getTransformedRectAverageSize(userArea);

        selectionBorderWidth = Math.max(selectionBorderWidth * cellTransformedSize, 7 / scale);

        return (
            <AutoSvg clip={<GridCellShape context={context} cellPosition={cellPosition} />}>
                <GridCellShape
                    context={context}
                    cellPosition={cellPosition}
                    stroke={"#fff"}
                    strokeWidth={selectionBorderWidth + selectionBorderWidth2}
                />
                <GridCellShape
                    context={context}
                    cellPosition={cellPosition}
                    stroke={color}
                    strokeWidth={selectionBorderWidth}
                />
            </AutoSvg>
        );
    }

    return (
        <>
            <rect
                x={cellPosition.left + selectionBorderWidth / 2}
                y={cellPosition.top + selectionBorderWidth / 2}
                width={1 - selectionBorderWidth}
                height={1 - selectionBorderWidth}
                fill={"none"}
                strokeWidth={selectionBorderWidth}
                stroke={color}
            />
            <rect
                x={cellPosition.left + selectionBorderWidth + selectionBorderWidth2 / 2}
                y={cellPosition.top + selectionBorderWidth + selectionBorderWidth2 / 2}
                width={1 - selectionBorderWidth * 2 - selectionBorderWidth2}
                height={1 - selectionBorderWidth * 2 - selectionBorderWidth2}
                fill={"none"}
                strokeWidth={selectionBorderWidth2}
                stroke={"#fff"}
            />
        </>
    );
}) as <T extends AnyPTM>(props: CellSelectionByDataProps<T>) => ReactElement;
