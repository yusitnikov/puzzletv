import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { RushHourGameState, RushHourProcessedGameState } from "./RushHourGameState";
import { Position } from "../../../types/layout/Position";
import { mixAnimatedValue, useAnimatedValue } from "../../../hooks/useAnimatedValue";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { RushHourMoveCellWriteModeInfo } from "./RushHourMoveCellWriteModeInfo";
import { GridRegion, transformCoordsByRegions } from "../../../types/puzzle/GridRegion";
import { RushHourPTM } from "./RushHourPTM";
import { PuzzleCellsIndex } from "../../../types/puzzle/PuzzleCellsIndex";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { RushHourCar } from "./RushHourPuzzleExtension";
import { resolveCellColorValue } from "../../../types/puzzle/CellColor";
import { getAverageColorsStr } from "../../../utils/color";
import { getRegionBoundingBox } from "../../../utils/regions";
import { loop } from "../../../utils/math";
import { ControlButtonRegion } from "../../../components/puzzle/controls/ControlButtonsManager";
import { RushHourHideCarsButton } from "../components/RushHourHideCarsButton";
import { RushHourCarsConstraint } from "../components/RushHourCar";
import { getDefaultRegionsForRowsAndColumns } from "../../../types/puzzle/GridSize";
import { GivenDigitsMap, mergeGivenDigitsMaps } from "../../../types/puzzle/GivenDigitsMap";
import { CellTypeProps } from "../../../types/puzzle/CellTypeProps";
import { createRandomGenerator } from "../../../utils/random";
import { cloneConstraint, Constraint, isValidFinishedPuzzleByConstraints } from "../../../types/puzzle/Constraint";
import { settings } from "../../../types/layout/Settings";
import { ColorsImportMode } from "../../../types/puzzle/PuzzleImportOptions";
import {
    addGridStateExToPuzzleTypeManager,
    addGameStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { RushHourGridState } from "./RushHourGridState";

export const RushHourTypeManager: PuzzleTypeManager<RushHourPTM> = {
    ...addGameStateExToPuzzleTypeManager(
        addGridStateExToPuzzleTypeManager(DigitPuzzleTypeManager(), {
            initialGridStateExtension(puzzle): RushHourGridState {
                return {
                    cars:
                        puzzle?.extension?.cars.map(() => ({
                            top: 0,
                            left: -puzzle.gridSize.rowsCount,
                        })) ?? [],
                };
            },
        }),
        {
            initialGameStateExtension(puzzle): RushHourGameState {
                return {
                    cars: puzzle?.extension?.cars.map(() => ({ animating: false })) ?? [],
                    hideCars: false,
                };
            },
            useProcessedGameStateExtension({
                gridExtension: { cars: carPositions },
                stateExtension: { cars: carAnimations },
            }): RushHourProcessedGameState {
                return {
                    cars: (carPositions as RushHourGridState["cars"]).map((position, index) =>
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        useAnimatedValue(
                            position,
                            carAnimations[index].animating ? settings.animationSpeed.get() / 2 : 0,
                            (a, b, coeff) => {
                                return {
                                    top: mixAnimatedValue(a.top, b.top, coeff),
                                    left: mixAnimatedValue(a.left, b.left, coeff),
                                };
                            },
                        ),
                    ),
                };
            },
            getProcessedGameStateExtension({ gridExtension: { cars } }): RushHourProcessedGameState {
                return { cars };
            },
        },
    ),

    ignoreRowsColumnCountInTheWrapper: true,

    processArrowDirection(
        { top, left },
        xDirection,
        yDirection,
        {
            puzzle: {
                gridSize: { gridSize },
            },
        },
    ): { cell?: Position } {
        return {
            cell: {
                top: loop(top + yDirection, gridSize),
                left: loop(left + xDirection, gridSize),
            },
        };
    },

    transformCoords: transformCoordsByRegions,

    getRegionsWithSameCoordsTransformation({
        puzzle: {
            extension: carsInfo,
            gridSize: { gridSize },
        },
        cellWriteMode,
        stateExtension: { hideCars: hideCarsState },
        processedGameStateExtension: { cars: carPositions },
    }): GridRegion[] {
        const isMoveMode = cellWriteMode === CellWriteMode.move;
        const hideCars = hideCarsState && !isMoveMode;

        return [
            {
                top: 0,
                left: 0,
                width: gridSize,
                height: gridSize,
                zIndex: 0,
            },
            ...(carsInfo?.cars ?? []).map(({ cells, boundingRect }, index): GridRegion => {
                const { top, left } = carPositions[index];
                return {
                    ...boundingRect,
                    cells,
                    transformCoords: (position) => {
                        return {
                            top: position.top + top,
                            left: position.left + left,
                        };
                    },
                    noBorders: true,
                    noInteraction: !isMoveMode,
                    opacity: hideCars ? 0.2 : undefined,
                    zIndex: 1,
                };
            }),
        ];
    },

    getCellTypeProps({ left }, { gridSize: { gridSize } }): CellTypeProps<RushHourPTM> {
        if (left >= gridSize) {
            return { isSelectable: false, isCheckingSolution: false };
        }
        return {};
    },

    getRegionsForRowsAndColumns(context) {
        const {
            puzzle: {
                gridSize: { gridSize },
                ...puzzle
            },
        } = context;
        return getDefaultRegionsForRowsAndColumns(
            context.cloneWith({
                puzzle: {
                    ...puzzle,
                    gridSize: {
                        gridSize,
                        rowsCount: gridSize,
                        columnsCount: gridSize,
                    },
                },
            }),
        );
    },

    mapImportedColors: true,
    colorsImportMode: ColorsImportMode.Initials,

    disabledCellWriteModes: [CellWriteMode.move],
    extraCellWriteModes: [RushHourMoveCellWriteModeInfo()],

    postProcessPuzzle(puzzle): PuzzleDefinition<RushHourPTM> {
        let {
            initialColors,
            gridSize: { gridSize },
            resultChecker,
            items = [],
        } = puzzle;

        puzzle = {
            ...puzzle,
            gridSize: {
                ...puzzle.gridSize,
                columnsCount: gridSize * 2,
            },
            allowDrawing: undefined,
        };

        if (typeof initialColors === "object") {
            puzzle.initialColors = {};

            const carsMap: Record<string, RushHourCar> = {};
            for (const [topStr, row] of Object.entries(initialColors)) {
                const top = Number(topStr);
                puzzle.initialColors[top] = {};
                for (const [leftStr, colors] of Object.entries(row)) {
                    const left = Number(leftStr);
                    const offsetLeft = left + gridSize;
                    if (colors.length === 0) {
                        continue;
                    }
                    const resolvedColors = colors.map(resolveCellColorValue);
                    const averageColor = getAverageColorsStr(resolvedColors);

                    const { [left]: initialDigit, ...rowInitialDigits } = puzzle.initialDigits?.[top] ?? {};
                    if (initialDigit !== undefined) {
                        puzzle.initialDigits = {
                            ...puzzle.initialDigits,
                            [top]: {
                                ...rowInitialDigits,
                                [offsetLeft]: initialDigit,
                            },
                        };
                    }

                    const key = resolvedColors.join(",");
                    carsMap[key] = carsMap[key] ?? {
                        cells: [],
                        color: averageColor,
                    };
                    carsMap[key].cells.push({ top, left: offsetLeft });
                }
            }

            const cellsIndex = new PuzzleCellsIndex(puzzle);
            const randomizer = createRandomGenerator(0);
            const cars = Object.values(carsMap).flatMap(({ color, cells }) =>
                cellsIndex.splitUnconnectedRegions([cells]).map(
                    (cells): RushHourCar => ({
                        color,
                        invert: randomizer() < 0.5,
                        cells,
                        boundingRect: getRegionBoundingBox(cells, 1),
                    }),
                ),
            );
            puzzle.extension = { cars };

            if (Array.isArray(items)) {
                const processedItems = items.map(
                    (item: Constraint<RushHourPTM, any>): typeof item & { carIndex?: number } => {
                        if (item.cells.length === 0) {
                            return item;
                        }
                        const {
                            top: itemTop,
                            left: itemLeft,
                            width: itemWidth,
                            height: itemHeight,
                        } = getRegionBoundingBox(item.cells, 1);
                        const itemBottom = itemTop + itemHeight;
                        const itemRight = itemLeft + itemWidth;

                        for (const [
                            carIndex,
                            {
                                boundingRect: { top, left: offsetLeft, width, height },
                            },
                        ] of cars.entries()) {
                            const left = offsetLeft - gridSize;
                            if (
                                itemTop >= top &&
                                itemLeft >= left &&
                                itemBottom <= top + height &&
                                itemRight <= left + width
                            ) {
                                return {
                                    ...cloneConstraint(item, {
                                        processCellCoords: ({ top, left }) => ({ top, left: left + gridSize }),
                                    }),
                                    carIndex,
                                };
                            }
                        }

                        return item;
                    },
                );
                puzzle = {
                    ...puzzle,
                    items: processedItems,
                };

                if (resultChecker) {
                    puzzle.resultChecker = (context) => {
                        const {
                            puzzle,
                            gridExtension: { cars: carPositions },
                        } = context;
                        const { initialDigits = {} } = puzzle;

                        const carInitialDigits: GivenDigitsMap<number> = {};
                        for (const [index, { cells }] of cars.entries()) {
                            let { top, left } = carPositions[index];
                            top = Math.round(top);
                            left = Math.round(left);
                            for (const cell of cells) {
                                const digit = initialDigits[cell.top]?.[cell.left];
                                if (digit !== undefined) {
                                    const offsetTop = cell.top + top;
                                    const offsetLeft = cell.left + left;
                                    carInitialDigits[offsetTop] = carInitialDigits[offsetTop] ?? {};
                                    carInitialDigits[offsetTop][offsetLeft] = digit;
                                }
                            }
                        }

                        const fixedContext = context.cloneWith({
                            puzzle: {
                                ...puzzle,
                                initialDigits: mergeGivenDigitsMaps(carInitialDigits, initialDigits),
                                items: processedItems.map(({ carIndex, ...item }) => {
                                    if (carIndex !== undefined) {
                                        const position = carPositions[carIndex];
                                        return cloneConstraint(item, {
                                            processCellCoords: ({ top, left }) => ({
                                                top: Math.round(top + position.top),
                                                left: Math.round(left + position.left),
                                            }),
                                        });
                                    }
                                    return item;
                                }),
                            },
                        });

                        if (resultChecker !== isValidFinishedPuzzleByConstraints) {
                            const result2 = isValidFinishedPuzzleByConstraints(fixedContext);
                            if (!result2.isCorrectResult) {
                                return result2;
                            }
                        }

                        return resultChecker!(fixedContext);
                    };
                }
            }
        }

        return puzzle;
    },

    controlButtons: [
        {
            key: "rush-hour-hide-cars",
            region: ControlButtonRegion.right,
            Component: RushHourHideCarsButton,
        },
    ],

    items: [RushHourCarsConstraint],

    // TODO: support shared games
};
