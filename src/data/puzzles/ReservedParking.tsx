import {PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
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
import {comparer, IReactionDisposer, reaction} from "mobx";

// TODO: accessibility for color-blind

type ReservedParkingPTM = ToMultiStagePTM<RushHourPTM>;

const hasParkedCar = (
    {
        puzzle: {extension},
        fieldExtension: {cars: carPositions},
    }: PuzzleContext<ReservedParkingPTM>,
    expected: Rect,
) => {
    const cars = extension?.cars ?? [];

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
                    ({top, left, width, height}, isVertical, {stateExtension}) => {
                        const value = isVertical ? top : left;
                        const size = isVertical ? height : width;
                        if (!isVertical && top === 2) {
                            // It's the red car
                            return value;
                        }
                        if ((stateExtension as unknown as MultiStageGameState).stage === 2) {
                            // There's no cage anymore
                            return value;
                        }
                        return Math.min(value, 6 + carMargin - size);
                    }
                ) as unknown as CellWriteModeInfo<ReservedParkingPTM>],
                getReactions(context): IReactionDisposer[] {
                    return [
                        reaction(
                            () => {
                                const {
                                    puzzle: {
                                        items: itemsFn,
                                        extension,
                                    },
                                    allInitialDigits,
                                } = context;
                                const items = typeof itemsFn === "function" ? itemsFn(context) : itemsFn ?? [];

                                const newInitialDigitsCandidates: (Position & {digit: number})[] = [];
                                for (const {tags, cells: [cell], props} of items) {
                                    if (tags?.includes(textTag) && !allInitialDigits[cell.top]?.[cell.left]) {
                                        newInitialDigitsCandidates.push({
                                            ...cell,
                                            digit: Number((props as TextProps).text),
                                        });
                                    }
                                }

                                const {fieldExtension: {cars: carPositions}} = context;
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

                                return newInitialDigits;
                            },
                            (newInitialDigits) => {
                                if (Object.keys(newInitialDigits).length !== 0) {
                                    context.onStateChange({
                                        initialDigits: mergeGivenDigitsMaps(context.stateInitialDigits, newInitialDigits),
                                    });
                                }
                            },
                            {
                                name: "digits discovered by cars",
                                equals: comparer.structural,
                            }
                        )
                    ];
                },
            },
            items: (context) => {
                const parkedRedCar = context.stateExtension.stage === 2;
                const baseItems = typeof items === "function" ? items(context) : items ?? [];

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
                if (!isValidFinishedPuzzleByConstraints(context.cloneWith({puzzle: {...context.puzzle, digitsCount: 0}}))) {
                    return false;
                }

                return resultChecker?.(context) ?? true;
            }
        };
    },
    noIndex: true,
    slug: "reserved-parking",
};
