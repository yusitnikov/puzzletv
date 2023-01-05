/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {isSamePosition, parsePositionLiterals, Position, PositionLiteral} from "../../../../types/layout/Position";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {Fragment, ReactElement} from "react";
import {gameStateGetCurrentFieldState, gameStateGetCurrentGivenDigitsByCells} from "../../../../types/sudoku/GameState";
import {darkGreyColor} from "../../../app/globals";
import {CellBackground} from "../../cell/CellBackground";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {useAutoIncrementId} from "../../../../hooks/useAutoIncrementId";
import {CellColor} from "../../../../types/sudoku/CellColor";
import {CellPart} from "../../../../types/sudoku/CellPart";
import {PuzzlePositionSet} from "../../../../types/sudoku/PuzzlePositionSet";
import {indexes} from "../../../../utils/indexes";

const shadowSize = 0.07;

export interface FogProps<CellType> {
    solution?: CellType[][];
    startCells?: Position[];
    startCells3x3?: Position[];
    bulbCells?: Position[];
    revealByCenterLines?: boolean;
    revealByColors?: CellColor[];
}

const DarkReaderRectOverride = styled("rect")(({fill}) => ({
    "--darkreader-inline-fill": `${fill} !important`,
}));

export const Fog = withFieldLayer(FieldLayer.regular, <CellType,>(
    {
        context,
        props: {
            solution,
            startCells,
            startCells3x3,
            bulbCells,
            revealByColors,
            revealByCenterLines,
        },
    }: ConstraintProps<any, FogProps<CellType>>
) => {
    const {
        puzzle,
        state,
        cellsIndex,
    } = context;

    const {
        fieldSize: {rowsCount, columnsCount},
        typeManager: {areSameCellData},
    } = puzzle;

    const {cells, lines} = gameStateGetCurrentFieldState(state);
    const givenDigits = gameStateGetCurrentGivenDigitsByCells(cells);

    const visible3x3Centers = indexes(rowsCount).map(
        (top) => indexes(columnsCount).map(
            (left) =>
                startCells3x3?.some((position) => isSamePosition(position, {top, left})) ||
                (!!givenDigits[top]?.[left] && (!solution || areSameCellData(solution[top][left], givenDigits[top][left], state, true))) ||
                (revealByColors && revealByColors.length > 0 && cells[top][left].colors.containsOneOf(revealByColors))
        )
    );
    const visible3x3 = indexes(rowsCount).map(
        (top) => indexes(columnsCount).map(
            (left) =>
                visible3x3Centers[top - 1]?.[left - 1] || visible3x3Centers[top - 1]?.[left] || visible3x3Centers[top - 1]?.[left + 1] ||
                visible3x3Centers[top][left - 1]       || visible3x3Centers[top][left]       || visible3x3Centers[top][left + 1] ||
                visible3x3Centers[top + 1]?.[left - 1] || visible3x3Centers[top + 1]?.[left] || visible3x3Centers[top + 1]?.[left + 1]
        )
    );

    const linePoints = new PuzzlePositionSet(
        puzzle,
        lines.items
            .flatMap(({start, end}) => [start, end])
            .map(point => cellsIndex.getPointInfo(point))
            .filter(info => info?.type === CellPart.center)
            .map(info => info!.cells.first()!)
    );
    const visibleCrossCenters = indexes(rowsCount).map(
        (top) => indexes(columnsCount).map(
            (left) => revealByCenterLines && linePoints.contains({top, left})
        )
    );
    const visibleCross = indexes(rowsCount).map(
        (top) => indexes(columnsCount).map(
            (left) =>
                                                      visibleCrossCenters[top - 1]?.[left] ||
                visibleCrossCenters[top][left - 1] || visibleCrossCenters[top][left] || visibleCrossCenters[top][left + 1] ||
                                                      visibleCrossCenters[top + 1]?.[left]
        )
    );

    const visible = indexes(rowsCount).map(
        (top) => indexes(columnsCount).map(
            (left) =>
                startCells?.some((position) => isSamePosition(position, {top, left})) ||
                visible3x3[top][left] || visibleCross[top][left]
        )
    );

    const id = useAutoIncrementId();
    const blurFilterId = `blur-filter-${id}`;
    const fogMaskId = `fog-mask-${id}`;
    const fogBulbId = `fog-bulb-${id}`;

    return <>
        <defs>
            <filter id={blurFilterId}>
                <feGaussianBlur stdDeviation={shadowSize}/>
            </filter>
            <mask id={fogMaskId}>
                <g filter={`url(#${blurFilterId})`}>
                    <DarkReaderRectOverride
                        width={columnsCount}
                        height={rowsCount}
                        fill={"#000"}
                        strokeWidth={0}
                    />

                    {visible.flatMap((row, top) => row.map((vis, left) => !vis && <Fragment key={`${top}-${left}`}>
                        <DarkReaderRectOverride
                            y={top - shadowSize}
                            x={left - shadowSize}
                            width={1 + 2 * shadowSize}
                            height={1 + 2 * shadowSize}
                            fill={"#fff"}
                            strokeWidth={0}
                        />
                    </Fragment>))}
                </g>
            </mask>

            <path
                id={fogBulbId}
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
            mask={`url(#${fogMaskId})`}
            strokeWidth={0}
        />

        {bulbCells?.map(({top, left}) => <use
            key={`light-${top}-${left}`}
            href={`#${fogBulbId}`}
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
}) as <CellType, ExType, ProcessedExType>(props: ConstraintProps<CellType, FogProps<CellType>, ExType, ProcessedExType>) => ReactElement;

export const FogConstraint = <CellType, ExType, ProcessedExType>(
    solution?: CellType[][],
    startCell3x3Literals: PositionLiteral[] = [],
    startCellLiterals: PositionLiteral[] = [],
    bulbCellLiterals = startCell3x3Literals,
    revealByCenterLines = false,
    revealByColors: CellColor[] = [],
): Constraint<CellType, FogProps<CellType>, ExType, ProcessedExType> => ({
    name: "fog",
    cells: [],
    props: {
        solution,
        startCells3x3: parsePositionLiterals(startCell3x3Literals),
        startCells: parsePositionLiterals(startCellLiterals),
        bulbCells: parsePositionLiterals(bulbCellLiterals),
        revealByCenterLines,
        revealByColors,
    },
    component: Fog,
    isValidCell: solution && ((
        {top, left},
        digits,
        _,
        {puzzle: {typeManager: {areSameCellData}}, state}
    ) => {
        return areSameCellData(
            digits[top][left],
            solution[top][left],
            state,
            true
        );
    }),
});
