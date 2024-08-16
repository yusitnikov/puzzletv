import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {RotatableCluesGameState, RotatableCluesProcessedGameState} from "./RotatableCluesGameState";
import {getAveragePosition, stringifyPosition} from "../../../types/layout/Position";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {RotatableCluesPTM} from "./RotatableCluesPTM";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {ControlButtonItem, ControlButtonRegion} from "../../../components/sudoku/controls/ControlButtonsManager";
import {RotatableClue} from "./RotatableCluesPuzzleExtension";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../../types/sudoku/Constraint";
import {DecorativeShapeProps, ellipseTag} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";
import {RotatableClueConstraint} from "../constraints/RotatableClue";
import {RotateClueButton} from "../components/RotateClueButton";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {loop} from "../../../utils/math";
import {ArrowProps, isArrowConstraint} from "../../../components/sudoku/constraints/arrow/Arrow";
import {comparer, IReactionDisposer, reaction} from "mobx";
import {settings} from "../../../types/layout/Settings";
import {createWheel} from "../../../components/sudoku/constraints/wheel/Wheel";
import {isTextConstraint} from "../../../components/sudoku/constraints/text/Text";
import {addFieldStateExToSudokuManager, addGameStateExToSudokuManager} from "../../../types/sudoku/SudokuTypeManagerPlugin";
import {RotatableCluesFieldState} from "./RotatableCluesFieldState";
import {rotateNumber} from "../../../components/sudoku/digit/DigitComponentType";

interface CluesImporterResult<T extends AnyPTM> {
    clues: RotatableClue[];
    filteredItems?: PuzzleDefinition<RotatableCluesPTM<T>>["items"];
}

export const RotatableCluesSudokuTypeManager = <T extends AnyPTM>(
    {
        postProcessPuzzle,
        controlButtons = [],
        ...baseTypeManager
    }: SudokuTypeManager<T>,
    // Do all clues remain the same when the pivot is turned 360 degrees?
    isEquivalentLoop: boolean,
    compensateConstraintDigitAngle = true,
    cluesImporter: ((puzzle: PuzzleDefinition<RotatableCluesPTM<T>>) => CluesImporterResult<T>) | undefined = undefined,
): SudokuTypeManager<RotatableCluesPTM<T>> => ({
    ...addGameStateExToSudokuManager(
        addFieldStateExToSudokuManager(
            baseTypeManager as unknown as SudokuTypeManager<RotatableCluesPTM<T>>,
            {
                initialFieldStateExtension(puzzle): RotatableCluesFieldState {
                    return {
                        clueAngles: puzzle?.extension?.clues.map(() => 0) ?? [],
                    };
                },
            }
        ),
        {
            initialGameStateExtension(puzzle): RotatableCluesGameState {
                return {
                    clues: puzzle?.extension?.clues.map(() => ({animating: false})) ?? [],
                };
            },
            useProcessedGameStateExtension(context): RotatableCluesProcessedGameState {
                const {
                    fieldExtension: {clueAngles},
                    stateExtension: {clues: clueAnimations},
                } = context;

                return {
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    clueAngles: (clueAngles as number[]).map((angle, index) => useAnimatedValue(
                        angle,
                        clueAnimations[index].animating ? settings.animationSpeed.get() / 2 : 0
                    )),
                };
            },
            getProcessedGameStateExtension({fieldExtension: {clueAngles}}): RotatableCluesProcessedGameState {
                return {clueAngles};
            },
        }
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
                        fieldExtension: {clueAngles},
                    } = context;
                    const clues: RotatableClue[] = puzzle.extension?.clues ?? [];

                    return (clueAngles as number[]).map((manualAngle, index) => {
                        const {pivot: {top, left}} = clues[index];
                        const data = context.getCellDigit(top, left);
                        if (data === undefined) {
                            return manualAngle;
                        }
                        const digit = puzzle.typeManager.getDigitByCellData(data, context, {top, left});
                        const forcedAngle = digit * 90;
                        // Find the closest angle to the manual angle, so that we don't have weird animation (but rotate only clockwise)
                        return isEquivalentLoop
                            ? manualAngle + loop(forcedAngle - manualAngle, 360)
                            : forcedAngle;
                    });
                },
                (processedClueAngles) => {
                    const {fieldExtension: {clueAngles}} = context;

                    if (processedClueAngles.some((value, index) => value !== clueAngles[index])) {
                        const {clientId, actionId} = context.currentFieldState;

                        context.onStateChange({
                            fieldStateHistory: fieldStateHistoryAddState(
                                context,
                                // repeat clientId and actionId of the action that caused this change
                                clientId,
                                actionId,
                                (fieldState) => ({
                                    ...fieldState,
                                    extension: {
                                        ...fieldState.extension,
                                        clueAngles: processedClueAngles,
                                    },
                                })
                            ),
                            extension: {
                                ...context.stateExtension,
                                clues: context.stateExtension.clues.map(() => ({animating: true})),
                            },
                        });
                    }
                },
                {
                    name: "update clue angles according to digits",
                    equals: comparer.structural,
                }
            ),
        ];
    },

    postProcessPuzzle(puzzle): PuzzleDefinition<RotatableCluesPTM<T>> {
        if (postProcessPuzzle) {
            puzzle = postProcessPuzzle(puzzle as unknown as PuzzleDefinition<T>) as unknown as PuzzleDefinition<RotatableCluesPTM<T>>;
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
                    fieldExtension: {clueAngles},
                    processedGameStateExtension: {clueAngles: animatedClueAngles},
                } = context;

                return [
                    ...(typeof prevItems === "function" ? prevItems(context) : prevItems),
                    ...(puzzle.extension?.clues as RotatableClue[] ?? []).flatMap(
                        (rootClue, index) => [rootClue, ...rootClue.dependentClues ?? []].flatMap(
                            (clue) => RotatableClueConstraint(
                                clue,
                                clueAngles[index] * (clue.coeff ?? 1),
                                animatedClueAngles[index] * (clue.coeff ?? 1),
                            ),
                        ),
                    ),
                ];
            },
        };

        const {resultChecker} = puzzle;
        if (resultChecker) {
            puzzle = {
                ...puzzle,
                resultChecker: (context) => {
                    const result = resultChecker(context);

                    const isCorrectResult = result === true || (typeof result === "object" && result.isCorrectResult);
                    if (isCorrectResult && !isValidFinishedPuzzleByConstraints(context)) {
                        return false;
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
            Component: RotateClueButton(90),
        },
        {
            key: "rotate-clue-left",
            region: ControlButtonRegion.additional,
            Component: RotateClueButton(-90),
        },
    ],

    compensateConstraintDigitAngle,
    transformNumber(num, context, _cell, constraint): number {
        if (constraint && !compensateConstraintDigitAngle) {
            const angle = loop((constraint as any)._rotatableClueAngle ?? 0, 360);

            switch (angle) {
                case 0: return num;
                case 180: return rotateNumber(context.puzzle, num);
                default: return Number.NaN;
            }
        }

        return num;
    },

    // TODO: support shared games
});

export const ImportedRotatableCluesSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>,
    compensateConstraintDigitAngle = true,
) => RotatableCluesSudokuTypeManager(
    baseTypeManager,
    true,
    compensateConstraintDigitAngle,
    (puzzle) => {
        const isWheels = puzzle.importOptions?.wheels;
        const keepCircles = puzzle.importOptions?.keepCircles;

        let {items} = puzzle;
        if (Array.isArray(items)) {
            items = items.map(
                (item) => isArrowConstraint(item)
                    ? {
                        ...item,
                        props: {
                            ...item.props,
                            transparentCircle: true,
                        },
                    } as Constraint<RotatableCluesPTM<T>, ArrowProps>
                    : item
            );

            const isPivot = (item: Constraint<RotatableCluesPTM<T>, any>): item is Constraint<RotatableCluesPTM<T>, DecorativeShapeProps> =>
                !!item.tags?.includes(ellipseTag) && item.cells.length === 1
                && item.cells[0].top % 0.5 === 0 && item.cells[0].left % 1 === 0.5;

            const pivots = items
                .filter(isPivot)
                .map(({cells: [cell], props: {width: diameter}}) => ({
                    cell,
                    radius: (keepCircles && !isWheels) ? diameter / 2 : 0.5,
                }));

            if (!keepCircles) {
                items = items.filter((item) => !isPivot(item));
            }

            const getCluePivot = ({cells}: Constraint<RotatableCluesPTM<T>>) => {
                for (const {top, left} of cells) {
                    for (const {cell, radius} of pivots) {
                        const dx = cell.left - left;
                        const dy = cell.top - top;

                        if (dx * dx + dy * dy <= radius * radius) {
                            return cell;
                        }
                    }
                }

                return undefined;
            }

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
                clues = clues.map(({pivot, clues}) => {
                    const digits = Array<number | undefined>(4).fill(undefined);

                    for (const clue of clues) {
                        const {cells} = clue;
                        if (!isTextConstraint(clue) || cells.length > 2) {
                            continue;
                        }

                        const value = Number(clue.props.text);
                        if (!Number.isFinite(value)) {
                            continue;
                        }

                        const {top, left} = getAveragePosition(cells);
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

        return {clues: []};
    },
);
