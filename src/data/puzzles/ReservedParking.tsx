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
                                    stateInitialDigits = {},
                                } = context;
                                const items = typeof itemsFn === "function" ? itemsFn(context) : itemsFn ?? [];

                                const newInitialDigitsCandidates: (Position & {digit: number})[] = [];
                                for (const {tags, cells: [cell], props} of items) {
                                    if (tags?.includes(textTag) && !stateInitialDigits[cell.top]?.[cell.left]) {
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
