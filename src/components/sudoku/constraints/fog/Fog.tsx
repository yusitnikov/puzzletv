/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {
    arrayContainsPosition,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps, getAllPuzzleConstraints} from "../../../../types/sudoku/Constraint";
import {Fragment} from "react";
import {gameStateGetCurrentFieldState, gameStateGetCurrentGivenDigitsByCells} from "../../../../types/sudoku/GameState";
import {darkGreyColor} from "../../../app/globals";
import {CellBackground} from "../../cell/CellBackground";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {useAutoIncrementId} from "../../../../hooks/useAutoIncrementId";
import {CellColor} from "../../../../types/sudoku/CellColor";
import {PuzzlePositionSet} from "../../../../types/sudoku/PuzzlePositionSet";
import {indexes} from "../../../../utils/indexes";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {GivenDigitsMap} from "../../../../types/sudoku/GivenDigitsMap";
import {resolvePuzzleInitialColors} from "../../../../types/sudoku/PuzzleDefinition";
import {PuzzleLineSet} from "../../../../types/sudoku/PuzzleLineSet";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export const fogTag = "fog";
const shadowSize = 0.07;

export interface FogProps<T extends AnyPTM> {
    startCells?: Position[];
    startCells3x3?: Position[];
    bulbCells?: Position[];
    revealByCenterLines?: boolean | PuzzleLineSet<T>;
    revealByColors?: CellColor[] | GivenDigitsMap<CellColor>;
}

const DarkReaderRectOverride = styled("rect")(({fill}) => ({
    "--darkreader-inline-fill": `${fill} !important`,
}));

export const getFogVisibleCells = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    {
        startCells,
        startCells3x3,
        revealByColors,
        revealByCenterLines,
    }: FogProps<T>
) => {
    const {
        puzzle,
        state,
        cellsIndex,
    } = context;

    const {
        solution,
        fieldSize: {rowsCount, columnsCount},
        typeManager: {getDigitByCellData},
    } = puzzle;

    const {cells, lines} = gameStateGetCurrentFieldState(state, true);
    const givenDigits = gameStateGetCurrentGivenDigitsByCells(cells);
    const initialColors = resolvePuzzleInitialColors(context);

    const visible3x3Centers = indexes(rowsCount).map(
        (top) => indexes(columnsCount).map(
            (left) =>
                arrayContainsPosition(startCells3x3 ?? [], {top, left}) ||
                (!!givenDigits[top]?.[left] && (typeof solution?.[top]?.[left] !== "number" || getDigitByCellData(givenDigits[top][left], context, {top, left}) === solution[top][left])) ||
                (revealByColors && cells[top][left].colors.size === 1 && !initialColors[top]?.[left] && (
                    Array.isArray(revealByColors)
                        ? revealByColors.includes(cells[top][left].colors.first()!)
                        : cells[top][left].colors.first() === revealByColors[top]?.[left]
                ))
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
        cellsIndex.getCenterLines(lines.items, true)
            .filter(line => typeof revealByCenterLines !== "object" || revealByCenterLines.contains(line))
            .flatMap(({start, end}) => [start, end])
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

    return indexes(rowsCount).map(
        (top) => indexes(columnsCount).map(
            (left) =>
                arrayContainsPosition(startCells ?? [], {top, left}) ||
                visible3x3[top][left] || visibleCross[top][left]
        )
    );
};

export const Fog = {
    [FieldLayer.regular]: <T extends AnyPTM>({context, props}: ConstraintProps<T, FogProps<T>>) => {
        const {bulbCells} = props;

        const {
            puzzle: {fieldSize: {rowsCount, columnsCount}},
            state,
        } = context;

        const {cells} = gameStateGetCurrentFieldState(state);

        const visible = getFogVisibleCells(context, props);

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

            <g mask={`url(#${fogMaskId})`}>
                <rect
                    width={columnsCount}
                    height={rowsCount}
                    fill={darkGreyColor}
                    strokeWidth={0}
                />

                {indexes(rowsCount).map((top) => indexes(columnsCount).map((left) => {
                    const {colors} = cells[top][left];

                    return colors.size !== 0 && <AutoSvg
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
            </g>

            {bulbCells?.map(({top, left}) => <use
                key={`light-${top}-${left}`}
                href={`#${fogBulbId}`}
                transform={`translate(${left} ${top})`}
            />)}
        </>;
    },
};

export const FogConstraint = <T extends AnyPTM>(
    startCell3x3Literals: PositionLiteral[] = [],
    startCellLiterals: PositionLiteral[] = [],
    bulbCellLiterals = startCell3x3Literals,
    revealByCenterLines: boolean | PuzzleLineSet<T> = false,
    revealByColors: CellColor[] | GivenDigitsMap<CellColor> = {},
): Constraint<T, FogProps<T>> => ({
    name: "fog",
    tags: [fogTag],
    cells: [],
    props: {
        startCells3x3: parsePositionLiterals(startCell3x3Literals),
        startCells: parsePositionLiterals(startCellLiterals),
        bulbCells: parsePositionLiterals(bulbCellLiterals),
        revealByCenterLines,
        revealByColors,
    },
    component: Fog,
    noPencilmarkCheck: true,
    isCheckingFog: true,
    isValidCell: ({top, left}, digits, _, context) => {
        const {puzzle: {solution, typeManager: {getDigitByCellData}}, state} = context;

        return !!state.fogDemoFieldStateHistory || typeof solution?.[top][left] !== "number" ||
            getDigitByCellData(digits[top][left], context, {top, left}) === solution[top][left];
    },
});

export const getFogPropsByConstraintsList = <T extends AnyPTM>(
    constraints: Constraint<T, any>[]
): FogProps<T> | undefined =>
    constraints
        .find(({tags}) => tags?.includes(fogTag))
        ?.props;

export const getFogPropsByContext = <T extends AnyPTM>(
    context: PuzzleContext<T>
) => getFogPropsByConstraintsList(getAllPuzzleConstraints(context));
