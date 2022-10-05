import {isSamePosition, parsePositionLiterals, Position, PositionLiteral} from "../../../../types/layout/Position";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {Fragment, ReactElement} from "react";
import {
    gameStateGetCurrentFieldState,
    gameStateGetCurrentGivenDigitsByCells
} from "../../../../types/sudoku/GameState";
import {darkGreyColor} from "../../../app/globals";
import {CellBackground} from "../../cell/CellBackground";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";

export interface FogProps<CellType> {
    solution: CellType[][];
    startCells: Position[];
}

const shadeSize = 0.4;

export const Fog = withFieldLayer(FieldLayer.regular, <CellType,>(
    {
        context,
        solution,
        startCells,
    }: ConstraintProps<any, FogProps<CellType>>
) => {
    const {
        puzzle: {
            fieldSize: {rowsCount, columnsCount},
            typeManager: {areSameCellData},
        },
        state,
    } = context;

    const {cells} = gameStateGetCurrentFieldState(state);
    const givenDigits = gameStateGetCurrentGivenDigitsByCells(cells);
    const visible = solution.map(
        (row, top) => row.map(
            (digit, left) =>
                startCells.some((position) => isSamePosition(position, {top, left})) ||
                (!!givenDigits[top]?.[left] && areSameCellData(digit, givenDigits[top][left], state, true))
        )
    );

    return <>
        <defs>
            <linearGradient id={"fog-rect-gradient"}>
                <stop offset={"0%"} stopColor={"#000"} stopOpacity={0}/>
                <stop offset={"100%"} stopColor={"#000"} stopOpacity={1}/>
            </linearGradient>

            <radialGradient id={"fog-circle-gradient"} cx={"100%"} cy={"100%"} r={"100%"}>
                <stop offset={"0%"} stopColor={"#000"} stopOpacity={1}/>
                <stop offset={"100%"} stopColor={"#000"} stopOpacity={0}/>
            </radialGradient>

            <g id={"fog-part"}>
                <rect
                    width={shadeSize}
                    y={shadeSize}
                    height={3 - 2 * shadeSize}
                    fill={`url(#fog-rect-gradient)`}
                    strokeWidth={0}
                />

                <rect
                    width={shadeSize}
                    height={shadeSize}
                    fill={`url(#fog-circle-gradient)`}
                    strokeWidth={0}
                />
            </g>

            <mask id={"fog-mask"}>
                <rect
                    width={columnsCount}
                    height={rowsCount}
                    fill={"#fff"}
                    strokeWidth={0}
                />

                {visible.flatMap((row, top) => row.map((vis, left) => vis && <Fragment key={`${top}-${left}`}>
                    <rect
                        y={top - 1.01 + shadeSize}
                        x={left - 1.01 + shadeSize}
                        width={3.02 - 2 * shadeSize}
                        height={3.02 - 2 * shadeSize}
                        fill={"#000"}
                        strokeWidth={0}
                    />

                    <use href={"#fog-part"} transform={`translate(${left - 1} ${top - 1})`}/>
                    <use href={"#fog-part"} transform={`translate(${left + 2} ${top - 1}) rotate(90)`}/>
                    <use href={"#fog-part"} transform={`translate(${left + 2} ${top + 2}) rotate(180)`}/>
                    <use href={"#fog-part"} transform={`translate(${left - 1} ${top + 2}) rotate(270)`}/>
                </Fragment>))}
            </mask>

            <path
                id={"fog-light-source"}
                d={`
                    M 0.4 0.68
                    H 0.6
                    V 0.8
                    H 0.4
                    V 0.68
                    Z

                    M 0.4 0.65
                    Q 0.4 0.6 0.35 0.55
                    T 0.3 0.45
                    Q 0.3 0.25 0.5 0.25
                    T 0.7 0.45
                    Q 0.7 0.5 0.65 0.55
                    T 0.6 0.65
                    Z

                    M 0.5 0.2
                    V 0.05

                    M 0.75 0.45
                    H 0.9

                    M 0.25 0.45
                    H 0.1

                    M 0.677 0.627
                    L 0.783 0.733

                    M 0.677 0.273
                    L 0.783 0.167

                    M 0.323 0.627
                    L 0.217 0.733

                    M 0.323 0.273
                    L 0.217 0.167
                `}
                fill={"#ff8"}
                stroke={"#ff0"}
                strokeWidth={0.02}
            />
        </defs>

        <rect
            width={columnsCount}
            height={rowsCount}
            fill={darkGreyColor}
            mask={"url(#fog-mask)"}
            strokeWidth={0}
        />

        {startCells.map(({top, left}) => <use
            key={`light-${top}-${left}`}
            href={"#fog-light-source"}
            transform={`translate(${left} ${top})`}
        />)}

        {visible.flatMap((row, top) => row.map((vis, left) => {
            const {colors} = cells[top][left];

            return !vis && colors.size !== 0 && <AutoSvg
                key={`${top}-${left}`}
                top={top}
                left={left}
            >
                <CellBackground
                    context={context}
                    cellPosition={{top, left}}
                    colors={colors}
                />
            </AutoSvg>;
        }))}
    </>;
}) as <CellType,>(props: ConstraintProps<any, FogProps<CellType>>) => ReactElement;

export const FogConstraint = <CellType,>(solution: CellType[][], startCellLiterals: PositionLiteral[]): Constraint<CellType, FogProps<CellType>> => ({
    name: "fog",
    cells: [],
    solution,
    startCells: parsePositionLiterals(startCellLiterals),
    component: Fog,
    isValidCell(
        {top, left},
        digits,
        _,
        {puzzle: {typeManager: {areSameCellData}}, state}
    ) {
        return areSameCellData(
            digits[top][left],
            solution[top][left],
            state,
            true
        );
    },
});
