import { RoundedPolyLine } from "../../../svg/rounded-poly-line/RoundedPolyLine";
import { darkGreyColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/sudoku/GridLayer";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../../types/sudoku/Constraint";
import { isSamePosition, parsePositionLiterals, Position, PositionLiteral } from "../../../../types/layout/Position";
import { splitMultiLine } from "../../../../utils/lines";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";
import { LineProps } from "../line/Line";
import { parseColorWithOpacity, rgba } from "../../../../utils/color";

export interface ThermometerProps extends LineProps {
    bulbRadius?: number;
}

export const Thermometer: ConstraintPropsGenericFcMap<ThermometerProps> = {
    [GridLayer.regular]: observer(function Thermometer<T extends AnyPTM>({
        cells: points,
        color = rgba(darkGreyColor, 0.5),
        props: { width = 0.35, bulbRadius = 0.4 },
        context: { puzzleIndex },
    }: ConstraintProps<T, ThermometerProps>) {
        profiler.trace();

        const { rgb, a } = parseColorWithOpacity(color);

        const getPointInfo = ({ top, left }: Position, radius: number) => {
            const cellInfo = puzzleIndex.allCells[top]?.[left];
            return cellInfo
                ? { ...cellInfo.center, radius: radius * cellInfo.bounds.userArea.width }
                : { left: left + 0.5, top: top + 0.5, radius };
        };

        const startPoint = getPointInfo(points[0], bulbRadius);

        return (
            <g opacity={a}>
                <circle cx={startPoint.left} cy={startPoint.top} r={startPoint.radius} fill={rgb} />

                <RoundedPolyLine
                    points={points.map((point) => getPointInfo(point, width / 2))}
                    strokeWidth={width}
                    stroke={rgb}
                />
            </g>
        );
    }),
};

export const ThermometerConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    slow = false,
    color?: string,
    width?: number,
    bulbRadius?: number,
): Constraint<T, ThermometerProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "thermometer",
        cells,
        component: Thermometer,
        props: { width, bulbRadius },
        color,
        isObvious: true,
        isValidCell(cell, digits, cells, context) {
            const digit = digits[cell.top][cell.left]!;

            let isBeforeCurrentCell = true;
            for (const constraintCell of cells) {
                const constraintDigit = digits[constraintCell.top]?.[constraintCell.left];

                if (isSamePosition(constraintCell, cell)) {
                    isBeforeCurrentCell = false;
                    continue;
                }

                if (constraintDigit === undefined) {
                    continue;
                }

                const comparison = context.puzzle.typeManager.compareCellData(constraintDigit, digit, context);
                if (comparison === 0) {
                    if (slow) {
                        continue;
                    } else {
                        return false;
                    }
                }

                const isLowerThanCurrentCell = comparison < 0;
                if (isLowerThanCurrentCell !== isBeforeCurrentCell) {
                    return false;
                }
            }

            return true;
        },
    };
};
