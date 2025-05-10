import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { RotatableCluesGameState } from "./RotatableCluesGameState";
import { getAveragePosition, stringifyPosition } from "../../../types/layout/Position";
import { AnimatedValue } from "../../../types/struct/AnimatedValue";
import { RotatableCluesPTM } from "./RotatableCluesPTM";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { ControlButtonItem, ControlButtonRegion } from "../../../components/puzzle/controls/ControlButtonsManager";
import { RotatableClue } from "./RotatableCluesPuzzleExtension";
import { Constraint, isValidFinishedPuzzleByConstraints } from "../../../types/puzzle/Constraint";
import {
    DecorativeShapeProps,
    isEllipse,
} from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { RotatableClueConstraint } from "../constraints/RotatableClue";
import { RotateClueButton } from "../components/RotateClueButton";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { loop } from "../../../utils/math";
import { ArrowProps, isArrowConstraint } from "../../../components/puzzle/constraints/arrow/Arrow";
import { comparer, IReactionDisposer, reaction } from "mobx";
import { settings } from "../../../types/layout/Settings";
import { createWheel } from "../../../components/puzzle/constraints/wheel/Wheel";
import { isTextConstraint } from "../../../components/puzzle/constraints/text/Text";
import {
    addGridStateExToPuzzleTypeManager,
    addGameStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { RotatableCluesGridState } from "./RotatableCluesGridState";
import { rotateNumber } from "../../../components/puzzle/digit/DigitComponentType";

interface CluesImporterResult<T extends AnyPTM> {
    clues: RotatableClue[];
    filteredItems?: PuzzleDefinition<RotatableCluesPTM<T>>["items"];
}

interface RotatableCluesOptions<T extends AnyPTM> {
    baseTypeManager: PuzzleTypeManager<T>;
    // Do all clues remain the same when the pivot is turned 360 degrees?
    isEquivalentLoop: boolean;
    compensateConstraintDigitAngle?: boolean;
    cluesImporter?: (puzzle: PuzzleDefinition<RotatableCluesPTM<T>>) => CluesImporterResult<T>;
    angleStep?: number;
}

export const RotatableCluesTypeManager = <T extends AnyPTM>({
    baseTypeManager: { postProcessPuzzle, controlButtons = [], ...baseTypeManager },
    isEquivalentLoop,
    compensateConstraintDigitAngle = true,
    cluesImporter,
    angleStep = 90,
}: RotatableCluesOptions<T>): PuzzleTypeManager<RotatableCluesPTM<T>> => ({
    ...addGameStateExToPuzzleTypeManager(
        addGridStateExToPuzzleTypeManager(baseTypeManager as unknown as PuzzleTypeManager<RotatableCluesPTM<T>>, {
            initialGridStateExtension(puzzle): RotatableCluesGridState {
                return {
                    clueAngles: puzzle?.extension?.clues.map(() => 0) ?? [],
                };
            },
        }),
        {
            initialGameStateExtension(puzzle): RotatableCluesGameState {
                return {
                    clues: puzzle?.extension?.clues.map(() => ({ animating: false })) ?? [],
                };
            },
        },
    ),

    getReactions(context: PuzzleContext<RotatableCluesPTM<T>>): IReactionDisposer[] {
        const baseReactions = baseTypeManager.getReactions?.(context as unknown as PuzzleContext<T>) ?? [];

        if (context.puzzle.importOptions?.freeRotation) {
            return baseReactions;
        }

        return [
            ...baseReactions,
            reaction(
                () => {
                    const {
                        puzzle,
                        gridExtension: { clueAngles },
                    } = context;
                    const clues: RotatableClue[] = puzzle.extension?.clues ?? [];

                    return (clueAngles as number[]).map((manualAngle, index) => {
                        const {
                            pivot: { top, left },
                        } = clues[index];
                        const data = context.getCellDigit(top, left);
                        if (data === undefined) {
                            return manualAngle;
                        }
                        const digit = puzzle.typeManager.getDigitByCellData(data, context, { top, left });
                        const forcedAngle = digit * angleStep;
                        // Find the closest angle to the manual angle, so that we don't have weird animation (but rotate only clockwise)
                        return isEquivalentLoop ? manualAngle + loop(forcedAngle - manualAngle, 360) : forcedAngle;
                    });
                },
                (processedClueAngles) => {
                    const {
                        gridExtension: { clueAngles },
                    } = context;

                    if (processedClueAngles.some((value, index) => value !== clueAngles[index])) {
                        const { clientId, actionId } = context.currentGridState;

                        context.onStateChange({
                            gridStateHistory: gridStateHistoryAddState(
                                context,
                                // repeat clientId and actionId of the action that caused this change
                                clientId,
                                actionId,
                                (gridState) => ({
                                    ...gridState,
                                    extension: {
                                        ...gridState.extension,
                                        clueAngles: processedClueAngles,
                                    },
                                }),
                            ),
                            extension: {
                                ...context.stateExtension,
                                clues: context.stateExtension.clues.map(() => ({ animating: true })),
                            },
                        });
                    }
                },
                {
                    name: "update clue angles according to digits",
                    equals: comparer.structural,
                },
            ),
        ];
    },

    postProcessPuzzle(puzzle): PuzzleDefinition<RotatableCluesPTM<T>> {
        if (postProcessPuzzle) {
            puzzle = postProcessPuzzle(puzzle as unknown as PuzzleDefinition<T>) as unknown as PuzzleDefinition<
                RotatableCluesPTM<T>
            >;
        }

        if (!puzzle.extension?.clues) {
            const result = cluesImporter?.(puzzle);

            puzzle = {
                ...puzzle,
                items: result?.filteredItems ?? puzzle.items,
                extension: {
                    ...puzzle.extension,
                    clues: result?.clues ?? [],
                },
            };
        }

        const prevItems = puzzle.items ?? [];
        puzzle = {
            ...puzzle,
            items: (context) => {
                const {
                    gridExtension: { clueAngles },
                } = context;

                return [
                    ...(typeof prevItems === "function" ? prevItems(context) : prevItems),
                    ...((puzzle.extension?.clues as RotatableClue[]) ?? []).flatMap((rootClue, index) => {
                        const animatedClueAngle = getAnimatedRotatableClueAngle(context, index);

                        return [rootClue, ...(rootClue.dependentClues ?? [])].flatMap((clue) =>
                            RotatableClueConstraint(
                                clue,
                                clueAngles[index] * (clue.coeff ?? 1),
                                animatedClueAngle * (clue.coeff ?? 1),
                            ),
                        );
                    }),
                ];
            },
        };

        const { resultChecker } = puzzle;
        if (resultChecker) {
            puzzle = {
                ...puzzle,
                resultChecker: (context) => {
                    const result = resultChecker(context);

                    if (result.isCorrectResult && resultChecker !== isValidFinishedPuzzleByConstraints) {
                        const result2 = isValidFinishedPuzzleByConstraints(context);
                        if (!result2.isCorrectResult) {
                            return result2;
                        }
                    }

                    return result;
                },
            };
        }

        return puzzle;
    },

    controlButtons: [
        ...(controlButtons as (ControlButtonItem<RotatableCluesPTM<T>> | undefined | false)[]),
        {
            key: "rotate-clue-right",
            region: ControlButtonRegion.additional,
            Component: RotateClueButton(angleStep),
        },
        {
            key: "rotate-clue-left",
            region: ControlButtonRegion.additional,
            Component: RotateClueButton(-angleStep),
        },
    ],

    compensateConstraintDigitAngle,
    transformNumber(num, context, _cell, constraint): number {
        if (constraint && !compensateConstraintDigitAngle) {
            const angle = loop((constraint as any)._rotatableClueAngle ?? 0, 360);

            switch (angle) {
                case 0:
                    return num;
                case 180:
                    return rotateNumber(context.puzzle, num);
                default:
                    return Number.NaN;
            }
        }

        return num;
    },

    // TODO: support shared games
});

export const ImportedRotatableCluesTypeManager = <T extends AnyPTM>(
    options: Omit<RotatableCluesOptions<T>, "isEquivalentLoop" | "cluesImporter">,
) =>
    RotatableCluesTypeManager({
        ...options,
        isEquivalentLoop: true,
        cluesImporter: (puzzle) => {
            const isWheels = puzzle.importOptions?.wheels;
            const keepCircles = puzzle.importOptions?.keepCircles;

            let { items } = puzzle;
            if (Array.isArray(items)) {
                items = items.map((item) =>
                    isArrowConstraint(item)
                        ? ({
                              ...item,
                              props: {
                                  ...item.props,
                                  transparentCircle: true,
                              },
                          } as Constraint<RotatableCluesPTM<T>, ArrowProps>)
                        : item,
                );

                const isPivot = (
                    item: Constraint<RotatableCluesPTM<T>, any>,
                ): item is Constraint<RotatableCluesPTM<T>, DecorativeShapeProps> =>
                    isEllipse(item) &&
                    item.cells.length === 1 &&
                    item.cells[0].top % 0.5 === 0 &&
                    item.cells[0].left % 0.5 === 0;

                const pivots = items.filter(isPivot).map(({ cells: [cell], props: { width: diameter } }) => ({
                    cell,
                    radius: Math.max(keepCircles && !isWheels ? diameter / 2 : 0.5, 0.5),
                }));

                if (!keepCircles) {
                    items = items.filter((item) => !isPivot(item));
                }

                const getCluePivot = ({ cells }: Constraint<RotatableCluesPTM<T>>) => {
                    if (cells.length) {
                        for (const { top, left } of [...cells, getAveragePosition(cells)]) {
                            for (const { cell, radius } of pivots) {
                                const dx = cell.left - left;
                                const dy = cell.top - top;

                                if (dx * dx + dy * dy <= radius * radius) {
                                    return cell;
                                }
                            }
                        }
                    }

                    return undefined;
                };

                const cluesMap: Record<string, RotatableClue> = {};
                for (const clue of items) {
                    const pivot = getCluePivot(clue);
                    if (!pivot) {
                        continue;
                    }
                    const key = stringifyPosition(pivot);
                    cluesMap[key] = cluesMap[key] ?? {
                        pivot,
                        clues: [],
                    };
                    cluesMap[key].clues.push(clue);
                }
                let clues = Object.values(cluesMap);
                if (isWheels) {
                    clues = clues.map(({ pivot, clues }) => {
                        const digits = Array<number | undefined>(4).fill(undefined);

                        for (const clue of clues) {
                            const { cells } = clue;
                            if (!isTextConstraint(clue) || cells.length > 2) {
                                continue;
                            }

                            const value = Number(clue.props.text);
                            if (!Number.isFinite(value)) {
                                continue;
                            }

                            const { top, left } = getAveragePosition(cells);
                            const dx = pivot.left - left;
                            const dy = pivot.top - top;

                            if (dx === 0 && dy === -0.5) {
                                digits[3] = value;
                            }
                            if (dx === 0.5 && dy === 0) {
                                digits[0] = value;
                            }
                            if (dx === 0 && dy === 0.5) {
                                digits[1] = value;
                            }
                            if (dx === -0.5 && dy === 0) {
                                digits[2] = value;
                            }
                        }

                        return createWheel(pivot, ...digits);
                    });
                }
                const noPivotItems = items.filter((clue) => !getCluePivot(clue));

                return {
                    clues: clues,
                    filteredItems: noPivotItems,
                };
            }

            return { clues: [] };
        },
    });

export const getAnimatedRotatableClueAngle = <T extends AnyPTM>(
    context: PuzzleContext<RotatableCluesPTM<T>>,
    index: number,
) =>
    context.getCachedItem(
        `animatedRotatableClueAngle[${index}]`,
        () =>
            new AnimatedValue(
                () => (context.gridExtension.clueAngles as number[])[index],
                () => (context.stateExtension.clues[index].animating ? settings.animationSpeed.get() / 2 : 0),
            ),
    ).animatedValue;
