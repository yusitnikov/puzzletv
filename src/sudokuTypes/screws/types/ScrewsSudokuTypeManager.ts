import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {ScrewsGameState, ScrewsProcessedGameState} from "./ScrewsGameState";
import {getAveragePosition} from "../../../types/layout/Position";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {ScrewsPTM} from "./ScrewsPTM";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {Screw} from "./ScrewsPuzzleExtension";
import {Constraint} from "../../../types/sudoku/Constraint";
import {
    DecorativeShapeProps,
    rectTag
} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {settings} from "../../../types/layout/Settings";
import {Rect} from "../../../types/layout/Rect";
import {indexes} from "../../../utils/indexes";
import {ScrewConstraint} from "../constraints/Screw";
import {ScrewsMoveCellWriteModeInfo} from "./ScrewsMoveCellWriteModeInfo";
import {CellWriteModeInfo} from "../../../types/sudoku/CellWriteModeInfo";
import {addFieldStateExToSudokuManager} from "../../../types/sudoku/SudokuTypeManagerPlugin";

interface ScrewsImporterResult<T extends AnyPTM> {
    screws: Rect[];
    filteredItems?: PuzzleDefinition<ScrewsPTM<T>>["items"];
}

export const ScrewsSudokuTypeManager = <T extends AnyPTM>(
    {
        serializeGameState,
        unserializeGameState,
        initialGameStateExtension,
        useProcessedGameStateExtension,
        getProcessedGameStateExtension,
        postProcessPuzzle,
        controlButtons = [],
        ...baseTypeManager
    }: SudokuTypeManager<T>,
    screwsImporter?: (puzzle: PuzzleDefinition<ScrewsPTM<T>>) => ScrewsImporterResult<T>,
): SudokuTypeManager<ScrewsPTM<T>> => ({
    ...addFieldStateExToSudokuManager(
        baseTypeManager as unknown as SudokuTypeManager<ScrewsPTM<T>>,
        {
            initialFieldStateExtension(puzzle) {
                return {
                    screwOffsets: puzzle?.extension?.screws.map(() => 0) ?? [],
                };
            },
        }
    ),

    serializeGameState({screws, ...other}): any {
        return {screws, ...serializeGameState(other as T["stateEx"])};
    },

    unserializeGameState({screws, ...other}): Partial<ScrewsGameState> {
        return {screws, ...unserializeGameState(other)};
    },

    initialGameStateExtension: (puzzle) => {
        return {
            ...(
                typeof initialGameStateExtension === "function"
                    ? (initialGameStateExtension as ((puzzle: PuzzleDefinition<ScrewsPTM<T>>) => T["stateEx"]))(puzzle)
                    : initialGameStateExtension
            ),
            screws: puzzle.extension?.screws.map(() => ({animating: false})) ?? [],
        };
    },

    useProcessedGameStateExtension(context): ScrewsProcessedGameState {
        const {
            fieldExtension: {screwOffsets},
            stateExtension: {screws: screwsAnimations},
        } = context;

        return {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            ...useProcessedGameStateExtension?.(context as unknown as PuzzleContext<T>),
            // eslint-disable-next-line react-hooks/rules-of-hooks
            screwOffsets: (screwOffsets as number[]).map((offset, index) => useAnimatedValue(
                offset,
                screwsAnimations[index].animating ? settings.animationSpeed.get() / 2 : 0
            )),
        };
    },

    getProcessedGameStateExtension(context): ScrewsProcessedGameState {
        return {
            ...getProcessedGameStateExtension?.(context as unknown as PuzzleContext<T>),
            screwOffsets: context.fieldExtension.screwOffsets,
        };
    },

    postProcessPuzzle(puzzle): PuzzleDefinition<ScrewsPTM<T>> {
        if (postProcessPuzzle) {
            puzzle = postProcessPuzzle(puzzle as unknown as PuzzleDefinition<T>) as unknown as PuzzleDefinition<ScrewsPTM<T>>;
        }

        // Import screw positions
        if (!puzzle.extension?.screws) {
            const result = screwsImporter?.(puzzle);

            puzzle = {
                ...puzzle,
                items: result?.filteredItems ?? puzzle.items,
                extension: {
                    ...puzzle.extension,
                    screws: (result?.screws ?? []).map((initialPosition) => ({initialPosition, digits: []})),
                },
            };
        }

        // Import given digits on the screws
        let {initialDigits = {}} = puzzle;
        puzzle = {
            ...puzzle,
            extension: {
                ...puzzle.extension,
                screws: (puzzle.extension?.screws ?? []).map(({initialPosition, digits}: Screw<T["cell"]>) => {
                    const {top, left, width, height} = initialPosition;
                    const bottom = top + height;
                    const right = left + width;

                    for (let y = Math.ceil(top - 0.6); y < bottom - 0.4; y++) {
                        for (let x = Math.ceil(left - 0.6); x < right - 0.4; x++) {
                            const digit = initialDigits[y]?.[x];
                            if (digit !== undefined) {
                                digits = [
                                    ...digits,
                                    {
                                        digit,
                                        position: {top: y, left: x},
                                    },
                                ];

                                initialDigits = {
                                    ...initialDigits,
                                    [y]: {
                                        ...initialDigits[y],
                                        [x]: undefined,
                                    },
                                };
                            }
                        }
                    }

                    return {initialPosition, digits};
                }),
            },
        };

        puzzle = {
            ...puzzle,
            initialDigits,
        };

        const screwsCount = puzzle.extension?.screws.length ?? 0;
        const prevItems = puzzle.items ?? [];
        puzzle = {
            ...puzzle,
            items: (context) => [
                ...(typeof prevItems === "function" ? prevItems(context) : prevItems),
                ...indexes(screwsCount).map((index) => ScrewConstraint(index)),
            ],
        };

        return puzzle;
    },

    extraCellWriteModes: [
        ...(baseTypeManager.extraCellWriteModes ?? []) as unknown as CellWriteModeInfo<ScrewsPTM<T>>[],
        ScrewsMoveCellWriteModeInfo(),
    ],

    // TODO: support shared games
});

export const ImportedScrewsSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>
) => ScrewsSudokuTypeManager(
    baseTypeManager,
    (puzzle) => {
        const {items} = puzzle;

        if (Array.isArray(items)) {
            const isScrew = (item: Constraint<ScrewsPTM<T>, any>): item is Constraint<ScrewsPTM<T>, DecorativeShapeProps> =>
                !!item.tags?.includes(rectTag);

            const screws = items
                .filter(isScrew)
                .map(({cells, props: {width, height}}): Rect => {
                    const center = getAveragePosition(cells);

                    width = Math.round(width);
                    height = Math.round(height);

                    return {
                        top: center.top + 0.5 - height / 2,
                        left: center.left + 0.5 - width / 2,
                        width,
                        height,
                    };
                });

            return {
                screws,
                filteredItems: items.filter((item) => !isScrew(item)),
            };
        }

        return {screws: []};
    },
);
