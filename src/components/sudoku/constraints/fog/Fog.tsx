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
import { ComponentType, Fragment, ReactElement } from "react";
import { gameStateGetCurrentGivenDigitsByCells } from "../../../../types/sudoku/GameState";
import { darkGreyColor } from "../../../app/globals";
import { FieldCellBackground } from "../../cell/CellBackground";
import { AutoSvg } from "../../../svg/auto-svg/AutoSvg";
import { useAutoIncrementId } from "../../../../hooks/useAutoIncrementId";
import { CellColor } from "../../../../types/sudoku/CellColor";
import { PuzzlePositionSet } from "../../../../types/sudoku/PuzzlePositionSet";
import { indexes, indexesFromTo } from "../../../../utils/indexes";
import { PuzzleContext } from "../../../../types/sudoku/PuzzleContext";
import { GivenDigitsMap, processGivenDigitsMaps } from "../../../../types/sudoku/GivenDigitsMap";
import { PuzzleLineSet } from "../../../../types/sudoku/PuzzleLineSet";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
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
    revealByColors?: CellColor[] | GivenDigitsMap<CellColor>;
    useDefaultTriggers?: boolean;
    triggers?: GivenDigitsMap<PositionT[]>;
    fogRenderer?: ComponentType<FogRendererProps<T>>;
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
        useDefaultTriggers = true,
        triggers = {},
    }: FogProps<T>,
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

    const result = indexes(rowsCount).map(() => indexes(columnsCount).map(() => false));

    for (const { top, left } of startCells) {
        result[top][left] = true;
    }

    const safeClearFog = (top: number, left: number) => {
        if (result[top]?.[left] !== undefined) {
            result[top][left] = true;
        }
    };

    for (const top of indexes(rowsCount)) {
        for (const left of indexes(columnsCount)) {
            let triggeredCells = triggers[top]?.[left];
            if (!triggeredCells && !useDefaultTriggers) {
                continue;
            }

            const isTrigger =
                arrayContainsPosition(startCells3x3 ?? [], { top, left }) ||
                (givenDigits[top]?.[left] !== undefined &&
                    (typeof solution?.[top]?.[left] !== "number" ||
                        getDigitByCellData(givenDigits[top][left], context, { top, left }) === solution[top][left])) ||
                (revealByColors &&
                    cells[top][left].colors.size === 1 &&
                    !initialColors[top]?.[left] &&
                    (Array.isArray(revealByColors)
                        ? revealByColors.includes(cells[top][left].colors.first()!)
                        : cells[top][left].colors.first() === revealByColors[top]?.[left]));
            if (!isTrigger) {
                continue;
            }

            triggeredCells ??= indexesFromTo(top - 1, top + 1, true).flatMap((top) =>
                indexesFromTo(left - 1, left + 1, true).map((left) => ({ top, left })),
            );
            for (const { top, left } of triggeredCells) {
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
    [FieldLayer.regular]: observer(function Fog<T extends AnyPTM>({ context, props }: ConstraintProps<T, FogProps<T>>) {
        profiler.trace();

        const { bulbCells, fogRenderer: FogRenderer } = props;

        const {
            puzzle: {
                fieldSize: { rowsCount, columnsCount },
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

export const FogConstraint = <T extends AnyPTM>({
    startCells3x3 = [],
    startCells = [],
    bulbCells = startCells3x3,
    revealByCenterLines = false,
    revealByColors = {},
    triggers = {},
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
        triggers: processGivenDigitsMaps(([cells]) => parsePositionLiterals(cells), [triggers]),
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
