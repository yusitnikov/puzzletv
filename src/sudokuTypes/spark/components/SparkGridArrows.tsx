import { textColor } from "../../../components/app/globals";
import { Position } from "../../../types/layout/Position";
import { parseSparkGridSize } from "../types/SparkTypeManager";
import { NumberPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { CosmeticArrowConstraint } from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import { GridSize } from "../../../types/sudoku/GridSize";

const length = 1.5;
const padding = 0.25;
const headSize = 0.2;
const width = 0.05;
const SparkGridArrowConstraint = ({ top, left }: Position, angle: number) => {
    const radAngle = angle * (Math.PI / 180);

    return CosmeticArrowConstraint<NumberPTM>(
        [
            {
                left: left + Math.cos(radAngle) * (length / 2) - 0.5,
                top: top + Math.sin(radAngle) * (length / 2) - 0.5,
            },
        ],
        length,
        headSize,
        textColor,
        width,
        undefined,
        undefined,
        angle,
    );
};
export const SparkGridArrowsConstraint = (originalGridSize: Required<GridSize>) => {
    const { gridSize, realRowsCount, columnsCount } = parseSparkGridSize(originalGridSize);

    return [
        SparkGridArrowConstraint({ top: gridSize, left: -padding }, -90),
        SparkGridArrowConstraint({ top: gridSize, left: -padding }, 90),
        SparkGridArrowConstraint({ top: gridSize, left: columnsCount + padding }, -90),
        SparkGridArrowConstraint({ top: gridSize, left: columnsCount + padding }, 90),
        SparkGridArrowConstraint({ top: -padding, left: gridSize }, 0),
        SparkGridArrowConstraint({ top: -padding, left: gridSize }, 180),
        SparkGridArrowConstraint({ top: realRowsCount + padding, left: gridSize }, 180),
        SparkGridArrowConstraint({ top: realRowsCount + padding, left: columnsCount - gridSize }, 0),
        SparkGridArrowConstraint({ top: gridSize, left: gridSize * 2 + padding }, -90),
        SparkGridArrowConstraint({ top: -padding, left: columnsCount - gridSize }, 0),
    ];
};
