import {indexes} from "../../../utils/indexes";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {darkGreyColor, textColor} from "../../app/globals";
import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {formatSvgPointsArray} from "../../../types/layout/Position";

export const FieldLines = withFieldLayer(FieldLayer.lines, (
    {
        context: {
            puzzle: {
                typeManager: {
                    borderColor: typeBorderColor,
                },
                fieldSize: {columnsCount, rowsCount},
                borderColor: puzzleBorderColor,
                customCellBounds,
                fieldFitsWrapper,
            },
            cellsIndex,
            cellSize,
            state,
        }
    }: ConstraintProps
) => {
    const borderColor = state.isMyTurn ? puzzleBorderColor || typeBorderColor || textColor : darkGreyColor;
    const borderWidth = fieldFitsWrapper ? 1 : 1 / cellSize;

    if (customCellBounds) {
        return <>
            {cellsIndex.allCells.flatMap(
                (row, top) => row.flatMap(
                    ({getTransformedBounds}, left) => getTransformedBounds(state).borders.map(
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
        {indexes(rowsCount, true).map(rowIndex => {
            return <line
                key={`h-line-${rowIndex}`}
                x1={0}
                y1={rowIndex}
                x2={columnsCount}
                y2={rowIndex}
                stroke={borderColor}
                strokeWidth={borderWidth}
            />;
        })}

        {indexes(columnsCount, true).flatMap(columnIndex => <line
            key={`v-line-${columnIndex}`}
            x1={columnIndex}
            y1={0}
            x2={columnIndex}
            y2={rowsCount}
            stroke={borderColor}
            strokeWidth={1 / cellSize}
        />)}
    </>;
});

export const FieldLinesConstraint: Constraint<any> = {
    name: "field lines",
    cells: [],
    component: FieldLines,
}
