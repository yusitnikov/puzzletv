import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { PropsWithChildren, ReactElement } from "react";
import { PuzzleContextProps } from "../../../types/sudoku/PuzzleContext";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { getPointsBoundingBox, getRectByBounds, getRectPoints } from "../../../types/layout/Rect";
import { getGridRectTransform } from "./GridRect";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export const GridSvg = observer(function FieldSvg<T extends AnyPTM>({
    context,
    children,
}: PropsWithChildren<PuzzleContextProps<T>>) {
    profiler.trace();

    const { puzzle, cellSize, regions } = context;
    let {
        gridSize: { gridSize, rowsCount, columnsCount },
        typeManager: { gridFitsWrapper, ignoreRowsColumnCountInTheWrapper },
        gridMargin = 0,
    } = puzzle;

    if (ignoreRowsColumnCountInTheWrapper) {
        rowsCount = gridSize;
        columnsCount = gridSize;
    }

    let viewBox = {
        left: -gridMargin,
        top: -gridMargin,
        width: columnsCount + 2 * gridMargin,
        height: rowsCount + 2 * gridMargin,
    };

    if (regions) {
        viewBox = getPointsBoundingBox(
            ...getRectPoints(viewBox),
            ...regions.flatMap((region) => {
                const { base, rightVector, bottomVector } = getGridRectTransform(context, region);

                return [0, region.width].flatMap((right) =>
                    [0, region.height].map((bottom) => ({
                        top: base.top + right * rightVector.top + bottom * bottomVector.top,
                        left: base.left + right * rightVector.left + bottom * bottomVector.left,
                    })),
                );
            }),
        );
    }

    const extraMargin = gridSize;
    viewBox = getRectByBounds(
        {
            top: Math.floor(viewBox.top - extraMargin),
            left: Math.floor(viewBox.left - extraMargin),
        },
        {
            top: Math.ceil(viewBox.top + viewBox.height + extraMargin),
            left: Math.ceil(viewBox.left + viewBox.width + extraMargin),
        },
    );

    return (
        <AutoSvg
            left={cellSize * (gridMargin + (gridSize - columnsCount) / 2 + viewBox.left)}
            top={cellSize * (gridMargin + (gridSize - rowsCount) / 2 + viewBox.top)}
            width={cellSize * viewBox.width}
            height={cellSize * viewBox.height}
            fitParent={gridFitsWrapper}
            viewBox={gridFitsWrapper ? undefined : viewBox}
        >
            {children}
        </AutoSvg>
    );
}) as <T extends AnyPTM>(props: PropsWithChildren<PuzzleContextProps<T>>) => ReactElement;
