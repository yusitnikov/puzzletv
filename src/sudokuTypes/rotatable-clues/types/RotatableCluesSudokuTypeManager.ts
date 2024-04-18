import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {RotatableCluesGameState, RotatableCluesProcessedGameState} from "./RotatableCluesGameState";
import {Position, stringifyPosition} from "../../../types/layout/Position";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {RotatableCluesPTM} from "./RotatableCluesPTM";
import {RotatableCluesFieldState} from "./RotatableCluesFieldState";
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

interface CluesImporterResult<T extends AnyPTM> {
    clues: RotatableClue[];
    filteredItems?: PuzzleDefinition<RotatableCluesPTM<T>>["items"];
}

export const RotatableCluesSudokuTypeManager = <T extends AnyPTM>(
    {
        serializeGameState,
        unserializeGameState,
        initialGameStateExtension,
        initialFieldStateExtension,
        useProcessedGameStateExtension,
        getProcessedGameStateExtension,
        areFieldStateExtensionsEqual = (a: T["fieldStateEx"], b: T["fieldStateEx"]) => JSON.stringify(a) === JSON.stringify(b),
        cloneFieldStateExtension = (extension: T["fieldStateEx"]) => JSON.parse(JSON.stringify(extension)),
        serializeFieldStateExtension,
        unserializeFieldStateExtension,
        postProcessPuzzle,
        controlButtons = [],
        ...baseTypeManager
    }: SudokuTypeManager<T>,
    // Do all clues remain the same when the pivot is turned 360 degrees?
    isEquivalentLoop: boolean,
    cluesImporter?: (puzzle: PuzzleDefinition<RotatableCluesPTM<T>>) => CluesImporterResult<T>,
): SudokuTypeManager<RotatableCluesPTM<T>> => ({
    ...(baseTypeManager as unknown as SudokuTypeManager<RotatableCluesPTM<T>>),

    serializeGameState({clues, ...other}): any {
        return {clues, ...serializeGameState(other as T["stateEx"])};
    },

    unserializeGameState({clues, ...other}): Partial<RotatableCluesGameState> {
        return {clues, ...unserializeGameState(other)};
    },

    initialGameStateExtension: (puzzle) => {
        return {
            ...(
                typeof initialGameStateExtension === "function"
                    ? (initialGameStateExtension as ((puzzle: PuzzleDefinition<RotatableCluesPTM<T>>) => T["stateEx"]))(puzzle)
                    : initialGameStateExtension
            ),
            clues: puzzle.extension?.clues.map(() => ({animating: false})) ?? [],
        };
    },

    initialFieldStateExtension: (puzzle) => {
        return {
            ...(
                typeof initialFieldStateExtension === "function"
                    ? (initialFieldStateExtension as ((puzzle: PuzzleDefinition<RotatableCluesPTM<T>>) => T["fieldStateEx"]))(puzzle)
                    : initialFieldStateExtension
            ),
            clueAngles: puzzle.extension?.clues.map(() => 0) ?? [],
        };
    },

    areFieldStateExtensionsEqual({clueAngles: anglesA, ...a}, {clueAngles: anglesB, ...b}): boolean {
        return areFieldStateExtensionsEqual(a, b)
            && (anglesA as number[]).every((angleA, index) => angleA === anglesB[index])
    },

    cloneFieldStateExtension({clueAngles, ...other}): RotatableCluesFieldState {
        return {
            clueAngles: [...clueAngles],
            ...cloneFieldStateExtension(other),
        };
    },

    serializeFieldStateExtension({clueAngles, ...other}: Partial<RotatableCluesPTM<T>["fieldStateEx"]>): any {
        return {
            clueAngles,
            ...(serializeFieldStateExtension?.(other as T["fieldStateEx"]) ?? other),
        };
    },

    unserializeFieldStateExtension({clueAngles, ...other}: any): Partial<RotatableCluesPTM<T>["fieldStateEx"]> {
        return {
            clueAngles,
            ...(unserializeFieldStateExtension?.(other) ?? other),
        };
    },

    useProcessedGameStateExtension(context): RotatableCluesProcessedGameState {
        const {
            fieldExtension: {clueAngles},
            stateExtension: {clues: clueAnimations},
        } = context;

        return {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            ...useProcessedGameStateExtension?.(context as unknown as PuzzleContext<T>),
            // eslint-disable-next-line react-hooks/rules-of-hooks
            clueAngles: (clueAngles as number[]).map((angle, index) => useAnimatedValue(
                angle,
                clueAnimations[index].animating ? settings.animationSpeed.get() / 2 : 0
            )),
        };
    },

    getProcessedGameStateExtension(context): RotatableCluesProcessedGameState {
        return {
            ...getProcessedGameStateExtension?.(context as unknown as PuzzleContext<T>),
            clueAngles: context.fieldExtension.clueAngles,
        };
    },

    getReactions(context: PuzzleContext<RotatableCluesPTM<T>>): IReactionDisposer[] {
        const baseReactions = baseTypeManager.getReactions?.(context as unknown as PuzzleContext<T>) ?? [];

        console.log(context.puzzle.importOptions);
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

    compensateConstraintDigitAngle: true,

    // TODO: support shared games
});

export const ImportedRotatableCluesSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>
) => RotatableCluesSudokuTypeManager(
    baseTypeManager,
    true,
    (puzzle) => {
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
                !!item.tags?.includes(ellipseTag) && item.cells.length === 1;

            const pivotsMap: Record<string, Position> = {};
            for (const item of items.filter(isPivot)) {
                if (isPivot(item)) {
                    const {cells: [cell], props: {width: diameter}} = item;
                    const radius = keepCircles ? diameter / 2 : 0.5;

                    for (let dx = -Math.floor(radius); dx <= radius; dx++) {
                        for (let dy = -Math.floor(radius); dy <= radius; dy++) {
                            if (dx * dx + dy * dy <= radius * radius) {
                                pivotsMap[stringifyPosition({
                                    left: cell.left + dx,
                                    top: cell.top + dy,
                                })] = cell;
                            }
                        }
                    }
                }
            }

            if (!keepCircles) {
                items = items.filter((item) => !isPivot(item));
            }

            const getCluePivot = ({cells}: Constraint<RotatableCluesPTM<T>>) => cells
                .map((cell) => pivotsMap[stringifyPosition(cell)])
                .find(Boolean);
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
            const clues = Object.values(cluesMap);
            const noPivotItems = items.filter((clue) => !getCluePivot(clue));

            return {
                clues: clues,
                filteredItems: noPivotItems,
            };
        }

        return {clues: []};
    },
);
