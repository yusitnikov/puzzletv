import {textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Line, parsePositionLiteral, Position, PositionLiteral} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {ArrowEnd} from "../../../svg/arrow-end/ArrowEnd";
import {useDigitComponentType} from "../../../../contexts/DigitComponentTypeContext";
import {FieldSize} from "../../../../types/sudoku/FieldSize";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

const lineWidth = 0.03;

export interface LittleKillerProps {
    direction: Position;
    sum?: number;
}

export const LittleKiller = withFieldLayer(FieldLayer.regular, <T extends AnyPTM>(
    {cells: [{top, left}], props: {direction, sum}}: ConstraintProps<T, LittleKillerProps>
) => {
    const {
        svgContentComponent: DigitSvgContent,
    } = useDigitComponentType();

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

    return <>
        <line
            x1={line.start.left}
            y1={line.start.top}
            x2={line.end.left}
            y2={line.end.top}
            strokeWidth={lineWidth}
            stroke={textColor}
        />

        <ArrowEnd
            position={line.end}
            direction={direction}
            arrowSize={0.1}
            lineWidth={lineWidth}
            color={textColor}
        />

        {sum !== undefined && <DigitSvgContent
            digit={sum}
            size={0.5}
            left={left - 0.5 * direction.left}
            top={top - 0.5 * direction.top}
        />}
    </>;
}) as ConstraintPropsGenericFc<LittleKillerProps>;

export const LittleKillerConstraint = <T extends AnyPTM>(
    startCellLiteral: PositionLiteral,
    directionLiteral: PositionLiteral,
    {rowsCount, columnsCount}: FieldSize<T>,
    sum?: number
): Constraint<T, LittleKillerProps> => {
    const startCell = parsePositionLiteral(startCellLiteral);
    const direction = parsePositionLiteral(directionLiteral);

    const cells: Position[] = [];
    for (let {top, left} = startCell; top >= 0 && top < rowsCount && left >= 0 && left < columnsCount; top += direction.top, left += direction.left) {
        cells.push({top, left});
    }

    return ({
        name: "arrow",
        cells,
        props: {
            direction,
            sum,
        },
        component: LittleKiller,
        isValidCell(_, digits, cells, context) {
            if (sum === undefined) {
                return true;
            }

            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

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
};
