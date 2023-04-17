import {memo} from "react";
import {indexes} from "../../../utils/indexes";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {darkGreyColor, textColor} from "../../app/globals";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {formatSvgPointsArray, Line, Position} from "../../../types/layout/Position";
import {concatContinuousLines} from "../../../utils/lines";
import {useTransformScale} from "../../../contexts/TransformScaleContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {isCellWithBorders} from "../../../types/sudoku/CellTypeProps";
import {doesGridRegionContainCell} from "../../../types/sudoku/GridRegion";
import {usePureMemo} from "../../../hooks/usePureMemo";
import {profiler} from "../../../utils/profiler";

interface FieldLinesByDataProps {
    borderColor: string;
    borderWidth: number;
    customCellBorders: Position[][];
    regularBorders: Line[];
}

const FieldLinesByData = memo((
    {borderColor, borderWidth, customCellBorders, regularBorders}: FieldLinesByDataProps
) => {
    return <>
        {customCellBorders.map((border, index) => <polygon
            key={`custom-${index}`}
            points={formatSvgPointsArray(border)}
            fill={"none"}
            stroke={borderColor}
            strokeWidth={borderWidth}
        />)}

        {regularBorders.map(({start, end}) => <line
            key={`regular-${start.top}-${start.left}-${end.top}-${end.left}`}
            x1={start.left}
            y1={start.top}
            x2={end.left}
            y2={end.top}
            stroke={borderColor}
            strokeWidth={borderWidth}
        />)}
    </>;
});

export const FieldLines = {
    [FieldLayer.lines]: <T extends AnyPTM>(
        {
            context: {
                puzzle,
                cellsIndex,
                cellsIndexForState,
                state: {processed: {isMyTurn}},
            },
            region,
        }: ConstraintProps<T>
    ) => {
        const {
            typeManager: {borderColor: typeBorderColor},
            fieldSize: {columnsCount, rowsCount},
            borderColor: puzzleBorderColor,
            customCellBounds,
        } = puzzle;

        const scale = useTransformScale();

        if (region?.noBorders) {
            return null;
        }

        const timer = profiler.track("FieldLines");

        const borderColor = isMyTurn ? puzzleBorderColor || typeBorderColor || textColor : darkGreyColor;
        const borderWidth = 1 / scale;

        const cellHasBorders = (position: Position) => isCellWithBorders(cellsIndex.getCellTypeProps(position))
            && (!region || (customCellBounds && !region.cells) || doesGridRegionContainCell(region, position));

        const customCellBorders = usePureMemo<Position[][]>(
            customCellBounds
                ? cellsIndexForState.getAllCells().flatMap(
                    (row, top) => row.flatMap(
                        ({transformedBounds: {borders}}, left) => cellHasBorders({top, left}) ? borders : []
                    )
                )
                : []
        );

        const regularBorders = usePureMemo<Line[]>(customCellBounds ? [] : [
            ...indexes(rowsCount, true).flatMap(
                top => concatContinuousLines(indexes(columnsCount).filter(
                    left => cellHasBorders({top, left})
                        || (top > 0 && cellHasBorders({top: top - 1, left}))
                )).map(({start, end}) => ({
                    start: {left: start, top},
                    end: {left: end, top},
                }))
            ),
            ...indexes(columnsCount, true).flatMap(
                left => concatContinuousLines(indexes(rowsCount).filter(
                    top => cellHasBorders({top, left})
                        || (left > 0 && cellHasBorders({top, left: left - 1}))
                )).map(({start, end}) => ({
                    start: {left, top: start},
                    end: {left, top: end},
                }))
            ),
        ]);

        timer.stop();

        return <FieldLinesByData
            borderWidth={borderWidth}
            borderColor={borderColor}
            customCellBorders={customCellBorders}
            regularBorders={regularBorders}
        />;
    },
};

export const FieldLinesConstraint = <T extends AnyPTM>(): Constraint<T, any> => ({
    name: "field lines",
    cells: [],
    component: FieldLines,
    props: undefined,
});
