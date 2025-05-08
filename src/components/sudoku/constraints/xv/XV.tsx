import { formatSvgPointsArray, parsePositionLiteral, PositionLiteral } from "../../../../types/layout/Position";
import { blackColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/sudoku/GridLayer";
import { Constraint, ConstraintProps, ConstraintPropsGenericFc } from "../../../../types/sudoku/Constraint";
import { ComponentType } from "react";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";
import { AutoSvg } from "../../../svg/auto-svg/AutoSvg";
import { useCompensationAngle } from "../../../../contexts/TransformContext";

const radius = 0.2;
const lineWidth = 0.04;

export const XMark: ConstraintPropsGenericFc = observer(function XMark<T extends AnyPTM>({
    cells: [cell1, cell2],
    context,
}: ConstraintProps<T>) {
    profiler.trace();

    const angle = useCompensationAngle(context);

    return (
        <AutoSvg left={(cell1.left + cell2.left) / 2 + 0.5} top={(cell1.top + cell2.top) / 2 + 0.5} angle={-angle}>
            <circle r={radius * 1.2} opacity={0.7} fill={"#fff"} strokeWidth={0} />

            <line
                x1={-radius * 0.7}
                y1={-radius * 0.7}
                x2={radius * 0.7}
                y2={radius * 0.7}
                strokeWidth={lineWidth}
                stroke={blackColor}
            />

            <line
                x1={radius * 0.7}
                y1={-radius * 0.7}
                x2={-radius * 0.7}
                y2={radius * 0.7}
                strokeWidth={lineWidth}
                stroke={blackColor}
            />
        </AutoSvg>
    );
});

export const VMark: ConstraintPropsGenericFc = observer(function VMark<T extends AnyPTM>({
    cells: [cell1, cell2],
    context,
}: ConstraintProps<T>) {
    profiler.trace();

    const angle = useCompensationAngle(context);

    return (
        <AutoSvg left={(cell1.left + cell2.left) / 2 + 0.5} top={(cell1.top + cell2.top) / 2 + 0.5} angle={-angle}>
            <circle r={radius * 1.2} opacity={0.7} fill={"#fff"} strokeWidth={0} />

            <polyline
                points={formatSvgPointsArray([
                    { top: -radius * 0.7, left: -radius * 0.7 },
                    { top: radius * 0.7, left: 0 },
                    { top: -radius * 0.7, left: radius * 0.7 },
                ])}
                strokeWidth={lineWidth}
                stroke={blackColor}
                fill={"none"}
            />
        </AutoSvg>
    );
});

const XVConstraint = <T extends AnyPTM>(
    cellLiteral1: PositionLiteral,
    cellLiteral2: PositionLiteral,
    name: string,
    component: ComponentType<ConstraintProps<T>>,
    expectedSum: number,
    layer = GridLayer.afterLines,
): Constraint<T> => {
    const cell1 = parsePositionLiteral(cellLiteral1);
    const cell2 = parsePositionLiteral(cellLiteral2);

    return {
        name,
        cells: [cell1, cell2],
        component: { [layer]: component },
        props: undefined,
        isObvious: true,
        isValidCell(cell, digits, [cell1, cell2], context) {
            const {
                puzzle: {
                    typeManager: { getDigitByCellData },
                },
            } = context;

            const digit1 = digits[cell1.top]?.[cell1.left];
            const digit2 = digits[cell2.top]?.[cell2.left];

            return (
                digit1 === undefined ||
                digit2 === undefined ||
                getDigitByCellData(digit1, context, cell1) + getDigitByCellData(digit2, context, cell2) === expectedSum
            );
        },
        renderSingleCellInUserArea: true,
    };
};

export const XMarkConstraint = <T extends AnyPTM>(
    cellLiteral1: PositionLiteral,
    cellLiteral2: PositionLiteral,
    layer = GridLayer.afterLines,
) => XVConstraint<T>(cellLiteral1, cellLiteral2, "X", XMark, 10, layer);

export const VMarkConstraint = <T extends AnyPTM>(
    cellLiteral1: PositionLiteral,
    cellLiteral2: PositionLiteral,
    layer = GridLayer.afterLines,
) => XVConstraint<T>(cellLiteral1, cellLiteral2, "V", VMark, 5, layer);
