import {indexes} from "../../../utils/indexes";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {darkGreyColor, textColor} from "../../app/globals";
import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {formatSvgPointsArray} from "../../../types/layout/Position";
import {concatContinuousLines} from "../../../utils/lines";

export const FieldLines = withFieldLayer(FieldLayer.lines, (
    {
        context: {
            puzzle,
            cellsIndexForState,
            cellSize,
            state: {processed: {isMyTurn}},
        }
    }: ConstraintProps
) => {
    const {
        typeManager: {
            borderColor: typeBorderColor,
            isValidCell = () => true,
        },
        fieldSize: {columnsCount, rowsCount},
        borderColor: puzzleBorderColor,
        customCellBounds,
        fieldFitsWrapper,
    } = puzzle;

    const borderColor = isMyTurn ? puzzleBorderColor || typeBorderColor || textColor : darkGreyColor;
    const borderWidth = fieldFitsWrapper ? 1 : 1 / cellSize;

    if (customCellBounds) {
        return <>
            {cellsIndexForState.getAllCells().flatMap(
                (row, top) => row.flatMap(
                    ({transformedBounds: {borders}}, left) => borders.map(
                        (border, partIndex) => <polygon
                            key={`${top}-${left}-${partIndex}`}
                            points={formatSvgPointsArray(border)}
                            fill={"none"}
                            stroke={borderColor}
                            strokeWidth={borderWidth}
                        />
                    )
                )
            )}
        </>;
    }

    return <>
        {indexes(rowsCount, true).flatMap(
            top => concatContinuousLines(indexes(columnsCount).filter(
                left => isValidCell({top, left}, puzzle) || (top > 0 && isValidCell({top: top - 1, left}, puzzle))
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
                top => isValidCell({top, left}, puzzle) || (left > 0 && isValidCell({top, left: left - 1}, puzzle))
            )).map(({start, end}) => <line
                key={`v-line-${left}-${start}`}
                x1={left}
                y1={start}
                x2={left}
                y2={end}
                stroke={borderColor}
                strokeWidth={1 / cellSize}
            />)
        )}
    </>;
});

export const FieldLinesConstraint: Constraint<any, any, any, any> = {
    name: "field lines",
    cells: [],
    component: FieldLines,
    props: undefined,
}
