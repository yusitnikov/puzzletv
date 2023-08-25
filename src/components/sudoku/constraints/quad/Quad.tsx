import {recentInfoColor, textColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, Position, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {ReactElement} from "react";
import {profiler} from "../../../../utils/profiler";
import {useTransformAngle} from "../../../../contexts/TransformContext";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";

export interface QuadProps<CellType> {
    expectedDigits?: CellType[];
    forbiddenDigits?: CellType[];
    isRecent?: boolean;
    radius?: number;
}

export const Quad = {
    [FieldLayer.afterLines]: observer(function Quad<T extends AnyPTM>(
        {
            context,
            cells,
            props,
        }: ConstraintProps<T, QuadProps<T["cell"]>>
    ) {
        profiler.trace();

        return <QuadByData
            context={context}
            cells={cells}
            props={props}
        />;
    }) as <T extends AnyPTM>(props: ConstraintProps<T, QuadProps<T["cell"]>>) => ReactElement,
};

type QuadByDataProps<T extends AnyPTM> = Pick<ConstraintProps<T, QuadProps<T["cell"]>>, "context" | "cells" | "props">;
export const QuadByData = observer(function QuadByData<T extends AnyPTM>(
    {
        context: {puzzle},
        cells: [{top, left}],
        props: {
            expectedDigits = [],
            forbiddenDigits = [],
            isRecent,
            radius = 0.3,
        },
    }: QuadByDataProps<T>
) {
    profiler.trace();

    const {
        typeManager: {
            cellDataComponentType: {component: CellData},
            compensateConstraintDigitAngle,
        },
    } = puzzle;

    const [d1 = {}, d2 = {}, d3 = {}, d4 = {}, ...others]: {digit?: T["cell"], valid?: boolean}[] = [
        ...expectedDigits.map(digit => ({digit, valid: true})),
        ...forbiddenDigits.map(digit => ({digit})),
    ];

    const digits = [d3, d1, d2, d4, ...others];

    let compensationAngle = useTransformAngle();
    if (!compensateConstraintDigitAngle) {
        compensationAngle = 0;
    }

    return <AutoSvg top={top} left={left} angle={-compensationAngle}>
        <circle
            key={"circle"}
            cx={0}
            cy={0}
            r={radius}
            strokeWidth={0.02}
            stroke={isRecent ? recentInfoColor : textColor}
            fill={"white"}
        />

        {digits.map(({digit, valid = false}, index) => {
            if (!digit) {
                return undefined;
            }

            const angle = 2 * Math.PI * (index + 0.5) / digits.length;
            const fontSize = radius * 1.75 / Math.sqrt(digits.length);
            const offset = radius - fontSize / 2;

            return <CellData
                key={`digit-${index}`}
                puzzle={puzzle}
                data={digit}
                size={fontSize}
                top={offset * Math.cos(angle)}
                left={-offset * Math.sin(angle)}
                isInitial={valid}
                isValid={valid}
            />;
        })}
    </AutoSvg>;
}) as <T extends AnyPTM>(props: QuadByDataProps<T>) => ReactElement;

const getQuadCells = ({top, left}: Position): Position[] => [
    {top, left},
    {top: top - 1, left},
    {top, left: left - 1},
    {top: top - 1, left: left - 1},
];

export const QuadConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    expectedDigits: T["cell"][],
    forbiddenDigits: T["cell"][] = [],
    isRecent = false,
    radius = 0.3
): Constraint<T, QuadProps<T["cell"]>> => {
    return ({
        name: "quad",
        cells: getQuadCells(parsePositionLiteral(cellLiteral)),
        props: {
            expectedDigits,
            forbiddenDigits,
            isRecent,
            radius,
        },
        component: Quad,
        isObvious: true,
        isValidCell(cell, digitsMap, cells, context) {
            const {puzzle} = context;
            const {typeManager: {areSameCellData}} = puzzle;

            const data = digitsMap[cell.top][cell.left];

            if (forbiddenDigits.some(forbiddenData => areSameCellData(data, forbiddenData, context, cell, cell))) {
                return false;
            }

            if (expectedDigits.length === 4) {
                let remainingExpectedDigits = [...expectedDigits];

                for (const cell2 of cells) {
                    const cellData = digitsMap[cell2.top]?.[cell2.left];
                    if (cellData === undefined) {
                        continue;
                    }

                    const matchingIndex = remainingExpectedDigits.findIndex(expectedDigit => areSameCellData(cellData, expectedDigit, context, cell2, cell2));
                    if (matchingIndex < 0) {
                        return false;
                    }

                    remainingExpectedDigits.splice(matchingIndex, 1);
                }
            }

            return cells.some(({top, left}) => digitsMap[top]?.[left] === undefined)
                || expectedDigits.every(expectedData => cells.some(
                    (cell2) => areSameCellData(digitsMap[cell2.top][cell2.left]!, expectedData, context, cell2, cell2)
                ));
        },
    });
};

export const QuadConstraintBySolution = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    cellLiteral: PositionLiteral,
    digits: T["cell"][],
    isRecent = false,
    radius = 0.3
): Constraint<T, QuadProps<T["cell"]>> => {
    const cell = parsePositionLiteral(cellLiteral);

    const actualDigits = getQuadCells(cell)
        .map(({top, left}) => context.puzzle.solution?.[top]?.[left])
        .filter(value => value !== undefined)
        .map(value => value!);

    const isGoodDigit = (digit: T["cell"]) => actualDigits.some(actualDigit => context.puzzle.typeManager.areSameCellData(digit, actualDigit, context, cell, cell))

    return QuadConstraint(
        cellLiteral,
        digits.filter(isGoodDigit),
        digits.filter(digit => !isGoodDigit(digit)),
        isRecent,
        radius
    );
};
