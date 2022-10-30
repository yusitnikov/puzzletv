import {getLineVector, parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {blackColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";

const radius = 0.15;
const lineWidth = 0.03;

export const Greater = withFieldLayer(FieldLayer.top, ({cells: [greaterCell, lessCell]}: ConstraintProps) => {
    const {left: dx, top: dy} = getLineVector({start: greaterCell, end: lessCell});

    return <g
        transform={`matrix(${dx} ${dy} ${dy} ${-dx} ${(greaterCell.left + lessCell.left) / 2 + 0.5} ${(greaterCell.top + lessCell.top) / 2 + 0.5})`}
    >
        <line
            x1={radius}
            y1={0}
            x2={-radius}
            y2={radius}
            strokeWidth={lineWidth}
            stroke={blackColor}
        />

        <line
            x1={radius}
            y1={0}
            x2={-radius}
            y2={-radius}
            strokeWidth={lineWidth}
            stroke={blackColor}
        />
    </g>;
}) as ConstraintPropsGenericFc;

export const GreaterConstraint = <CellType,>(greaterCellLiteral: PositionLiteral, lessCellLiteral: PositionLiteral): Constraint<CellType> => {
    return ({
        name: "inequality",
        cells: [parsePositionLiteral(greaterCellLiteral), parsePositionLiteral(lessCellLiteral)],
        component: Greater,
        props: undefined,
        isValidCell(cell, digits, [greaterCell, lessCell], {puzzle: {typeManager: {compareCellData}}, state}) {
            const greaterDigit = digits[greaterCell.top]?.[greaterCell.left];
            const lessDigit = digits[lessCell.top]?.[lessCell.left];

            return greaterDigit === undefined || lessDigit === undefined
                || compareCellData(greaterDigit, lessDigit, state, true) > 0;
        },
    });
};
