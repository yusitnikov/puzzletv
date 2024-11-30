/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {
    arrayContainsPosition,
    parsePositionLiterals,
    Position,
    PositionLiteral,
} from "../../../../types/layout/Position";
import { FieldLayer } from "../../../../types/sudoku/FieldLayer";
import { Constraint, ConstraintProps } from "../../../../types/sudoku/Constraint";
import { Fragment, ReactElement } from "react";
import { gameStateGetCurrentGivenDigitsByCells } from "../../../../types/sudoku/GameState";
import { darkGreyColor } from "../../../app/globals";
import { FieldCellBackground } from "../../cell/CellBackground";
import { AutoSvg } from "../../../svg/auto-svg/AutoSvg";
import { useAutoIncrementId } from "../../../../hooks/useAutoIncrementId";
import { CellColor } from "../../../../types/sudoku/CellColor";
import { PuzzlePositionSet } from "../../../../types/sudoku/PuzzlePositionSet";
import { indexes } from "../../../../utils/indexes";
import { PuzzleContext } from "../../../../types/sudoku/PuzzleContext";
import { GivenDigitsMap } from "../../../../types/sudoku/GivenDigitsMap";
import { PuzzleLineSet } from "../../../../types/sudoku/PuzzleLineSet";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";
import { settings } from "../../../../types/layout/Settings";

export const fogTag = "fog";

export interface FogProps<T extends AnyPTM> {
    startCells?: Position[];
    startCells3x3?: Position[];
    bulbCells?: Position[];
    revealByCenterLines?: boolean | PuzzleLineSet<T>;
    revealByColors?: CellColor[] | GivenDigitsMap<CellColor>;
}

const DarkReaderRectOverride = styled("rect")(({ fill }) => ({
    "--darkreader-inline-fill": `${fill} !important`,
}));

export const getFogVisibleCells = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    { startCells, startCells3x3, revealByColors, revealByCenterLines }: FogProps<T>,
) => {
    const {
        puzzle,
        puzzleIndex,
        currentFieldStateWithFogDemo: { cells, lines },
    } = context;

    const {
        solution,
        fieldSize: { rowsCount, columnsCount },
        typeManager: { getDigitByCellData },
    } = puzzle;

    const givenDigits = gameStateGetCurrentGivenDigitsByCells(cells);
    const initialColors = context.puzzleInitialColors;

    const visible3x3Centers = indexes(rowsCount).map((top) =>
        indexes(columnsCount).map(
            (left) =>
                arrayContainsPosition(startCells3x3 ?? [], { top, left }) ||
                (!!givenDigits[top]?.[left] &&
                    (typeof solution?.[top]?.[left] !== "number" ||
                        getDigitByCellData(givenDigits[top][left], context, { top, left }) === solution[top][left])) ||
                (revealByColors &&
                    cells[top][left].colors.size === 1 &&
                    !initialColors[top]?.[left] &&
                    (Array.isArray(revealByColors)
                        ? revealByColors.includes(cells[top][left].colors.first()!)
                        : cells[top][left].colors.first() === revealByColors[top]?.[left])),
        ),
    );
    const visible3x3 = indexes(rowsCount).map((top) =>
        indexes(columnsCount).map(
            (left) =>
                visible3x3Centers[top - 1]?.[left - 1] ||
                visible3x3Centers[top - 1]?.[left] ||
                visible3x3Centers[top - 1]?.[left + 1] ||
                visible3x3Centers[top][left - 1] ||
                visible3x3Centers[top][left] ||
                visible3x3Centers[top][left + 1] ||
                visible3x3Centers[top + 1]?.[left - 1] ||
                visible3x3Centers[top + 1]?.[left] ||
                visible3x3Centers[top + 1]?.[left + 1],
        ),
    );

    const linePoints = new PuzzlePositionSet(
        puzzle,
        puzzleIndex
            .getCenterLines(lines.items, true)
            .filter((line) => typeof revealByCenterLines !== "object" || revealByCenterLines.contains(line))
            .flatMap(({ start, end }) => [start, end]),
    );
    const visibleCrossCenters = indexes(rowsCount).map((top) =>
        indexes(columnsCount).map((left) => revealByCenterLines && linePoints.contains({ top, left })),
    );
    const visibleCross = indexes(rowsCount).map((top) =>
        indexes(columnsCount).map(
            (left) =>
                visibleCrossCenters[top - 1]?.[left] ||
                visibleCrossCenters[top][left - 1] ||
                visibleCrossCenters[top][left] ||
                visibleCrossCenters[top][left + 1] ||
                visibleCrossCenters[top + 1]?.[left],
        ),
    );

    return indexes(rowsCount).map((top) =>
        indexes(columnsCount).map(
            (left) =>
                arrayContainsPosition(startCells ?? [], { top, left }) ||
                visible3x3[top][left] ||
                visibleCross[top][left],
        ),
    );
};

export const Fog = {
    [FieldLayer.regular]: observer(function Fog<T extends AnyPTM>({ context, props }: ConstraintProps<T, FogProps<T>>) {
        profiler.trace();

        const { bulbCells } = props;

        const {
            puzzle: {
                fieldSize: { rowsCount, columnsCount },
            },
        } = context;

        const visible = getFogVisibleCells(context, props);

        const id = useAutoIncrementId();
        const enableShadow = !settings.simplifiedGraphics.get();
        const blurFilterId = `blur-filter-${id}`;
        const fogMaskId = `fog-mask-${id}`;
        const fogBulbId = `fog-bulb-${id}`;
        const shadowSize = enableShadow ? 0.07 : 0;

        return (
            <>
                <defs>
                    {enableShadow && (
                        <filter id={blurFilterId}>
                            <feGaussianBlur stdDeviation={shadowSize} />
                        </filter>
                    )}
                    <mask id={fogMaskId}>
                        <g filter={enableShadow ? `url(#${blurFilterId})` : undefined}>
                            <DarkReaderRectOverride
                                width={columnsCount}
                                height={rowsCount}
                                fill={"#000"}
                                strokeWidth={0}
                            />

                            {visible.flatMap((row, top) =>
                                row.map(
                                    (vis, left) =>
                                        !vis && (
                                            <Fragment key={`${top}-${left}`}>
                                                <DarkReaderRectOverride
                                                    y={top - shadowSize}
                                                    x={left - shadowSize}
                                                    width={1 + 2 * shadowSize}
                                                    height={1 + 2 * shadowSize}
                                                    fill={"#fff"}
                                                    strokeWidth={0}
                                                />
                                            </Fragment>
                                        ),
                                ),
                            )}
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
                    <rect width={columnsCount} height={rowsCount} fill={darkGreyColor} strokeWidth={0} />

                    <FogCellsBackground context={context} />
                </g>

                {bulbCells?.map(({ top, left }) => (
                    <use key={`light-${top}-${left}`} href={`#${fogBulbId}`} transform={`translate(${left} ${top})`} />
                ))}
            </>
        );
    }) as <T extends AnyPTM>(props: ConstraintProps<T, FogProps<T>>) => ReactElement,
};

interface FogCellsBackgroundProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
}
const FogCellsBackground = observer(function FogCellsBackground<T extends AnyPTM>({
    context,
}: FogCellsBackgroundProps<T>) {
    profiler.trace();

    const {
        puzzle: {
            fieldSize: { rowsCount, columnsCount },
        },
    } = context;

    return (
        <>
            {indexes(rowsCount).map((top) =>
                indexes(columnsCount).map((left) => {
                    return (
                        <AutoSvg key={`${top}-${left}`} top={top} left={left}>
                            <FieldCellBackground context={context} noGivenColors={true} top={top} left={left} />
                        </AutoSvg>
                    );
                }),
            )}
        </>
    );
}) as <T extends AnyPTM>(props: FogCellsBackgroundProps<T>) => ReactElement;

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
    isValidCell: ({ top, left }, digits, _, context) => {
        const {
            puzzle: {
                solution,
                typeManager: { getDigitByCellData },
            },
            fogDemoFieldStateHistory,
        } = context;

        return (
            !!fogDemoFieldStateHistory ||
            typeof solution?.[top][left] !== "number" ||
            getDigitByCellData(digits[top][left], context, { top, left }) === solution[top][left]
        );
    },
});

export const getFogPropsByContext = <T extends AnyPTM>(context: PuzzleContext<T>): FogProps<T> | undefined =>
    context.allItems.find(({ tags }) => tags?.includes(fogTag))?.props;
