import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {isValidCellForRegion} from "../region/Region";

export const Renban = withFieldLayer(FieldLayer.regular, ({cells}: ConstraintProps) => <RoundedPolyLine
    points={cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}))}
    strokeWidth={0.15}
    stroke={"#f0f"}
/>);

export const RenbanConstraint = <CellType,>(...cellLiterals: PositionLiteral[]): Constraint<CellType> => {
    const cells = splitMultiLine(parsePositionLiterals(cellLiterals));

    return ({
        name: "renban line",
        cells,
        component: Renban,
        isValidCell(cell, digits, cells, {puzzle, state}) {
            if (!isValidCellForRegion(cells, cell, digits, puzzle, state)) {
                return false;
            }

            const actualDigits = cells
                .map(({top, left}) => digits[top]?.[left])
                .filter(data => data !== undefined)
                .map(data => puzzle.typeManager.getDigitByCellData(data, state));

            return !actualDigits.length || Math.max(...actualDigits) - Math.min(...actualDigits) < cells.length;
        },
    });
};
