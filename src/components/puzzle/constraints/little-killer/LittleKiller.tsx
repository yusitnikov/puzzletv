import { textColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/puzzle/GridLayer";
import {
    Line,
    parsePositionLiteral,
    parsePositionLiterals,
    Position,
    PositionLiteral,
} from "../../../../types/layout/Position";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../../types/puzzle/Constraint";
import { ArrowEnd } from "../../../svg/arrow-end/ArrowEnd";
import { GridSize } from "../../../../types/puzzle/GridSize";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";
import { getLineCellsByOutsideCell } from "../outside-clue/OutsideClue";

const lineWidth = 0.03;

export interface LittleKillerProps {
    direction: Position;
    sum?: number;
    lineColor?: string;
}

export const LittleKiller: ConstraintPropsGenericFcMap<LittleKillerProps> = {
    [GridLayer.regular]: observer(function LittleKiller<T extends AnyPTM>({
        context,
        cells: [{ top, left }],
        color: fontColor = textColor,
        props: { direction, sum, lineColor = textColor },
    }: ConstraintProps<T, LittleKillerProps>) {
        profiler.trace();

        const {
            puzzle: {
                typeManager: {
                    digitComponentType: { svgContentComponent: DigitSvgContent },
                },
            },
        } = context;

        top += 0.5;
        left += 0.5;
        top -= 0.5 * direction.top;
        left -= 0.5 * direction.left;

        const line: Line = {
            start: {
                top: top - 0.25 * direction.top,
                left: left - 0.25 * direction.left,
            },
            end: {
                top: top - 0.05 * direction.top,
                left: left - 0.05 * direction.left,
            },
        };

        return (
            <>
                <line
                    x1={line.start.left}
                    y1={line.start.top}
                    x2={line.end.left}
                    y2={line.end.top}
                    strokeWidth={lineWidth}
                    stroke={lineColor}
                />

                <ArrowEnd
                    position={line.end}
                    direction={direction}
                    arrowSize={0.1}
                    lineWidth={lineWidth}
                    color={lineColor}
                />

                {sum !== undefined && (
                    <DigitSvgContent
                        context={context}
                        color={fontColor}
                        digit={sum}
                        size={0.5}
                        left={left - 0.5 * direction.left}
                        top={top - 0.5 * direction.top}
                    />
                )}
            </>
        );
    }),
};

export const LittleKillerConstraint = <T extends AnyPTM>(
    startCell: PositionLiteral,
    direction: PositionLiteral,
    gridSize: GridSize,
    sum?: number,
    color?: string,
    lineColor = color,
) =>
    LittleKillerConstraintByCells<T>(
        getLineCellsByOutsideCell(startCell, gridSize, direction),
        direction,
        sum,
        color,
        lineColor,
    );

export const LittleKillerConstraintByCells = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    directionLiteral: PositionLiteral,
    sum?: number,
    color?: string,
    lineColor = color,
): Constraint<T, LittleKillerProps> => ({
    name: "little killer",
    cells: parsePositionLiterals(cellLiterals),
    color,
    props: {
        direction: parsePositionLiteral(directionLiteral),
        sum,
        lineColor,
    },
    component: LittleKiller,
    isValidCell(_, digits, cells, context) {
        if (sum === undefined) {
            return true;
        }

        const {
            puzzle: {
                typeManager: { getDigitByCellData },
            },
        } = context;

        let actualSum = 0;

        for (const cell of cells) {
            const digit = digits[cell.top]?.[cell.left];

            if (digit === undefined) {
                return true;
            }

            actualSum += getDigitByCellData(digit, context, cell);
        }

        return actualSum === sum;
    },
});
