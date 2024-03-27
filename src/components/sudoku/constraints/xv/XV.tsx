import {formatSvgPointsArray, parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {blackColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps, ConstraintPropsGenericFc} from "../../../../types/sudoku/Constraint";
import {ComponentType} from "react";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

const radius = 0.2;
const lineWidth = 0.03;

export const XMark: ConstraintPropsGenericFc = observer(function XMark<T extends AnyPTM>({cells: [cell1, cell2]}: ConstraintProps<T>) {
    profiler.trace();

    const left = (cell1.left + cell2.left) / 2 + 0.5;
    const top = (cell1.top + cell2.top) / 2 + 0.5;

    return <>
        <line
            x1={left - radius * 0.7}
            y1={top - radius * 0.7}
            x2={left + radius * 0.7}
            y2={top + radius * 0.7}
            strokeWidth={lineWidth}
            stroke={blackColor}
        />

        <line
            x1={left + radius * 0.7}
            y1={top - radius * 0.7}
            x2={left - radius * 0.7}
            y2={top + radius * 0.7}
            strokeWidth={lineWidth}
            stroke={blackColor}
        />
    </>;
});

export const VMark: ConstraintPropsGenericFc = observer(function VMark<T extends AnyPTM>({cells: [cell1, cell2]}: ConstraintProps<T>) {
    const left = (cell1.left + cell2.left) / 2 + 0.5;
    const top = (cell1.top + cell2.top) / 2 + 0.5;

    return <polyline
        points={formatSvgPointsArray([
            {top: top - radius * 0.7, left: left - radius * 0.7},
            {top: top + radius * 0.7, left},
            {top: top - radius * 0.7, left: left + radius * 0.7},
        ])}
        strokeWidth={lineWidth}
        stroke={blackColor}
        fill={"none"}
    />;
});

const XVConstraint = <T extends AnyPTM>(
    cellLiteral1: PositionLiteral,
    cellLiteral2: PositionLiteral,
    name: string,
    component: ComponentType<ConstraintProps<T>>,
    expectedSum: number,
    layer = FieldLayer.afterLines
): Constraint<T> => {
    const cell1 = parsePositionLiteral(cellLiteral1);
    const cell2 = parsePositionLiteral(cellLiteral2);

    return {
        name,
        cells: [cell1, cell2],
        component: {[layer]: component},
        props: undefined,
        isObvious: true,
        isValidCell(cell, digits, [cell1, cell2], context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const digit1 = digits[cell1.top]?.[cell1.left];
            const digit2 = digits[cell2.top]?.[cell2.left];

            return digit1 === undefined || digit2 === undefined
                || getDigitByCellData(digit1, context, cell1) + getDigitByCellData(digit2, context, cell2) === expectedSum;
        },
        renderSingleCellInUserArea: true,
    };
};

export const XMarkConstraint = <T extends AnyPTM>(cellLiteral1: PositionLiteral, cellLiteral2: PositionLiteral, layer = FieldLayer.afterLines) =>
    XVConstraint<T>(cellLiteral1, cellLiteral2, "X", XMark, 10, layer);

export const VMarkConstraint = <T extends AnyPTM>(cellLiteral1: PositionLiteral, cellLiteral2: PositionLiteral, layer = FieldLayer.afterLines) =>
    XVConstraint<T>(cellLiteral1, cellLiteral2, "V", VMark, 5, layer);
