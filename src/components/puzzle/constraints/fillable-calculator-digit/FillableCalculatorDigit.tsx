import { darkGreyColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/puzzle/GridLayer";
import { parsePositionLiteral, PositionLiteral } from "../../../../types/layout/Position";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../../types/puzzle/Constraint";
import { RegularCalculatorDigit } from "../../digit/CalculatorDigit";
import { mainDigitCoeff } from "../../cell/CellDigits";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";

interface FillableCalculatorDigitProps {
    digit: number;
}

export const FillableCalculatorDigit: ConstraintPropsGenericFcMap<FillableCalculatorDigitProps> = {
    [GridLayer.beforeSelection]: observer(function FillableCalculatorDigit<T extends AnyPTM>({
        context,
        cells: [{ left, top }],
        props: { digit },
    }: ConstraintProps<T, FillableCalculatorDigitProps>) {
        profiler.trace();

        const {
            puzzle: {
                typeManager: {
                    cellDataComponentType: { cellSizeCoeff = mainDigitCoeff },
                },
            },
        } = context;

        return (
            <RegularCalculatorDigit
                context={context}
                left={left + 0.5}
                top={top + 0.5}
                size={cellSizeCoeff}
                digit={digit}
                color={darkGreyColor}
            />
        );
    }),
};

const allowedFillableOptions: Record<number, number[]> = {
    1: [0, 3, 4, 7, 9],
    3: [9],
    4: [9],
    5: [6, 9],
    7: [0, 3, 9],
};

export const FillableCalculatorDigitConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    digit: number,
): Constraint<T, FillableCalculatorDigitProps> => {
    const cell = parsePositionLiteral(cellLiteral);

    return {
        name: "fillable calculator digit",
        cells: [cell],
        component: FillableCalculatorDigit,
        renderSingleCellInUserArea: true,
        props: { digit },
        isObvious: true,
        isValidCell(cell, digits, _, context) {
            const {
                puzzle: {
                    typeManager: { getDigitByCellData },
                },
            } = context;

            const actualDigit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);

            return (
                actualDigit === digit ||
                actualDigit === 8 ||
                (digit in allowedFillableOptions && allowedFillableOptions[digit].includes(actualDigit))
            );
        },
    };
};
