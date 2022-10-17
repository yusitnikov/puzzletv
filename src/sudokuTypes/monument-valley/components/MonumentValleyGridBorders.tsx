import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {RoundedPolyLine} from "../../../components/svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor, getRegionBorderWidth, textColor} from "../../../components/app/globals";
import {Position} from "../../../types/layout/Position";
import {parseMonumentValleyFieldSize} from "../types/MonumentValleyTypeManager";

export const MonumentValleyGridBorders = withFieldLayer(FieldLayer.lines, (
    {
        context: {
            puzzle: {
                fieldSize,
                typeManager: {transformCoords},
            },
            cellSize,
            state: {isMyTurn},
        }
    }: ConstraintProps
) => {
    const {gridSize, intersectionSize, columnsCount, rowsCount} = parseMonumentValleyFieldSize(fieldSize);
    const borderWidth = getRegionBorderWidth(cellSize);

    return <RoundedPolyLine
        points={([] as Position[])}
        stroke={isMyTurn ? textColor : darkGreyColor}
        strokeWidth={borderWidth}
    />;
});

export const MonumentValleyGridBordersConstraint = (): Constraint<number> => {
    return {
        name: "grid borders",
        cells: [],
        component: MonumentValleyGridBorders,
    };
};
