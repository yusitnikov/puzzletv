import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";

export const GermanWhispers = withFieldLayer(FieldLayer.regular, ({cells}: ConstraintProps) => <RoundedPolyLine
    points={cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}))}
    strokeWidth={0.15}
    stroke={"#0f0"}
/>);

export const GermanWhispersConstraint = <CellType,>(...cellLiterals: PositionLiteral[]): Constraint<CellType> => {
    const cells = splitMultiLine(parsePositionLiterals(cellLiterals));

    return ({
        name: "german whispers",
        cells,
        component: GermanWhispers,
        isValidCell(cell, digits, cells, {typeManager: {getDigitByCellData}}, state) {
            const digit = getDigitByCellData(digits[cell.top][cell.left]!, state);

            const index = cells.findIndex(constraintCell => isSamePosition(constraintCell, cell));
            const prevCell = cells[index - 1];
            const nextCell = cells[index + 1];
            const prevDigit = prevCell && digits[prevCell.top]?.[prevCell.left];
            const nextDigit = nextCell && digits[nextCell.top]?.[nextCell.left];

            return (prevDigit === undefined || Math.abs(getDigitByCellData(prevDigit, state) - digit) >= 5)
                && (nextDigit === undefined || Math.abs(getDigitByCellData(nextDigit, state) - digit) >= 5);
        },
    });
};
