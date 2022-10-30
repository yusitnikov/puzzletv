import {recentInfoColor, textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, Position, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {GivenDigitsMap} from "../../../../types/sudoku/GivenDigitsMap";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {ReactElement} from "react";

export interface QuadProps<CellType> {
    expectedDigits?: CellType[];
    forbiddenDigits?: CellType[];
    isRecent?: boolean;
    radius?: number;
}

export const Quad = withFieldLayer(
    FieldLayer.top,
    <CellType, ExType, ProcessedExType>(
        {
            context,
            cells,
            props,
        }: ConstraintProps<CellType, QuadProps<CellType>, ExType, ProcessedExType>
    ) => <QuadByData
        context={context}
        cells={cells}
        props={props}
    />
) as <CellType, ExType, ProcessedExType>(props: ConstraintProps<CellType, QuadProps<CellType>, ExType, ProcessedExType>) => ReactElement;

export const QuadByData = <CellType, ExType, ProcessedExType>(
    {
        context: {puzzle: {typeManager: {cellDataComponentType: {component: CellData}}}},
        cells: [{top, left}],
        props: {
            expectedDigits = [],
            forbiddenDigits = [],
            isRecent,
            radius = 0.3,
        },
    }: Pick<ConstraintProps<CellType, QuadProps<CellType>, ExType, ProcessedExType>, "context" | "cells" | "props">
) => {
    const [d1 = {}, d2 = {}, d3 = {}, d4 = {}, ...others]: {digit?: CellType, valid?: boolean}[] = [
        ...expectedDigits.map(digit => ({digit, valid: true})),
        ...forbiddenDigits.map(digit => ({digit})),
    ];

    const digits = [d3, d1, d2, d4, ...others];

    return <>
        <circle
            key={"circle"}
            cx={left}
            cy={top}
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
                data={digit}
                size={fontSize}
                top={top + offset * Math.cos(angle)}
                left={left - offset * Math.sin(angle)}
                isInitial={valid}
                isValid={valid}
            />;
        })}
    </>;
};

const getQuadCells = ({top, left}: Position): Position[] => [
    {top, left},
    {top: top - 1, left},
    {top, left: left - 1},
    {top: top - 1, left: left - 1},
];

export const QuadConstraint = <CellType, ExType, ProcessedExType>(
    cellLiteral: PositionLiteral,
    expectedDigits: CellType[],
    forbiddenDigits: CellType[] = [],
    isRecent = false,
    radius = 0.3
): Constraint<CellType, QuadProps<CellType>, ExType, ProcessedExType> => {
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
        isValidCell({top, left}, digitsMap, cells, {puzzle: {typeManager: {areSameCellData}}, state}) {
            const data = digitsMap[top][left];

            if (forbiddenDigits.some(forbiddenData => areSameCellData(data, forbiddenData, state, true))) {
                return false;
            }

            if (expectedDigits.length === 4) {
                let remainingExpectedDigits = [...expectedDigits];

                for (const {top, left} of cells) {
                    const cellData = digitsMap[top]?.[left];
                    if (cellData === undefined) {
                        continue;
                    }

                    const matchingIndex = remainingExpectedDigits.findIndex(expectedDigit => areSameCellData(cellData, expectedDigit, state, true));
                    if (matchingIndex < 0) {
                        return false;
                    }

                    remainingExpectedDigits.splice(matchingIndex, 1);
                }
            }

            return cells.some(({top, left}) => digitsMap[top]?.[left] === undefined)
                || expectedDigits.every(expectedData => cells.some(
                ({top, left}) => areSameCellData(digitsMap[top][left]!, expectedData, state, true)
            ));
        },
    });
};

export const QuadConstraintBySolution = <CellType, ExType, ProcessedExType>(
    {
        puzzle: {typeManager: {areSameCellData}},
        state
    }: PuzzleContext<CellType, ExType, ProcessedExType>,
    cellLiteral: PositionLiteral,
    digits: CellType[],
    solution: GivenDigitsMap<CellType>,
    isRecent = false,
    radius = 0.3
): Constraint<CellType, QuadProps<CellType>, ExType, ProcessedExType> => {
    const actualDigits = getQuadCells(parsePositionLiteral(cellLiteral))
        .map(({top, left}) => solution[top]?.[left])
        .filter(value => value !== undefined)
        .map(value => value!);

    const isGoodDigit = (digit: CellType) => actualDigits.some(actualDigit => areSameCellData(digit, actualDigit, state, true))

    return QuadConstraint(
        cellLiteral,
        digits.filter(isGoodDigit),
        digits.filter(digit => !isGoodDigit(digit)),
        isRecent,
        radius
    );
};
