import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {RushHourGameState, RushHourProcessedGameState} from "./RushHourGameState";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {mixAnimatedValue, useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {RushHourMoveCellWriteModeInfo} from "./RushHourMoveCellWriteModeInfo";
import {GridRegion, transformCoordsByRegions} from "../../../types/sudoku/GridRegion";
import {RushHourPTM} from "./RushHourPTM";
import {gameStateGetCurrentFieldState} from "../../../types/sudoku/GameState";
import {RushHourFieldState} from "./RushHourFieldState";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {RushHourCar} from "./RushHourPuzzleExtension";
import {resolveCellColorValue} from "../../../types/sudoku/CellColor";
import {getAverageColorsStr} from "../../../utils/color";
import {getRegionBoundingBox} from "../../../utils/regions";
import {loop} from "../../../utils/math";
import {ControlButtonRegion} from "../../../components/sudoku/controls/ControlButtonsManager";
import {RushHourHideCarsButton} from "../components/RushHourHideCarsButton";
import {RushHourCarsConstraint} from "../components/RushHourCar";
import {getDefaultRegionsForRowsAndColumns} from "../../../types/sudoku/FieldSize";
import {GivenDigitsMap, mergeGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {CellTypeProps} from "../../../types/sudoku/CellTypeProps";
import {createRandomGenerator} from "../../../utils/random";
import {cloneConstraint} from "../../../types/sudoku/Constraint";

export const RushHourSudokuTypeManager: SudokuTypeManager<RushHourPTM> = {
    ...DigitSudokuTypeManager<RushHourPTM>(),

    serializeGameState({cars, hideCars}): any {
        return {cars, hideCars};
    },

    unserializeGameState({cars, hideCars = false}): Partial<RushHourGameState> {
        return {cars, hideCars};
    },

    initialGameStateExtension: (puzzle) => {
        return {
            cars: puzzle.extension?.cars.map(() => ({animating: false})) ?? [],
            hideCars: false,
        };
    },
    initialFieldStateExtension: (puzzle) => {
        return {
            cars: puzzle.extension?.cars.map(() => ({
                top: 0,
                left: -puzzle.fieldSize.rowsCount,
            })) ?? [],
        };
    },

    areFieldStateExtensionsEqual(a, b): boolean {
        return a.cars.every((carA, index) => {
            return isSamePosition(carA, b.cars[index]);
        })
    },

    cloneFieldStateExtension({cars}): RushHourFieldState {
        return {
            cars: cars.map((position) => ({...position})),
        };
    },

    useProcessedGameStateExtension(state): RushHourProcessedGameState {
        const {animationSpeed, extension: {cars: carAnimations}} = state;
        const {extension: {cars: carPositions}} = gameStateGetCurrentFieldState(state);

        return {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            cars: carPositions.map((position, index) => useAnimatedValue(
                position,
                carAnimations[index].animating ? animationSpeed / 2 : 0,
                (a, b, coeff) => {
                    return {
                        top: mixAnimatedValue(a.top, b.top, coeff),
                        left: mixAnimatedValue(a.left, b.left, coeff),
                    };
                }
            )),
        };
    },

    getProcessedGameStateExtension(state): RushHourProcessedGameState {
        const {extension: {cars}} = gameStateGetCurrentFieldState(state);
        return {cars};
    },

    processArrowDirection(
        {top, left}, xDirection, yDirection, {puzzle: {fieldSize: {fieldSize}}}
    ): { cell?: Position } {
        return {
            cell: {
                top: loop(top + yDirection, fieldSize),
                left: loop(left + xDirection, fieldSize),
            },
        };
    },

    transformCoords: transformCoordsByRegions,

    getRegionsWithSameCoordsTransformation(
        {
            puzzle: {
                extension: carsInfo,
                fieldSize: {fieldSize},
            },
            state: {
                processed: {cellWriteMode},
                extension: {hideCars: hideCarsState},
                processedExtension: {cars: carPositions},
            },
        },
    ): GridRegion[] {
        const isMoveMode = cellWriteMode === CellWriteMode.move;
        const hideCars = hideCarsState && !isMoveMode;

        return [
            {
                top: 0,
                left: 0,
                width: fieldSize,
                height: fieldSize,
                zIndex: 0,
            },
            ...(carsInfo?.cars ?? []).map(({cells, boundingRect}, index): GridRegion => {
                const {top, left} = carPositions[index];
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

    getCellTypeProps({left}, {fieldSize: {fieldSize}}): CellTypeProps<RushHourPTM> {
        if (left >= fieldSize) {
            return {isSelectable: false, isCheckingSolution: false};
        }
        return {};
    },

    getRegionsForRowsAndColumns({puzzle: {fieldSize: {fieldSize}, ...puzzle}, ...context}) {
        return getDefaultRegionsForRowsAndColumns({
            ...context,
            puzzle: {
                ...puzzle,
                fieldSize: {
                    fieldSize,
                    rowsCount: fieldSize,
                    columnsCount: fieldSize,
                },
            },
        });
    },

    mapImportedColors: true,

    disabledCellWriteModes: [CellWriteMode.move],
    extraCellWriteModes: [RushHourMoveCellWriteModeInfo()],

    postProcessPuzzle(puzzle): PuzzleDefinition<RushHourPTM> {
        let {initialColors, fieldSize: {fieldSize}, resultChecker, items} = puzzle;

        puzzle = {
            ...puzzle,
            fieldSize: {
                ...puzzle.fieldSize,
                columnsCount: fieldSize * 2,
            },
            ignoreRowsColumnCountInTheWrapper: true,
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
                    const offsetLeft = left + fieldSize;
                    if (colors.length === 0) {
                        continue;
                    }
                    const resolvedColors = colors.map(resolveCellColorValue);
                    const averageColor = getAverageColorsStr(resolvedColors);

                    const {[left]: initialDigit, ...rowInitialDigits} = puzzle.initialDigits?.[top] ?? {};
                    if (initialDigit !== undefined) {
                        puzzle.initialDigits = {
                            ...puzzle.initialDigits,
                            [top]: {
                                ...rowInitialDigits,
                                [offsetLeft]: initialDigit,
                            },
                        }
                    }

                    const key = resolvedColors.join(",");
                    carsMap[key] = carsMap[key] ?? {
                        cells: [],
                        color: averageColor,
                    };
                    carsMap[key].cells.push({top, left: offsetLeft});
                }
            }

            const cellsIndex = new SudokuCellsIndex(puzzle);
            const randomizer = createRandomGenerator(0);
            const cars = Object.values(carsMap)
                .flatMap(
                    ({color, cells}) => cellsIndex.splitUnconnectedRegions([cells]).map(
                        (cells): RushHourCar => ({
                            color,
                            invert: randomizer() < 0.5,
                            cells,
                            boundingRect: getRegionBoundingBox(cells, 1),
                        })
                    )
                );
            puzzle.extension = {cars};

            if (Array.isArray(items)) {
                puzzle = {
                    ...puzzle,
                    items: items.map((item) => {
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

                        for (const {boundingRect: {top, left: offsetLeft, width, height}} of cars) {
                            const left = offsetLeft - fieldSize;
                            if (itemTop >= top && itemLeft >= left && itemBottom <= top + height && itemRight <= left + width) {
                                return cloneConstraint(item, {
                                    processCellCoords: ({top, left}) => ({top, left: left + fieldSize}),
                                });
                            }
                        }

                        return item;
                    }),
                };
            }

            if (resultChecker) {
                puzzle.resultChecker = (context) => {
                    const {puzzle, state} = context;
                    const {initialDigits = {}} = puzzle;
                    const {extension: {cars: carPositions}} = gameStateGetCurrentFieldState(state);

                    const carInitialDigits: GivenDigitsMap<number> = {};
                    for (const [index, {cells}] of cars.entries()) {
                        let {top, left} = carPositions[index];
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

                    return resultChecker!({
                        ...context,
                        puzzle: {
                            ...puzzle,
                            initialDigits: mergeGivenDigitsMaps(carInitialDigits, initialDigits),
                        },
                    });
                };
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
