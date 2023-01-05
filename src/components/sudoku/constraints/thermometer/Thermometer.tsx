import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {splitMultiLine} from "../../../../utils/lines";

export const Thermometer = withFieldLayer(FieldLayer.regular, ({cells: points, color = darkGreyColor}: ConstraintProps) => {
    points = points.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

    return <g opacity={0.5}>
        <circle
            cx={points[0].left}
            cy={points[0].top}
            r={0.4}
            fill={color}
        />

        <RoundedPolyLine
            points={points}
            strokeWidth={0.35}
            stroke={color}
        />
    </g>;
}) as ConstraintPropsGenericFc;

export const ThermometerConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[], color?: string): Constraint<CellType, undefined, ExType, ProcessedExType> => {
    const cells = splitMultiLine(parsePositionLiterals(cellLiterals));

    return ({
        name: "thermometer",
        cells,
        component: Thermometer,
        props: undefined,
        color,
        isObvious: true,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {compareCellData}}, state}) {
            const digit = digits[cell.top][cell.left]!;

            let isBeforeCurrentCell = true;
            for (const constraintCell of cells) {
                const constraintDigit = digits[constraintCell.top]?.[constraintCell.left];

                if (isSamePosition(constraintCell, cell)) {
                    isBeforeCurrentCell = false;
                    continue;
                }

                if (constraintDigit === undefined) {
                    continue;
                }

                const comparison = compareCellData(constraintDigit, digit, state, true);
                if (comparison === 0) {
                    return false;
                }

                const isLowerThanCurrentCell = comparison < 0;
                if (isLowerThanCurrentCell !== isBeforeCurrentCell) {
                    return false;
                }
            }

            return true;
        },
    });
};
