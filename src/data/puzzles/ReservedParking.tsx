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
import {TextProps, textTag} from "../../components/sudoku/constraints/text/Text";
import {GivenDigitsMap, mergeGivenDigitsMaps} from "../../types/sudoku/GivenDigitsMap";
import {Position} from "../../types/layout/Position";
import {LanguageCode} from "../../types/translations/LanguageCode";

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
                    getStageCompletionText: () => ({
                        [LanguageCode.en]: "Great job freeing the car!",
                    }),
                    getStageButtonText: () => ({
                        [LanguageCode.en]: "Release all other cars from the cage",
                    }),
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
                applyStateDiffEffect(state, prevState, context) {
                    const {puzzle: {items: itemsFn, extension}, onStateChange} = context;
                    const items = typeof itemsFn === "function" ? itemsFn(state) : itemsFn ?? [];

                    const {initialDigits = {}} = state;
                    const newInitialDigitsCandidates: (Position & {digit: number})[] = [];
                    for (const {tags, cells: [cell], props} of items) {
                        if (tags?.includes(textTag) && !initialDigits[cell.top]?.[cell.left]) {
                            newInitialDigitsCandidates.push({
                                ...cell,
                                digit: Number((props as TextProps).text),
                            });
                        }
                    }

                    const {extension: {cars: carPositions}} = gameStateGetCurrentFieldState(state);
                    const newInitialDigits: GivenDigitsMap<number> = {};
                    for (const [index, {boundingRect: {top, left, width, height}}] of (extension?.cars ?? []).entries()) {
                        const offset = carPositions[index];
                        const offsetTop = top + offset.top;
                        const offsetLeft = left + offset.left;
                        const offsetBottom = offsetTop + height;
                        const offsetRight = offsetLeft + width;

                        for (const {top, left, digit} of newInitialDigitsCandidates) {
                            const centerTop = top + 0.5;
                            const centerLeft = left + 0.5;
                            if (centerTop >= offsetTop && centerTop <= offsetBottom && centerLeft >= offsetLeft && centerLeft <= offsetRight) {
                                newInitialDigits[top] = newInitialDigits[top] || {};
                                newInitialDigits[top][left] = digit;
                            }
                        }
                    }

                    if (Object.keys(newInitialDigits).length !== 0) {
                        onStateChange({
                            initialDigits: mergeGivenDigitsMaps(initialDigits, newInitialDigits),
                        });
                    }
                },
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
                        // Hide all "white digits"
                        return {...item, component: undefined};
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
