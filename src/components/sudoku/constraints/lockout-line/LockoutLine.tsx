import {
    arrayContainsPosition,
    formatSvgPointsArray,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {darkBlueColor, lighterMutedBlueColor, mutedBlueColor, purpleColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";

const diamondWidth = 0.4;
const diamondLineWidth = 0.05;
export const lockoutLineLineColor = mutedBlueColor;
export const lockoutLineDiamondLineColor = darkBlueColor;
export const lockoutLineDiamondBackgroundColor = lighterMutedBlueColor;

const LockoutLineDiamond = observer(function LockoutLineDiamond(center: Position) {
    return <polygon
        points={formatSvgPointsArray([
            {top: 1, left: 0},
            {top: 0, left: 1},
            {top: -1, left: 0},
            {top: 0, left: -1},
        ].map(({top, left}) => ({
            top: center.top + diamondWidth * top,
            left: center.left + diamondWidth * left,
        })))}
        strokeWidth={diamondLineWidth}
        stroke={lockoutLineDiamondLineColor}
        fill={lockoutLineDiamondBackgroundColor}
    />;
});

export const LockoutLine: ConstraintPropsGenericFcMap = {
    [FieldLayer.regular]: observer(function InBetweenLine<T extends AnyPTM>({cells}: ConstraintProps<T>) {
        profiler.trace();

        cells = cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

        return <>
            <RoundedPolyLine
                points={cells}
                strokeWidth={0.1}
                stroke={lockoutLineLineColor}
            />
            <LockoutLineDiamond {...cells[0]}/>
            <LockoutLineDiamond {...cells[cells.length - 1]}/>
        </>;
    }),
};

export const LockoutLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    display = true,
    split = true,
): Constraint<T> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "lockout line",
        cells,
        color: purpleColor,
        component: display ? LockoutLine : undefined,
        props: undefined,
        isObvious: false,
        isValidCell(cell, digits, cells, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const edgeCells = [cells[0], cells[cells.length - 1]];
            const edgeData = edgeCells.map((cell) => {
                const data = digits[cell.top]?.[cell.left];
                return data === undefined ? undefined : getDigitByCellData(data, context, cell);
            });
            if (edgeData.some((data) => data === undefined)) {
                return true;
            }
            const [minDigit, maxDigit] = edgeData
                .map((data) => getDigitByCellData(data!, context, cell))
                .sort();

            const areEdgeDigitsOk = maxDigit >= minDigit + 4;
            if (arrayContainsPosition(edgeCells, cell)) {
                return areEdgeDigitsOk;
            }

            if (!areEdgeDigitsOk) {
                // no sense validating digits on the line when the edge digits are invalid
                return true;
            }

            const digit = getDigitByCellData(digits[cell.top][cell.left], context, cell);
            return digit < minDigit || digit > maxDigit;
        },
    };
};
