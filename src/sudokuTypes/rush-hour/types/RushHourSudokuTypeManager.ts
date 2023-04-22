import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {RushHourGameState, RushHourProcessedGameState} from "./RushHourGameState";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {mixAnimatedValue, useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {RushHourMoveCellWriteModeInfo} from "./RushHourMoveCellWriteModeInfo";
import {GridRegion, transformCoordsByRegions} from "../../../types/sudoku/GridRegion";
import {RushHourPTM} from "./RushHourPTM";
import {gameStateGetCurrentFieldState, PartialGameStateEx} from "../../../types/sudoku/GameState";
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
import {RegionCarConstraint} from "../components/Car";

export const RushHourSudokuTypeManager: SudokuTypeManager<RushHourPTM> = {
    ...DigitSudokuTypeManager<RushHourPTM>(),

    disableConflictChecker: true,

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
        cell, xDirection, yDirection, context
    ): { cell?: Position; state?: PartialGameStateEx<RushHourPTM> } {
        const {
            puzzle: {
                fieldSize: {fieldSize},
                extension,
            },
            state,
        } = context;
        const cars = extension?.cars ?? [];
        const {extension: {cars: carsPositions}} = gameStateGetCurrentFieldState(state);

        let {top, left} = context.puzzle.typeManager.transformCoords?.(cell, context) ?? cell;
        top = loop(top + yDirection, fieldSize);
        left = loop(left + xDirection, fieldSize);

        if (!state.extension.hideCars) {
            for (const [index, {boundingRect}] of cars.entries()) {
                const carsPosition = carsPositions[index];
                const carTop = boundingRect.top + carsPosition.top;
                const carLeft = boundingRect.left + carsPosition.left;
                if (
                    top >= carTop && top + 1 <= carTop + boundingRect.height &&
                    left >= carLeft && left + 1 <= carLeft + boundingRect.width
                ) {
                    return {
                        cell: {
                            top: top - carsPosition.top,
                            left: left - carsPosition.left,
                        },
                    };
                }
            }
        }

        return {cell: {top, left}};
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
        const hideCars = hideCarsState && cellWriteMode !== CellWriteMode.move;

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
                    noInteraction: hideCars,
                    opacity: hideCars ? 0.2 : undefined,
                    zIndex: 1,
                };
            }),
        ];
    },

    getRegionsForRowsAndColumns() {
        // TODO
        return [];
    },

    mapImportedColors: true,

    disabledCellWriteModes: [CellWriteMode.move],
    extraCellWriteModes: [RushHourMoveCellWriteModeInfo],

    postProcessPuzzle(puzzle): PuzzleDefinition<RushHourPTM> {
        let {initialColors, fieldSize: {fieldSize}} = puzzle;

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

                    // puzzle.initialColors[top][offsetLeft] = [averageColor];
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
            puzzle.extension = {
                cars: Object.values(carsMap)
                    .flatMap(
                        ({color, cells}) => cellsIndex.splitUnconnectedRegions([cells]).map(
                            (cells) => ({
                                color,
                                cells,
                                boundingRect: getRegionBoundingBox(cells, 1),
                            })
                        )
                    ),
            };
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

    items: [RegionCarConstraint],

    // TODO: support shared games
};
