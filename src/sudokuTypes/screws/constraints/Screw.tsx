import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {lightGreyColor} from "../../../components/app/globals";
import {observer} from "mobx-react-lite";
import {ScrewsPTM} from "../types/ScrewsPTM";
import {ReactElement} from "react";
import {ScrewsPuzzleExtension} from "../types/ScrewsPuzzleExtension";
import {CellDigits} from "../../../components/sudoku/cell/CellDigits";

const screwColor = lightGreyColor;
const digitSize = 0.5;

interface ScrewProps {
    index: number;
}

const Screw = {
    [FieldLayer.beforeSelection]: observer(function Screw<T extends AnyPTM>({context, props: {index}}: ConstraintProps<ScrewsPTM<T>, ScrewProps>) {
        const offset = context.processedGameStateExtension.screwOffsets[index];

        const {
            initialPosition: {top, left, width, height},
            digits,
        } = (context.puzzle.extension as ScrewsPuzzleExtension<T["cell"]>).screws[index];

        const center = left + width / 2;
        const offsetDigits = digits.map(({digit, position: {top, left}}) => {
            top += 0.5;
            left += 0.5;

            const isRight = left > center;

            return {
                digit,
                top: top + offset,
                left: (left + (isRight ? -0.3 : 0.3) - center) * Math.cos(Math.PI * offset) + center,
            }
        });

        return <g opacity={0.5}>
            <rect
                x={left}
                y={top + offset}
                width={width}
                height={1}
                strokeWidth={0}
                stroke={"none"}
                fill={screwColor}
            />
            <rect
                x={left + 0.5}
                y={top + offset}
                width={width - 1}
                height={height}
                strokeWidth={0}
                stroke={"none"}
                fill={screwColor}
            />

            {offsetDigits.map(
                ({digit, top, left}, index) => <AutoSvg
                    key={index}
                    top={top - digitSize / 2}
                    left={left - digitSize / 2}
                >
                    <CellDigits
                        context={context}
                        size={digitSize}
                        data={{usersDigit: digit}}
                        mainColor={true}
                    />
                </AutoSvg>
            )}
        </g>;
    }) as <T extends AnyPTM>(props: ConstraintProps<ScrewsPTM<T>, ScrewProps>) => ReactElement,
};

export const ScrewConstraint = <T extends AnyPTM>(index: number): Constraint<ScrewsPTM<T>, ScrewProps> => {
    return {
        name: "screw",
        cells: [],
        props: {index},
        component: Screw,
        isObvious: false,
        isValidCell(cell, digits, regionCells, context): boolean {
            const digit = digits[cell.top][cell.left];

            const offset = Math.round(context.processedGameStateExtension.screwOffsets[index]);

            const {
                initialPosition: {top, left, width, height},
                digits: screwDigits,
            } = (context.puzzle.extension as ScrewsPuzzleExtension<T["cell"]>).screws[index];

            if (cell.left < left - 0.6 || cell.left > left + width - 0.4) {
                return true;
            }

            const unscrewedCell: Position = {
                top: cell.top - offset,
                left: offset % 2 === 1
                    // mirror around the center
                    ? 2 * left + width - 1 - cell.left
                    : cell.left
            }

            if (unscrewedCell.top < top - 0.6 || unscrewedCell.top > top + height - 0.4) {
                return true;
            }

            for (const {digit: screwDigit, position} of screwDigits) {
                if (isSamePosition(position, unscrewedCell)) {
                    return context.puzzle.typeManager.areSameCellData(digit, screwDigit, context, position, position);
                }
            }

            return true;
        },
    };
};
