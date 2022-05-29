import {indexes} from "../../../utils/indexes";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {darkGreyColor, textColor} from "../../app/globals";
import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {myClientId} from "../../../hooks/useMultiPlayer";

export const FieldLines = withFieldLayer(FieldLayer.lines, (
    {
        context: {
            puzzle: {
                typeManager: {
                    borderColor: typeBorderColor,
                },
                fieldSize: {columnsCount, rowsCount},
                borderColor: puzzleBorderColor,
            },
            cellSize,
            state: {isMyTurn},
        },
    }: ConstraintProps
) => {
    const borderColor = isMyTurn ? puzzleBorderColor || typeBorderColor || textColor : darkGreyColor;

    return <>
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
    </>;
});

export const FieldLinesConstraint: Constraint<any> = {
    name: "field lines",
    cells: [],
    component: FieldLines,
}
