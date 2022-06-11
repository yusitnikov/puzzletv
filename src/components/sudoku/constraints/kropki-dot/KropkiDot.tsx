import {blackColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {CenteredText} from "../../../svg/centered-text/CenteredText";

export interface KropkiDotProps {
    isFilled?: boolean;
    value?: number;
}

export const KropkiDot = withFieldLayer(FieldLayer.top, ({cells: [cell1, cell2], isFilled, value}: ConstraintProps<any, KropkiDotProps>) => {
    const top = (cell1.top + cell2.top) / 2 + 0.5;
    const left = (cell1.left + cell2.left) / 2 + 0.5;

    return <>
        <circle
            cx={left}
            cy={top}
            r={0.2}
            strokeWidth={0.02}
            stroke={blackColor}
            fill={isFilled ? blackColor : "white"}
        />

        {value && <CenteredText
            top={top}
            left={left}
            size={0.35}
            fill={isFilled ? "white" : blackColor}
        >
            {value}
        </CenteredText>}
    </>;
});

export const KropkiDotConstraint = <CellType,>(
    cellLiteral1: PositionLiteral,
    cellLiteral2: PositionLiteral,
    isFilled: boolean,
    value?: number
): Constraint<CellType, KropkiDotProps> => {
    const cell1 = parsePositionLiteral(cellLiteral1);
    const cell2 = parsePositionLiteral(cellLiteral2);

    const finalValue = value ?? (isFilled ? 2 : 1);

    return ({
        name: `${isFilled ? "black" : "white"} kropki dot (${value ?? "-"})`,
        cells: [cell1, cell2],
        isFilled,
        value,
        component: KropkiDot,
        isValidCell(cell, digits, [cell1, cell2], {puzzle: {typeManager: {getDigitByCellData}}, state}) {
            const data1 = digits[cell1.top]?.[cell1.left];
            const data2 = digits[cell2.top]?.[cell2.left];

            if (data1 === undefined || data2 === undefined) {
                return true;
            }

            const digit1 = getDigitByCellData(data1, state);
            const digit2 = getDigitByCellData(data2, state);

            return isFilled
                ? (digit1 === digit2 * finalValue || digit2 === digit1 * finalValue)
                : Math.abs(digit1 - digit2) === finalValue;
        },
    });
};
