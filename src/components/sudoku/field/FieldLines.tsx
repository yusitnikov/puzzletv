import {indexes} from "../../../utils/indexes";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {textColor} from "../../app/globals";
import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";

export const FieldLines = withFieldLayer(FieldLayer.lines, (
    {
        puzzle: {
            typeManager: {
                borderColor = textColor,
            },
            fieldSize: {columnsCount, rowsCount},
        },
        cellSize
    }: ConstraintProps
) => <>
    {indexes(rowsCount, true).map(rowIndex => {
        return <line
            key={`h-line-${rowIndex}`}
            x1={0}
            y1={rowIndex}
            x2={columnsCount}
            y2={rowIndex}
            stroke={borderColor}
            strokeWidth={1 / cellSize}
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
</>);

export const FieldLinesConstraint: Constraint<any> = {
    name: "field lines",
    cells: [],
    component: FieldLines,
}
