import { defaultProcessArrowDirection, PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { defaultSokobanDirection, SokobanGameState } from "./SokobanGameState";
import { AnimatedValue } from "../../../types/struct/AnimatedValue";
import { SokobanPTM } from "./SokobanPTM";
import { PartialGameStateEx } from "../../../types/puzzle/GameState";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { emptyPosition, Position } from "../../../types/layout/Position";
import { Constraint } from "../../../types/puzzle/Constraint";
import { isCageConstraint } from "../../../components/puzzle/constraints/killer-cage/KillerCage";
import { cosmeticTag, isEllipse } from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { SokobanClueConstraint, sokobanTag } from "../constraints/SokobanClue";
import { SokobanPlayerConstraint } from "../constraints/SokobanPlayer";
import { moveSokobanPlayer, SokobanMovePlayerCellWriteModeInfo } from "./SokobanMovePlayerCellWriteModeInfo";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { settings } from "../../../types/layout/Settings";
import {
    addGridStateExToPuzzleTypeManager,
    addGameStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { SokobanGridState, sokobanGridStateAnimationMixer } from "./SokobanGridState";
import { SokobanOptions } from "./SokobanOptions";
import { isPointInRect } from "../../../types/layout/Rect";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

export const SokobanTypeManager = (options: SokobanOptions = {}): PuzzleTypeManager<SokobanPTM> => ({
    ...addGameStateExToPuzzleTypeManager(
        addGridStateExToPuzzleTypeManager(DigitPuzzleTypeManager(), {
            initialGridStateExtension: (puzzle): SokobanGridState => {
                return {
                    cluePositions: puzzle?.extension?.clues.map(() => emptyPosition) ?? [],
                    clueSmashed: puzzle?.extension?.clues.map(() => false) ?? [],
                    sokobanPosition: puzzle?.extension?.sokobanStartPosition ?? emptyPosition,
                };
            },
        }),
        {
            initialGameStateExtension: {
                animating: false,
                sokobanDirection: defaultSokobanDirection,
            } as SokobanGameState,
            unserializeGameState(state: any): Partial<SokobanGameState> {
                return {
                    ...state,
                    animating: false,
                };
            },
        },
    ),

    processArrowDirection(
        currentCell,
        xDirection,
        yDirection,
        context,
        isMainKeyboard,
    ): { cell?: Position; state?: PartialGameStateEx<SokobanPTM> } {
        return context.cellWriteMode === CellWriteMode.move || !isMainKeyboard
            ? {
                  state: moveSokobanPlayer(xDirection, yDirection)(context),
              }
            : defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard);
    },
    applyArrowProcessorToNoCell: true,

    postProcessPuzzle(puzzle): PuzzleDefinition<SokobanPTM> {
        const { items = [] } = puzzle;
        if (!Array.isArray(items)) {
            throw new Error("puzzle.items is expected to be an array for SokobanTypeManager");
        }

        const isSokobanClue = (item: Constraint<SokobanPTM, any>) =>
            item.tags?.includes(sokobanTag) || isCageConstraint(item);
        const isSokobanPlayer = (item: Constraint<SokobanPTM, any>) => isEllipse(item) && item.cells.length === 1;
        const sokobanPlayer = items.find(isSokobanPlayer);
        if (!sokobanPlayer) {
            throw new Error("Didn't find the sokoban player start position");
        }

        const clues = items.filter(isSokobanClue);
        const draggedClues = clues.map((clue, index) => ({
            clue,
            index,
            isCrate: true,
        }));
        const otherItems: Constraint<SokobanPTM, any>[] = [];
        for (const item of items) {
            if (isSokobanPlayer(item) || isSokobanClue(item)) {
                continue;
            }

            // Drag cosmetic elements that are fully inside the crate together with the crate
            if (item.tags?.includes(cosmeticTag)) {
                const index = clues.findIndex((clue) =>
                    item.cells.every(({ top, left }) =>
                        clue.cells.some((cell) =>
                            isPointInRect({ ...cell, width: 1, height: 1 }, { top: top + 0.5, left: left + 0.5 }),
                        ),
                    ),
                );
                if (index >= 0) {
                    draggedClues.push({
                        clue: item,
                        index,
                        isCrate: false,
                    });
                    continue;
                }
            }

            otherItems.push(item);
        }

        return {
            ...puzzle,
            items: (context): Constraint<SokobanPTM, any>[] => {
                const {
                    gridExtension: { cluePositions, clueSmashed },
                } = context;

                const animatedGridState = getAnimatedSokobanGridState(context);

                return [
                    ...draggedClues.map(({ clue, index, isCrate }) =>
                        SokobanClueConstraint(
                            clue,
                            cluePositions[index],
                            animatedGridState.cluePositions[index] ?? emptyPosition,
                            clueSmashed[index],
                            animatedGridState.clueSmashed[index] ?? false,
                            isCrate ? options.smashedComponent : {},
                        ),
                    ),
                    SokobanPlayerConstraint(animatedGridState.sokobanPosition),
                    ...otherItems,
                ];
            },
            extension: {
                clues,
                sokobanStartPosition: sokobanPlayer.cells[0],
                options,
            },
        };
    },

    extraCellWriteModes: [SokobanMovePlayerCellWriteModeInfo],

    controlButtons: [],

    // TODO: support shared games
});

export const getAnimatedSokobanGridState = (context: PuzzleContext<SokobanPTM>) =>
    context.getCachedItem(
        "animatedSokobanGridState",
        () =>
            new AnimatedValue<SokobanGridState>(
                () => context.gridExtension,
                () => (context.stateExtension.animating ? settings.animationSpeed.get() / 2 : 0),
                sokobanGridStateAnimationMixer,
            ),
    ).animatedValue;
