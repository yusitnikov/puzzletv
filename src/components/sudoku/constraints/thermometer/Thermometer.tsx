import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {isSamePosition, parsePositionLiterals, Position, PositionLiteral} from "../../../../types/layout/Position";
import {splitMultiLine} from "../../../../utils/lines";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

export const Thermometer: ConstraintPropsGenericFcMap = {
    [FieldLayer.regular]: observer(function Thermometer<T extends AnyPTM>(
        {
            cells: points,
            color = darkGreyColor,
            context: {puzzleIndex},
        }: ConstraintProps<T>
    ) {
        profiler.trace();

        const getPointInfo = ({top, left}: Position, radius: number) => {
            const cellInfo = puzzleIndex.allCells[top]?.[left];
            return cellInfo
                ? {...cellInfo.center, radius: radius * cellInfo.bounds.userArea.width}
                : {left: left + 0.5, top: top + 0.5, radius};
        };

        const startPoint = getPointInfo(points[0], 0.4);

        return <g opacity={0.5}>
            <circle
                cx={startPoint.left}
                cy={startPoint.top}
                r={startPoint.radius}
                fill={color}
            />

            <RoundedPolyLine
                points={points.map((point) => getPointInfo(point, 0.175))}
                strokeWidth={0.35}
                stroke={color}
            />
        </g>;
    }),
};

export const ThermometerConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    color?: string,
    split = true,
): Constraint<T> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return ({
        name: "thermometer",
        cells,
        component: Thermometer,
        props: undefined,
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
                    return false;
                }

                const isLowerThanCurrentCell = comparison < 0;
                if (isLowerThanCurrentCell !== isBeforeCurrentCell) {
                    return false;
                }
            }

            return true;
        },
    });
};
