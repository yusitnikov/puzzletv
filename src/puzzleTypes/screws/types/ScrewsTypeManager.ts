import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { ScrewsGameState } from "./ScrewsGameState";
import { getAveragePosition } from "../../../types/layout/Position";
import { AnimatedValue } from "../../../hooks/useAnimatedValue";
import { ScrewsPTM } from "./ScrewsPTM";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { Screw, ScrewsPuzzleExtension } from "./ScrewsPuzzleExtension";
import { isRect } from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { settings } from "../../../types/layout/Settings";
import { Rect } from "../../../types/layout/Rect";
import { indexes } from "../../../utils/indexes";
import { ScrewConstraint } from "../constraints/Screw";
import { ScrewsMoveCellWriteModeInfo } from "./ScrewsMoveCellWriteModeInfo";
import { CellWriteModeInfo } from "../../../types/puzzle/CellWriteModeInfo";
import {
    addGridStateExToPuzzleTypeManager,
    addGameStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { ScrewsGridState } from "./ScrewsGridState";
import { ScrewsGameClueState } from "./ScrewsGameClueState";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { comparer, IReactionDisposer, reaction } from "mobx";

interface ScrewsImporterResult<T extends AnyPTM> {
    screws: Rect[];
    filteredItems?: PuzzleDefinition<ScrewsPTM<T>>["items"];
}

export const ScrewsTypeManager = <T extends AnyPTM>(
    { postProcessPuzzle, controlButtons = [], ...baseTypeManager }: PuzzleTypeManager<T>,
    screwsImporter?: (puzzle: PuzzleDefinition<ScrewsPTM<T>>) => ScrewsImporterResult<T>,
): PuzzleTypeManager<ScrewsPTM<T>> => ({
    ...addGameStateExToPuzzleTypeManager(
        addGridStateExToPuzzleTypeManager(baseTypeManager as unknown as PuzzleTypeManager<ScrewsPTM<T>>, {
            initialGridStateExtension(puzzle): ScrewsGridState {
                return {
                    screwOffsets: puzzle?.extension?.screws.map(() => 0) ?? [],
                };
            },
        }),
        {
            initialGameStateExtension(puzzle): ScrewsGameState {
                return {
                    screws:
                        puzzle?.extension?.screws.map(
                            (): ScrewsGameClueState => ({
                                animationManager: new AnimatedValue(0, 0),
                                animating: false,
                            }),
                        ) ?? [],
                };
            },
            serializeGameState({ screws = [] }: Partial<ScrewsGameState>): any {
                return {
                    screws: screws.map(({ animating }) => ({ animating })),
                };
            },
            unserializeGameState({ screws }: any): Partial<ScrewsGameState> {
                return {
                    screws:
                        screws?.map(
                            (): ScrewsGameClueState => ({
                                animationManager: new AnimatedValue(0, 0),
                                animating: false,
                            }),
                        ) ?? [],
                };
            },
        },
    ),

    getReactions(context): IReactionDisposer[] {
        return [
            ...(baseTypeManager.getReactions?.(context as unknown as PuzzleContext<T>) ?? []),
            ...((context.puzzle.extension as ScrewsPuzzleExtension<T>)?.screws?.map((_, index) =>
                reaction(
                    () => {
                        const {
                            gridExtension: { screwOffsets },
                            stateExtension: { screws: screwsAnimations },
                        } = context;

                        return {
                            value: screwOffsets[index],
                            animationTime: screwsAnimations[index].animating ? settings.animationSpeed.get() / 2 : 0,
                        };
                    },
                    ({ value, animationTime }) => {
                        (context.stateExtension as ScrewsGameState).screws[index].animationManager.update(
                            value,
                            animationTime,
                        );
                    },
                    {
                        name: `update screw[${index}] animation manager`,
                        equals: comparer.structural,
                        fireImmediately: true,
                    },
                ),
            ) ?? []),
        ];
    },

    postProcessPuzzle(puzzle): PuzzleDefinition<ScrewsPTM<T>> {
        if (postProcessPuzzle) {
            puzzle = postProcessPuzzle(puzzle as unknown as PuzzleDefinition<T>) as unknown as PuzzleDefinition<
                ScrewsPTM<T>
            >;
        }

        // Import screw positions
        if (!puzzle.extension?.screws) {
            const result = screwsImporter?.(puzzle);

            puzzle = {
                ...puzzle,
                items: result?.filteredItems ?? puzzle.items,
                extension: {
                    ...puzzle.extension,
                    screws: (result?.screws ?? []).map((initialPosition) => ({ initialPosition, digits: [] })),
                },
            };
        }

        // Import given digits on the screws
        let { initialDigits = {} } = puzzle;
        puzzle = {
            ...puzzle,
            extension: {
                ...puzzle.extension,
                screws: (puzzle.extension?.screws ?? []).map(({ initialPosition, digits }: Screw<T["cell"]>) => {
                    const { top, left, width, height } = initialPosition;
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
                                        position: { top: y, left: x },
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

                    return { initialPosition, digits };
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
        ...((baseTypeManager.extraCellWriteModes ?? []) as unknown as CellWriteModeInfo<ScrewsPTM<T>>[]),
        ScrewsMoveCellWriteModeInfo(),
    ],

    // TODO: support shared games
});

export const ImportedScrewsTypeManager = <T extends AnyPTM>(baseTypeManager: PuzzleTypeManager<T>) =>
    ScrewsTypeManager(baseTypeManager, (puzzle) => {
        const { items } = puzzle;

        if (Array.isArray(items)) {
            const isScrew = isRect;

            const screws = items.filter(isScrew).map(({ cells, props: { width, height } }): Rect => {
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

        return { screws: [] };
    });
