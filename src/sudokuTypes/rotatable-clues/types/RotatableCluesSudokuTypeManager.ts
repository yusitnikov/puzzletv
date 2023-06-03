import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {RotatableCluesGameState, RotatableCluesProcessedGameState} from "./RotatableCluesGameState";
import {PositionSet, stringifyPosition} from "../../../types/layout/Position";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {RotatableCluesPTM} from "./RotatableCluesPTM";
import {RotatableCluesFieldState} from "./RotatableCluesFieldState";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {ControlButtonItem, ControlButtonRegion} from "../../../components/sudoku/controls/ControlButtonsManager";
import {RotatableClue} from "./RotatableCluesPuzzleExtension";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../../types/sudoku/Constraint";
import {ellipseTag} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";
import {RotatableClueConstraint} from "../constraints/RotatableClue";
import {RotateClueButton} from "../components/RotateClueButton";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {loop} from "../../../utils/math";
import {ArrowProps, isArrowConstraint} from "../../../components/sudoku/constraints/arrow/Arrow";
import {comparer, IReactionDisposer, reaction} from "mobx";
import {settings} from "../../../types/layout/Settings";

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
        return [
            ...(baseTypeManager.getReactions?.(context as unknown as PuzzleContext<T>) ?? []),
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
                        return manualAngle + loop(forcedAngle - manualAngle, 360);
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

        if (Array.isArray(puzzle.items)) {
            puzzle.items = puzzle.items.map(
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

            const isPivot = ({tags, cells: {length}}: Constraint<RotatableCluesPTM<T>>) =>
                tags?.includes(ellipseTag) && length === 1;

            const pivots = new PositionSet(puzzle.items.filter(isPivot).map(({cells: [cell]}) => cell));
            const items = puzzle.items.filter((item) => !isPivot(item));

            const getCluePivot = ({cells}: Constraint<RotatableCluesPTM<T>>) =>
                cells.find((cell) => pivots.contains(cell));
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

            puzzle = {
                ...puzzle,
                extension: {
                    ...puzzle.extension,
                    clues,
                },
                items: (
                    {
                        fieldExtension: {clueAngles},
                        processedGameStateExtension: {clueAngles: animatedClueAngles},
                    }
                ) => {
                    return [
                        ...noPivotItems,
                        ...clues.flatMap((clue, index) => RotatableClueConstraint(
                            clue,
                            clueAngles[index],
                            animatedClueAngles[index],
                        )),
                    ];
                },
            };
        }

        const {resultChecker} = puzzle;
        if (resultChecker) {
            puzzle = {
                ...puzzle,
                resultChecker: (context) => {
                    if (!isValidFinishedPuzzleByConstraints(context)) {
                        return false;
                    }

                    return resultChecker(context);
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

    compensateKillerCageSumAngle: true,

    // TODO: support shared games
});
