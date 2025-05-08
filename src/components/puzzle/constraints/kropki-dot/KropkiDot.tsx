import { blackColor, textColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/puzzle/GridLayer";
import { parsePositionLiteral, PositionLiteral } from "../../../../types/layout/Position";
import { Constraint, ConstraintProps, ConstraintPropsGenericFc } from "../../../../types/puzzle/Constraint";
import { CenteredText } from "../../../svg/centered-text/CenteredText";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";

export const KropkiDotTag = "kropki-dot";

const radius = 0.15;

export interface KropkiDotProps {
    value?: number | [number, number];
    showValue?: boolean;
}

export const KropkiDot: ConstraintPropsGenericFc<KropkiDotProps> = observer(function KropkiDot<T extends AnyPTM>({
    cells: [cell1, cell2],
    color = blackColor,
    props: { value, showValue = true },
}: ConstraintProps<T, KropkiDotProps>) {
    profiler.trace();

    const top = (cell1.top + cell2.top) / 2 + 0.5;
    const left = (cell1.left + cell2.left) / 2 + 0.5;

    return (
        <>
            <circle cx={left} cy={top} r={radius} strokeWidth={0.02} stroke={blackColor} fill={color} />

            {value && showValue && (
                <CenteredText
                    top={top}
                    left={left}
                    size={radius * (typeof value === "number" ? 1.75 : 1.25)}
                    fill={[blackColor, textColor, "black", "#000", "#000000"].includes(color) ? "white" : blackColor}
                >
                    {typeof value === "number" ? value : value.join(":")}
                </CenteredText>
            )}
        </>
    );
});

export const KropkiDotConstraint = <T extends AnyPTM>(
    cellLiteral1: PositionLiteral,
    cellLiteral2: PositionLiteral,
    isRatio: boolean,
    value?: number | [number, number],
    color = isRatio ? blackColor : "white",
    showValue = true,
    layer = GridLayer.afterLines,
): Constraint<T, KropkiDotProps> => {
    const cell1 = parsePositionLiteral(cellLiteral1);
    const cell2 = parsePositionLiteral(cellLiteral2);

    return {
        name: `${isRatio ? "black" : "white"} kropki dot (${value ?? "-"})`,
        tags: [KropkiDotTag],
        cells: [cell1, cell2],
        color,
        props: {
            value,
            showValue,
        },
        component: { [layer]: KropkiDot },
        isObvious: true,
        isValidCell(cell, digits, [cell1, cell2], context) {
            const {
                puzzle: {
                    typeManager: { getDigitByCellData },
                },
            } = context;

            const data1 = digits[cell1.top]?.[cell1.left];
            const data2 = digits[cell2.top]?.[cell2.left];

            if (data1 === undefined || data2 === undefined) {
                return true;
            }

            const digit1 = getDigitByCellData(data1, context, cell1);
            const digit2 = getDigitByCellData(data2, context, cell2);

            if (!isRatio) {
                return Math.abs(digit1 - digit2) === (value ?? 1);
            }

            const [ratio1, ratio2] = Array.isArray(value) ? value : [1, value ?? 2];
            return digit1 * ratio1 === digit2 * ratio2 || digit2 * ratio1 === digit1 * ratio2;
        },
        renderSingleCellInUserArea: true,
    };
};

export const HeartConstraint = <T extends AnyPTM>(
    cellLiteral1: PositionLiteral,
    cellLiteral2: PositionLiteral,
    showValue = false,
) => KropkiDotConstraint<T>(cellLiteral1, cellLiteral2, true, [2, 3], "#f00", showValue);
