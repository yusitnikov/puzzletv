import { indexes } from "../../../utils/indexes";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { darkGreyColor, textColor } from "../../app/globals";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../types/puzzle/Constraint";
import { formatSvgPointsArray, Line, Position } from "../../../types/layout/Position";
import { concatContinuousLines } from "../../../utils/lines";
import { useTransformScale } from "../../../contexts/TransformContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { isCellWithBorders } from "../../../types/puzzle/CellTypeProps";
import { doesGridRegionContainCell } from "../../../types/puzzle/GridRegion";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { comparer } from "mobx";
import { useComputed } from "../../../hooks/useComputed";

interface GridLinesByDataProps {
    color: string;
    width: number;
    customCellBorders: Position[][];
    regularGridLines: Line[];
    dashedGrid?: boolean;
}

const GridLinesByData = observer(function GridLinesByDataFc({
    color,
    width,
    customCellBorders,
    regularGridLines,
    dashedGrid,
}: GridLinesByDataProps) {
    profiler.trace();

    return (
        <>
            {customCellBorders.map((border, index) => (
                <polygon
                    key={`custom-${index}`}
                    points={formatSvgPointsArray(border)}
                    fill={"none"}
                    stroke={color}
                    strokeWidth={width}
                />
            ))}

            {regularGridLines.map(({ start, end }) => (
                <line
                    key={`regular-${start.top}-${start.left}-${end.top}-${end.left}`}
                    x1={start.left}
                    y1={start.top}
                    x2={end.left}
                    y2={end.top}
                    stroke={color}
                    strokeWidth={width}
                    strokeDasharray={dashedGrid ? 0.125 : undefined}
                />
            ))}
        </>
    );
});

export const GridLines: ConstraintPropsGenericFcMap = {
    [GridLayer.lines]: observer(function GridLinesFc<T extends AnyPTM>({ context, region }: ConstraintProps<T>) {
        profiler.trace();

        const { puzzle, puzzleIndex, isMyTurn } = context;

        const {
            typeManager: { gridLineColor: typeGridLineColor },
            gridSize: { columnsCount, rowsCount },
            gridLineColor: puzzleGridLineColor,
            customCellBounds,
            dashedGrid,
        } = puzzle;

        const scale = useTransformScale();

        const timer = profiler.track("FieldLines");

        const cellHasBorders = (position: Position) =>
            isCellWithBorders(puzzleIndex.getCellTypeProps(position)) &&
            (!region || (customCellBounds && !region.cells) || doesGridRegionContainCell(region, position));

        const getCustomCellBorders = useComputed(
            function getCustomCellBorders(): Position[][] {
                return customCellBounds
                    ? context.puzzleIndex.allCells.flatMap((row, top) =>
                          row.flatMap((_, left) =>
                              cellHasBorders({ top, left }) ? context.getCellTransformedBounds(top, left).borders : [],
                          ),
                      )
                    : [];
            },
            { equals: comparer.structural },
        );

        const getRegularGridLines = useComputed(
            function getRegularGridLines(): Line[] {
                return customCellBounds
                    ? []
                    : [
                          ...indexes(rowsCount, true).flatMap((top) =>
                              concatContinuousLines(
                                  indexes(columnsCount).filter(
                                      (left) =>
                                          (top < rowsCount && cellHasBorders({ top, left })) ||
                                          (top > 0 && cellHasBorders({ top: top - 1, left })),
                                  ),
                              ).map(({ start, end }) => ({
                                  start: { left: start, top },
                                  end: { left: end, top },
                              })),
                          ),
                          ...indexes(columnsCount, true).flatMap((left) =>
                              concatContinuousLines(
                                  indexes(rowsCount).filter(
                                      (top) =>
                                          (left < columnsCount && cellHasBorders({ top, left })) ||
                                          (left > 0 && cellHasBorders({ top, left: left - 1 })),
                                  ),
                              ).map(({ start, end }) => ({
                                  start: { left, top: start },
                                  end: { left, top: end },
                              })),
                          ),
                      ];
            },
            { equals: comparer.structural },
        );

        if (region?.noBorders) {
            return null;
        }

        const regularGridLines = getRegularGridLines();
        const customCellBorders = getCustomCellBorders();

        timer.stop();

        return (
            <GridLinesByData
                width={1 / scale}
                color={isMyTurn ? puzzleGridLineColor || typeGridLineColor || textColor : darkGreyColor}
                customCellBorders={customCellBorders}
                regularGridLines={regularGridLines}
                dashedGrid={dashedGrid}
            />
        );
    }),
};

export const GridLinesConstraint = <T extends AnyPTM>(): Constraint<T, any> => ({
    name: "grid lines",
    cells: [],
    component: GridLines,
    props: undefined,
});
