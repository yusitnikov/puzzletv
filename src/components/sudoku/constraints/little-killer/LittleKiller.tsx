import {textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    getLineVector,
    Line,
    parsePositionLiterals,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {ArrowEnd} from "../../../svg/arrow-end/ArrowEnd";
import {useDigitComponentType} from "../../../../contexts/DigitComponentTypeContext";

const lineWidth = 0.03;

export interface LittleKillerProps {
    sum: number;
}

export const LittleKiller = withFieldLayer(FieldLayer.regular, ({cells, sum}: ConstraintProps<any, LittleKillerProps>) => {
    const {
        svgContentComponent: DigitSvgContent,
    } = useDigitComponentType();

    cells = cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

    const direction = getLineVector({start: cells[0], end: cells[1]});

    let {top, left} = cells[0];
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

        <DigitSvgContent
            digit={sum}
            size={0.5}
            left={left - 0.5 * direction.left}
            top={top - 0.5 * direction.top}
        />
    </>;
});

export const LittleKillerConstraint = <CellType,>(
    cell1Literal: PositionLiteral,
    cell2Literal: PositionLiteral,
    sum: number
): Constraint<CellType, LittleKillerProps> => {
    const cells = splitMultiLine(parsePositionLiterals([cell1Literal, cell2Literal]));

    return ({
        name: "arrow",
        cells,
        sum,
        component: LittleKiller,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {getDigitByCellData}}, state}) {
            let actualSum = 0;

            for (const {top, left} of cells) {
                const digit = digits[top]?.[left];

                if (digit === undefined) {
                    return true;
                }

                actualSum += getDigitByCellData(digit, state);
            }

            return actualSum === sum;
        },
    });
};
