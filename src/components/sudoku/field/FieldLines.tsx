import {indexes} from "../../../utils/indexes";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {textColor} from "../../app/globals";
import {withFieldLayer} from "../../../contexts/FieldLayerContext";

export interface FieldLinesProps {
    puzzle: PuzzleDefinition<any, any, any>;
    cellSize: number;
}

export const FieldLines = withFieldLayer(FieldLayer.lines, (
    {
        puzzle: {
            typeManager: {
                borderColor = textColor,
            },
            fieldSize: {columnsCount, rowsCount},
        },
        cellSize
    }: FieldLinesProps
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

export const bindFieldLines = (props: FieldLinesProps) => <FieldLines {...props}/>;
