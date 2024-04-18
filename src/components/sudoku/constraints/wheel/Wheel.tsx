import {lightGreyColor, textColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {isSamePosition, parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {useTransformAngle} from "../../../../contexts/TransformContext";
import {createRotatableClue} from "../../../../sudokuTypes/rotatable-clues/types/RotatableCluesPuzzleExtension";

const digitRadius = 0.15;
const wheelRadius = Math.SQRT1_2;

export interface WheelProps {
    digits: (number|undefined)[];
}

export const Wheel: ConstraintPropsGenericFcMap<WheelProps> = {
    [FieldLayer.afterLines]: observer(function WheelFc<T extends AnyPTM>(
        {
            cells: [cell, ...digitCells],
            props: {
                digits,
            },
        }: ConstraintProps<T, WheelProps>
    ) {
        profiler.trace();

        const angle = useTransformAngle();

        return <>
            <circle
                cx={cell.left + 0.5}
                cy={cell.top + 0.5}
                r={wheelRadius}
                strokeWidth={0.1}
                stroke={lightGreyColor}
                fill={"none"}
            />

            {digits.map((digit, index) => {
                if (digit === undefined) {
                    return null;
                }

                const {top, left} = digitCells[index];

                return <AutoSvg
                    key={index}
                    top={(cell.top + top) / 2 + 0.5}
                    left={(cell.left + left) / 2 + 0.5}
                    angle={-angle}
                >
                    <circle
                        r={digitRadius}
                        strokeWidth={0}
                        stroke={"none"}
                        fill={"#fff"}
                    />
                    <CenteredText
                        size={digitRadius * 1.75}
                        fill={textColor}
                    >
                        {digit}
                    </CenteredText>
                </AutoSvg>;
            })}
        </>;
    }),
};

export const WheelConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    wheelDigits: (number|undefined)[],
): Constraint<T, WheelProps> => {
    const centerCell = parsePositionLiteral(cellLiteral);
    const {top, left} = centerCell;

    return {
        name: "wheel",
        cells: [
            centerCell,
            {top, left: left - 1},
            {top: top - 1, left},
            {top, left: left + 1},
            {top: top + 1, left},
        ],
        props: {
            digits: wheelDigits,
        },
        component: Wheel,
        isObvious: true,
        isValidCell(cell, digits, cells, context): boolean {
            if (context.puzzle.importOptions?.freeRotation) {
                return true;
            }

            // Check the wheel only when the center digit is filled
            if (!digits[centerCell.top]?.[centerCell.left]) {
                return true;
            }

            const index = cells.findIndex((cell2) => isSamePosition(cell2, cell));
            // Check the value only for the wheel cells
            if (index <= 0) {
                return true;
            }

            const expectedDigit = wheelDigits[index - 1];
            if (expectedDigit === undefined) {
                return true;
            }

            const actualDigit = context.puzzle.typeManager.getDigitByCellData(digits[cell.top][cell.left]!, context, cell);
            return actualDigit === expectedDigit;
        },
        renderSingleCellInUserArea: true,
    };
};

export const createWheel = (cell: PositionLiteral, ...digits: (number|undefined)[]) => createRotatableClue(
    cell,
    0,
    undefined,
    [WheelConstraint(cell, digits)],
);
