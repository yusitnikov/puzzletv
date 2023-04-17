import {indexes} from "../../../utils/indexes";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {darkGreyColor, textColor} from "../../app/globals";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {concatContinuousLines} from "../../../utils/lines";
import {useTransformScale} from "../../../contexts/TransformScaleContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {isCellWithBorders} from "../../../types/sudoku/CellTypeProps";
import {doesGridRegionContainCell} from "../../../types/sudoku/GridRegion";

export const FieldLines = {
    [FieldLayer.lines]: <T extends AnyPTM>(
        {
            context: {
                puzzle,
                cellsIndexForState,
                state: {processed: {isMyTurn}},
            },
            region,
        }: ConstraintProps<T>
    ) => {
        const {
            typeManager: {
                borderColor: typeBorderColor,
                getCellTypeProps,
            },
            fieldSize: {columnsCount, rowsCount},
            borderColor: puzzleBorderColor,
            customCellBounds,
        } = puzzle;

        const scale = useTransformScale();

        const borderColor = isMyTurn ? puzzleBorderColor || typeBorderColor || textColor : darkGreyColor;
        const borderWidth = 1 / scale;

        const cellHasBorders = (position: Position) => isCellWithBorders(getCellTypeProps?.(position, puzzle))
            && (!region || (customCellBounds && !region.cells) || doesGridRegionContainCell(region, position));

        if (customCellBounds) {
            return <>
                {cellsIndexForState.getAllCells().flatMap(
                    (row, top) => row.flatMap(
                        ({transformedBounds: {borders}}, left) => cellHasBorders({top, left}) ? borders.map(
                            (border, partIndex) => <polygon
                                key={`${top}-${left}-${partIndex}`}
                                points={formatSvgPointsArray(border)}
                                fill={"none"}
                                stroke={borderColor}
                                strokeWidth={borderWidth}
                            />
                        ) : []
                    )
                )}
            </>;
        }

        return <>
            {indexes(rowsCount, true).flatMap(
                top => concatContinuousLines(indexes(columnsCount).filter(
                    left => cellHasBorders({top, left})
                        || (top > 0 && cellHasBorders({top: top - 1, left}))
                )).map(({start, end}) => <line
                    key={`h-line-${top}-${start}`}
                    x1={start}
                    y1={top}
                    x2={end}
                    y2={top}
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                />)
            )}

            {indexes(columnsCount, true).flatMap(
                left => concatContinuousLines(indexes(rowsCount).filter(
                    top => cellHasBorders({top, left})
                        || (left > 0 && cellHasBorders({top, left: left - 1}))
                )).map(({start, end}) => <line
                    key={`v-line-${left}-${start}`}
                    x1={left}
                    y1={start}
                    x2={left}
                    y2={end}
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                />)
            )}
        </>;
    },
};

export const FieldLinesConstraint = <T extends AnyPTM>(): Constraint<T, any> => ({
    name: "field lines",
    cells: [],
    component: FieldLines,
    props: undefined,
});
