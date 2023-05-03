import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {RotatableCluesGameState, RotatableCluesProcessedGameState} from "./RotatableCluesGameState";
import {PositionSet, stringifyPosition} from "../../../types/layout/Position";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {RotatableCluesPTM} from "./RotatableCluesPTM";
import {
    GameStateEx,
    gameStateGetCurrentFieldState,
    ProcessedGameStateEx
} from "../../../types/sudoku/GameState";
import {RotatableCluesFieldState} from "./RotatableCluesFieldState";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {ControlButtonItem, ControlButtonRegion} from "../../../components/sudoku/controls/ControlButtonsManager";
import {RotatableClue} from "./RotatableCluesPuzzleExtension";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../../types/sudoku/Constraint";
import {ellipseTag} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {fieldStateHistoryAddState, fieldStateHistoryGetCurrent} from "../../../types/sudoku/FieldStateHistory";
import {RotatableClueConstraint} from "../constraints/RotatableClue";
import {RotateClueButton} from "../components/RotateClueButton";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {loop} from "../../../utils/math";
import {ArrowProps, isArrowConstraint} from "../../../components/sudoku/constraints/arrow/Arrow";

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

    useProcessedGameStateExtension(state, cellsIndex): RotatableCluesProcessedGameState {
        const {animationSpeed, extension: {clues: clueAnimations}} = state;
        const {extension: {clueAngles}} = gameStateGetCurrentFieldState(state);

        return {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            ...useProcessedGameStateExtension?.(state as GameStateEx<T>, cellsIndex as unknown as SudokuCellsIndex<T>),
            // eslint-disable-next-line react-hooks/rules-of-hooks
            clueAngles: (clueAngles as number[]).map((angle, index) => useAnimatedValue(
                angle,
                clueAnimations[index].animating ? animationSpeed / 2 : 0
            )),
        };
    },

    getProcessedGameStateExtension(state): RotatableCluesProcessedGameState {
        const {extension: {clueAngles}} = gameStateGetCurrentFieldState(state);

        return {
            ...getProcessedGameStateExtension?.(state as GameStateEx<T>),
            clueAngles,
        };
    },

    applyStateDiffEffect(state, prevState, context) {
        baseTypeManager.applyStateDiffEffect?.(
            state as unknown as ProcessedGameStateEx<T>,
            prevState as unknown as ProcessedGameStateEx<T>,
            context as unknown as PuzzleContext<T>,
        );

        const {puzzle, onStateChange} = context;
        const clues: RotatableClue[] = puzzle.extension?.clues ?? [];
        const {cells, extension: {clueAngles}, clientId, actionId} = gameStateGetCurrentFieldState(state);

        const processedClueAngles = (clueAngles as number[]).map((manualAngle, index) => {
            const {pivot: {top, left}} = clues[index];
            const data = cells[top]?.[left]?.usersDigit;
            if (data === undefined) {
                return manualAngle;
            }
            const digit = puzzle.typeManager.getDigitByCellData(data, context, {top, left});
            const forcedAngle = digit * 90;
            // Find the closest angle to the manual angle, so that we don't have weird animation (but rotate only clockwise)
            return manualAngle + loop(forcedAngle - manualAngle, 360);
        });
        if (processedClueAngles.some((value, index) => value !== clueAngles[index])) {
            onStateChange({
                fieldStateHistory: fieldStateHistoryAddState(
                    puzzle,
                    state.fieldStateHistory,
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
                    ...state.extension,
                    clues: state.extension.clues.map(() => ({animating: true})),
                },
            });
        }
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
                items: ({fieldStateHistory, processedExtension: {clueAngles: animatedClueAngles}}) => {
                    const {extension: {clueAngles}} = fieldStateHistoryGetCurrent(fieldStateHistory);

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

    // TODO: support shared games
});
