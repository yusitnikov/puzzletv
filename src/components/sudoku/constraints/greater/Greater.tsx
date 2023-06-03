import {getLineVector, parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {blackColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFcMap
} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

const radius = 0.15;
const lineWidth = 0.03;

export const Greater: ConstraintPropsGenericFcMap = {
    [FieldLayer.afterLines]: observer(function Greater<T extends AnyPTM>({cells: [greaterCell, lessCell]}: ConstraintProps<T>) {
        profiler.trace();

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
    }),
};

export const GreaterConstraint = <T extends AnyPTM>(greaterCellLiteral: PositionLiteral, lessCellLiteral: PositionLiteral): Constraint<T> => {
    return ({
        name: "inequality",
        cells: [parsePositionLiteral(greaterCellLiteral), parsePositionLiteral(lessCellLiteral)],
        component: Greater,
        props: undefined,
        isObvious: true,
        isValidCell(cell, digits, [greaterCell, lessCell], context) {
            const greaterDigit = digits[greaterCell.top]?.[greaterCell.left];
            const lessDigit = digits[lessCell.top]?.[lessCell.left];

            return greaterDigit === undefined || lessDigit === undefined
                || context.puzzle.typeManager.compareCellData(greaterDigit, lessDigit, context) > 0;
        },
    });
};
