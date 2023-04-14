import {recentInfoColor, textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {isSamePosition, parsePositionLiteral, Position, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {GivenDigitsMap} from "../../../../types/sudoku/GivenDigitsMap";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {useAutoIncrementId} from "../../../../hooks/useAutoIncrementId";
import {Fragment, ReactElement} from "react";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

const radius = 0.3;

export enum QuadleDigitType {
    here = "#74c46d",
    elsewhere = "#c9b458",
    nowhere = "#808080",
    unknown = "#fff",
}

export interface QuadleDigit<CellType> {
    digit: CellType;
    type: QuadleDigitType;
}

export interface QuadleProps<CellType> {
    digits: QuadleDigit<CellType>[];
    isRecent?: boolean;
}

export const Quadle = withFieldLayer(
    FieldLayer.top,
    <T extends AnyPTM>(
        {
            context,
            cells,
            props,
        }: ConstraintProps<T, QuadleProps<T["cell"]>>
    ) => <QuadleByData
        context={context}
        cells={cells}
        props={props}
    />
) as <T extends AnyPTM>(props: ConstraintProps<T, QuadleProps<T["cell"]>>) => ReactElement;

export const QuadleByData = <T extends AnyPTM>(
    {
        context: {puzzle},
        cells,
        props: {digits, isRecent},
    }: Pick<ConstraintProps<T, QuadleProps<T["cell"]>>, "context" | "cells" | "props">
) => {
    const {typeManager: {cellDataComponentType: {component: CellData}}} = puzzle;

    const id = "clipPath" + useAutoIncrementId();

    const {top, left} = cells[cells.length - 1];

    return <>
        <defs>
            <clipPath id={id}>
                <circle
                    cx={left}
                    cy={top}
                    r={radius}
                    strokeWidth={0}
                />
            </clipPath>
        </defs>

        <g clipPath={`url(#${id})`}>
            <circle
                cx={left}
                cy={top}
                r={radius}
                stroke={"none"}
                strokeWidth={0}
                fill={digits.length === 4 ? QuadleDigitType.nowhere : QuadleDigitType.unknown}
            />

            {digits.map(({digit, type}, index) => {
                const fontSize = radius * 1.75 / 2;
                const offset = (radius - fontSize / 2) / Math.SQRT2;
                const {top: topOffset, left: leftOffset} = [
                    {top: -1, left: -1},
                    {top: -1, left: 1},
                    {top: 1, left: -1},
                    {top: 1, left: 1},
                ][index];

                return <Fragment key={`digit-${index}`}>
                    <rect
                        y={top + radius * (topOffset - 1) / 2}
                        x={left + radius * (leftOffset - 1) / 2}
                        width={radius}
                        height={radius}
                        fill={type}
                        stroke={"none"}
                        strokeWidth={0}
                    />

                    <CellData
                        puzzle={puzzle}
                        data={digit}
                        size={fontSize}
                        top={top + offset * topOffset}
                        left={left + offset * leftOffset}
                        customColor={type === QuadleDigitType.unknown ? "black" : "white"}
                    />
                </Fragment>;
            })}

            <line
                x1={left - radius}
                y1={top}
                x2={left + radius}
                y2={top}
                strokeWidth={0.02}
                // stroke={lightGreyColor}
            />

            <line
                x1={left}
                y1={top - radius}
                x2={left}
                y2={top + radius}
                strokeWidth={0.01}
                // stroke={lightGreyColor}
            />
        </g>

        <circle
            cx={left}
            cy={top}
            r={radius}
            strokeWidth={0.01}
            stroke={isRecent ? recentInfoColor : textColor}
            fill={"none"}
        />
    </>;
};

const getQuadCells = ({top, left}: Position): Position[] => [
    {top: top - 1, left: left - 1},
    {top: top - 1, left},
    {top, left: left - 1},
    {top, left},
];

export const QuadleConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    digits: QuadleDigit<T["cell"]>[],
    isRecent = false
): Constraint<T, QuadleProps<T["cell"]>> => {
    return ({
        name: "quadle",
        cells: getQuadCells(parsePositionLiteral(cellLiteral)),
        props: {
            digits,
            isRecent,
        },
        component: Quadle,
        isObvious: true,
        isValidCell(cell, digitsMap, cells, {puzzle, state}) {
            const {typeManager: {areSameCellData}} = puzzle;

            const data = digitsMap[cell.top][cell.left];

            const digitIndex = cells.findIndex(constraintCell => isSamePosition(constraintCell, cell));
            const digit = digits[digitIndex];
            if (!digit) {
                return true;
            }

            const isHere = areSameCellData(data, digit.digit, puzzle, state, true);
            const hasEmpty = cells.some(({top, left}) => digitsMap[top]?.[left] === undefined);
            const isSomewhere = cells.some(({top, left}) => {
                const data = digitsMap[top]?.[left];
                return data !== undefined && areSameCellData(data, digit.digit, puzzle, state, true);
            });

            switch (digit.type) {
                case QuadleDigitType.here: return isHere;
                case QuadleDigitType.elsewhere: return hasEmpty || isSomewhere;
                case QuadleDigitType.nowhere: return !isSomewhere;
                case QuadleDigitType.unknown: return true;
            }
        },
    });
};

export const QuadleConstraintBySolution = <T extends AnyPTM>(
    {puzzle, state}: PuzzleContext<T>,
    cellLiteral: PositionLiteral,
    digits: T["cell"][],
    solution: GivenDigitsMap<T["cell"]>,
    isRecent = false
): Constraint<T, QuadleProps<T["cell"]>> => {
    const {typeManager: {areSameCellData}} = puzzle;

    const actualDigits = getQuadCells(parsePositionLiteral(cellLiteral))
        .map(({top, left}) => solution[top]?.[left]);

    const hasEmptyDigits = actualDigits.some(digit => digit === undefined);

    const getDigitType = (digit: T["cell"], index: number) => {
        if (digits.length < 4) {
            return QuadleDigitType.unknown;
        }

        const actualDigit = actualDigits[index];
        if (actualDigit !== undefined && areSameCellData(actualDigit, digit, puzzle, state, true)) {
            return QuadleDigitType.here;
        }

        if (actualDigits.some(actualDigit => actualDigit !== undefined && areSameCellData(actualDigit, digit, puzzle, state, true))) {
            return QuadleDigitType.elsewhere;
        }

        return hasEmptyDigits ? QuadleDigitType.unknown : QuadleDigitType.nowhere;
    }

    return QuadleConstraint(
        cellLiteral,
        digits.map((digit, index) => ({
            digit,
            type: getDigitType(digit, index),
        })),
        isRecent
    );
};
