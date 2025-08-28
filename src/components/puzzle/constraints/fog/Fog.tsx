/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {
    arrayContainsPosition,
    parsePositionLiterals,
    Position,
    PositionLiteral,
    PositionSet,
} from "../../../../types/layout/Position";
import { GridLayer } from "../../../../types/puzzle/GridLayer";
import { Constraint, ConstraintProps } from "../../../../types/puzzle/Constraint";
import { ComponentType, Fragment, ReactElement } from "react";
import { gameStateGetCurrentGivenDigitsByCells } from "../../../../types/puzzle/GameState";
import { darkGreyColor } from "../../../app/globals";
import { GridCellBackground } from "../../cell/CellBackground";
import { useAutoIncrementId } from "../../../../hooks/useAutoIncrementId";
import { CellColor } from "../../../../types/puzzle/CellColor";
import { PuzzlePositionSet } from "../../../../types/puzzle/PuzzlePositionSet";
import { indexes, indexesFromTo } from "../../../../utils/indexes";
import { PuzzleContext } from "../../../../types/puzzle/PuzzleContext";
import { CellsMap } from "../../../../types/puzzle/CellsMap";
import { PuzzleLineSet } from "../../../../types/puzzle/PuzzleLineSet";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";
import { settings } from "../../../../types/layout/Settings";

export const fogTag = "fog";

export interface FogRendererProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    shadowSize: number;
}

export interface FogProps<T extends AnyPTM, PositionT = Position> {
    startCells?: PositionT[];
    startCells3x3?: PositionT[];
    bulbCells?: PositionT[];
    revealByCenterLines?: boolean | PuzzleLineSet<T>;
    revealByColors?: CellColor[] | CellsMap<CellColor>;
    effects?: FogEffect<PositionT>[];
    defaultEffect?: FogEffectPattern<T>;
    defaultEffectExceptions?: PositionT[];
    fogRenderer?: ComponentType<FogRendererProps<T>>;
}

export type FogEffectPattern<T extends AnyPTM> = (cell: Position, context: PuzzleContext<T>) => Position[];

export interface FogEffect<PositionT = Position> {
    triggerCells: PositionT[];
    affectedCells: PositionT[];
}

const DarkReaderRectOverride = styled("rect")(({ fill }) => ({
    "--darkreader-inline-fill": `${fill} !important`,
}));

export const getFogVisibleCells = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    {
        startCells = [],
        startCells3x3 = [],
        revealByColors,
        revealByCenterLines,
        effects = [],
        defaultEffect = (
            { top, left },
            {
                puzzle: {
                    gridSize: { rowsCount, columnsCount },
                },
            },
        ) =>
            indexesFromTo(Math.max(top - 1, 0), Math.min(top + 1, rowsCount - 1), true).flatMap((top2) =>
                indexesFromTo(Math.max(left - 1, 0), Math.min(left + 1, columnsCount - 1), true).map((left2) => ({
                    top: top2,
                    left: left2,
                })),
            ),
        defaultEffectExceptions = [],
    }: FogProps<T>,
) => {
    const {
        puzzle,
        puzzleIndex,
        currentGridStateWithFogDemo: { cells, lines },
    } = context;

    const {
        solution,
        gridSize: { rowsCount, columnsCount },
        typeManager: { getDigitByCellData },
    } = puzzle;

    const defaultEffectExceptionsSet = new PositionSet(defaultEffectExceptions);

    const givenDigits = gameStateGetCurrentGivenDigitsByCells(cells);
    const initialColors = context.puzzleInitialColors;

    const result = indexes(rowsCount).map(() => indexes(columnsCount).map(() => false));

    for (const { top, left } of startCells) {
        result[top][left] = true;
    }

    const safeClearFog = (top: number, left: number) => {
        if (result[top]?.[left] !== undefined) {
            result[top][left] = true;
        }
    };

    const isTrigger = (position: Position) => {
        const { top, left } = position;
        return (
            arrayContainsPosition(startCells3x3 ?? [], position) ||
            (givenDigits[top]?.[left] !== undefined &&
                (typeof solution?.[top]?.[left] !== "number" ||
                    getDigitByCellData(givenDigits[top][left], context, position) === solution[top][left])) ||
            (revealByColors &&
                cells[top][left].colors.size === 1 &&
                !initialColors[top]?.[left] &&
                (Array.isArray(revealByColors)
                    ? revealByColors.includes(cells[top][left].colors.first()!)
                    : cells[top][left].colors.first() === revealByColors[top]?.[left]))
        );
    };

    for (const { triggerCells, affectedCells } of effects) {
        if (triggerCells.every(isTrigger)) {
            for (const cell of affectedCells) {
                safeClearFog(cell.top, cell.left);
            }
        }
    }

    for (const top of indexes(rowsCount)) {
        for (const left of indexes(columnsCount)) {
            const cell = { top, left };

            if (defaultEffectExceptionsSet.contains(cell) || !isTrigger(cell)) {
                continue;
            }

            for (const { top, left } of defaultEffect(cell, context)) {
                safeClearFog(top, left);
            }
        }
    }

    if (revealByCenterLines) {
        const linePoints = new PuzzlePositionSet(
            puzzle,
            puzzleIndex
                .getCenterLines(lines.items, true)
                .filter((line) => typeof revealByCenterLines !== "object" || revealByCenterLines.contains(line))
                .flatMap(({ start, end }) => [start, end]),
        );

        for (const { top, left } of linePoints.items) {
            result[top][left] = true;
            safeClearFog(top - 1, left);
            safeClearFog(top + 1, left);
            safeClearFog(top, left - 1);
            safeClearFog(top, left + 1);
        }
    }

    return result;
};

export const Fog = {
    [GridLayer.regular]: observer(function Fog<T extends AnyPTM>({ context, props }: ConstraintProps<T, FogProps<T>>) {
        profiler.trace();

        const { bulbCells, fogRenderer: FogRenderer } = props;

        const {
            puzzle: {
                gridSize: { rowsCount, columnsCount },
                disableFancyFog,
            },
        } = context;

        const id = useAutoIncrementId();
        const enableShadow = !disableFancyFog && !settings.simplifiedGraphics.get();
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

                            {FogRenderer ? (
                                <FogRenderer context={context} shadowSize={shadowSize} />
                            ) : (
                                getFogVisibleCells(context, props).flatMap((row, top) =>
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
                                )
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
            gridSize: { rowsCount, columnsCount },
        },
    } = context;

    return (
        <>
            {indexes(rowsCount).map((top) =>
                indexes(columnsCount).map((left) => {
                    return (
                        <GridCellBackground
                            key={`${top}-${left}`}
                            context={context}
                            noGivenColors={true}
                            top={top}
                            left={left}
                        />
                    );
                }),
            )}
        </>
    );
}) as <T extends AnyPTM>(props: FogCellsBackgroundProps<T>) => ReactElement;

export const FogConstraint = <T extends AnyPTM>({
    startCells3x3 = [],
    startCells = [],
    bulbCells = startCells3x3,
    revealByCenterLines = false,
    revealByColors = {},
    effects = [],
    defaultEffectExceptions = [],
    ...other
}: FogProps<T, PositionLiteral> = {}): Constraint<T, FogProps<T>> => ({
    name: "fog",
    tags: [fogTag],
    cells: [],
    props: {
        startCells3x3: parsePositionLiterals(startCells3x3),
        startCells: parsePositionLiterals(startCells),
        bulbCells: parsePositionLiterals(bulbCells),
        revealByCenterLines,
        revealByColors,
        effects: effects?.map(({ triggerCells, affectedCells }) => ({
            triggerCells: parsePositionLiterals(triggerCells),
            affectedCells: parsePositionLiterals(affectedCells),
        })),
        defaultEffectExceptions: parsePositionLiterals(defaultEffectExceptions),
        ...other,
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
            fogDemoGridStateHistory,
        } = context;

        return (
            !!fogDemoGridStateHistory ||
            typeof solution?.[top][left] !== "number" ||
            getDigitByCellData(digits[top][left], context, { top, left }) === solution[top][left]
        );
    },
});

export const isFog = <T extends AnyPTM>(item: Constraint<T, any>): item is Constraint<T, FogProps<T>> =>
    item.tags?.includes(fogTag) ?? false;

export const getFogPropsByContext = <T extends AnyPTM>(context: PuzzleContext<T>): FogProps<T> | undefined =>
    context.allItems.find(isFog)?.props;
