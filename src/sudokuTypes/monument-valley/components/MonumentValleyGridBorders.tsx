import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {darkGreyColor, textColor} from "../../../components/app/globals";
import {formatSvgPointsArray} from "../../../types/layout/Position";
import {parseMonumentValleyFieldSize} from "../types/MonumentValleyTypeManager";
import {MonumentValleyPTM} from "../types/MonumentValleyPTM";

export const MonumentValleyGridBorders = {
    [FieldLayer.lines]: (
        {
            context: {
                puzzle: {fieldSize},
                state: {processed: {isMyTurn}},
            }
        }: ConstraintProps<MonumentValleyPTM>
    ) => {
        const {gridSize, intersectionSize, columnsCount, rowsCount} = parseMonumentValleyFieldSize(fieldSize);

        return <polygon
            points={formatSvgPointsArray([
                {
                    left: gridSize + 0.001,
                    top: rowsCount - gridSize,
                },
                {
                    left: columnsCount / 2,
                    top: rowsCount - gridSize - (gridSize - intersectionSize * 2) * Math.sqrt(0.75),
                },
                {
                    left: columnsCount - gridSize - 0.001,
                    top: rowsCount - gridSize,
                },
            ])}
            fill={isMyTurn ? textColor : darkGreyColor}
            strokeWidth={0}
        />;
    },
};

export const MonumentValleyGridBordersConstraint = (): Constraint<MonumentValleyPTM> => {
    return {
        name: "grid borders",
        cells: [],
        component: MonumentValleyGridBorders,
        props: undefined,
    };
};
