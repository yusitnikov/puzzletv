import {PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import React from "react";
import {MultiStageSudokuTypeManager} from "../../sudokuTypes/multi-stage/types/MultiStageSudokuTypeManager";
import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {ToMultiStagePTM} from "../../sudokuTypes/multi-stage/types/MultiStagePTM";
import {FPuzzles} from "./FPuzzles";
import {RushHourPTM} from "../../sudokuTypes/rush-hour/types/RushHourPTM";
import {PuzzleImportOptions, PuzzleImportPuzzleType} from "../../types/sudoku/PuzzleImportOptions";
import {cageTag} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {Rect} from "../../types/layout/Rect";
import {getRegionBoundingBox} from "../../utils/regions";
import {AutoSvg} from "../../components/svg/auto-svg/AutoSvg";
import {RushHourMoveCellWriteModeInfo} from "../../sudokuTypes/rush-hour/types/RushHourMoveCellWriteModeInfo";
import {CellWriteModeInfo} from "../../types/sudoku/CellWriteModeInfo";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {MultiStageGameState} from "../../sudokuTypes/multi-stage/types/MultiStageGameState";
import {carMargin} from "../../sudokuTypes/rush-hour/components/RushHourCar";
import {textTag} from "../../components/sudoku/constraints/text/Text";

type ReservedParkingPTM = ToMultiStagePTM<RushHourPTM>;

const hasParkedCar = (
    {puzzle: {extension}, state}: PuzzleContext<ReservedParkingPTM>,
    expected: Rect,
) => {
    const cars = extension?.cars ?? [];
    const {extension: {cars: carPositions}} = gameStateGetCurrentFieldState(state);

    return cars.some(({boundingRect: {top, left, width, height}}, index) => {
        const offset = carPositions[index];
        return width === expected.width && height === expected.height
            && top + Math.round(offset.top) === expected.top && left + Math.round(offset.left) === expected.left;
    });
};

export const ReservedParking: PuzzleDefinitionLoader<ReservedParkingPTM> = {
    loadPuzzle: () => {
        const {typeManager, items, resultChecker, ...base}: Omit<PuzzleDefinition<ReservedParkingPTM>, "slug"> = FPuzzles.loadPuzzle({
            type: PuzzleImportPuzzleType.RushHour,
            load: "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",
        } as PuzzleImportOptions);

        return {
            ...base,
            typeManager: {
                ...MultiStageSudokuTypeManager<ReservedParkingPTM>({
                    baseTypeManager: typeManager,
                    getStage: (context) => hasParkedCar(context, {top: 2, left: 7, width: 2, height: 1}) ? 2 : 1,
                }),
                extraCellWriteModes: [RushHourMoveCellWriteModeInfo(
                    ({top, left, width, height}, isVertical, {state: {extension}}) => {
                        const value = isVertical ? top : left;
                        const size = isVertical ? height : width;
                        if (!isVertical && top === 2) {
                            // It's the red car
                            return value;
                        }
                        if ((extension as unknown as MultiStageGameState).stage === 2) {
                            // There's no cage anymore
                            return value;
                        }
                        return Math.min(value, 6 + carMargin - size);
                    }
                ) as unknown as CellWriteModeInfo<ReservedParkingPTM>],
            },
            items: (state) => {
                const parkedRedCar = state.extension.stage === 2;
                const baseItems = typeof items === "function" ? items(state) : items ?? [];

                return baseItems.map((item) => {
                    if (item.tags?.includes(cageTag)) {
                        if (item.cells.length === 2) {
                            const boundingBox = getRegionBoundingBox(item.cells, 1);

                            return {
                                ...item,
                                isValidPuzzle(
                                    lines,
                                    digits,
                                    regionCells,
                                    context
                                ): boolean {
                                    return hasParkedCar(context, boundingBox);
                                },
                            };
                        } else {
                            // Disable the outer cage after parking the red car
                            return {
                                ...item,
                                component: parkedRedCar
                                    ? {}
                                    : Object.fromEntries(Object.entries(item.component ?? {}).map(([layer, Component]) => [
                                        layer,
                                        (props) => <AutoSvg
                                            top={0}
                                            left={0}
                                            width={6.45}
                                            height={6}
                                            clip={true}
                                        >
                                            <Component {...props}/>
                                        </AutoSvg>,
                                    ])),
                            };
                        }
                    }

                    if (item.tags?.includes(textTag)) {
                        // Enable the extra givens after parking the red car
                        return {
                            ...item,
                            component: parkedRedCar ? item.component : undefined,
                        };
                    }

                    return item;
                });
            },
            resultChecker: (context) => {
                // Hack the digits count in the context to check only the global constraints, not the digits
                if (!isValidFinishedPuzzleByConstraints({...context, puzzle: {...context.puzzle, digitsCount: 0}})) {
                    return false;
                }

                return resultChecker?.(context) ?? true;
            }
        };
    },
    noIndex: true,
    slug: "reserved-parking",
};
