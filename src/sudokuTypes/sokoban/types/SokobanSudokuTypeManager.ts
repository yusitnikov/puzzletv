import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {defaultSokobanDirection, SokobanProcessedGameState} from "./SokobanGameState";
import {mixAnimatedValue, useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {SokobanPTM} from "./SokobanPTM";
import {PartialGameStateEx} from "../../../types/sudoku/GameState";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {emptyPosition, Position} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {cageTag} from "../../../components/sudoku/constraints/killer-cage/KillerCage";
import {ellipseTag} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {SokobanClueConstraint} from "../constraints/SokobanClue";
import {SokobanPlayerConstraint} from "../constraints/SokobanPlayer";
import {moveSokobanPlayer, SokobanMovePlayerCellWriteModeInfo} from "./SokobanMovePlayerCellWriteModeInfo";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {settings} from "../../../types/layout/Settings";
import {
    addFieldStateExToSudokuManager,
    addGameStateExToSudokuManager
} from "../../../types/sudoku/SudokuTypeManagerPlugin";
import {SokobanFieldState} from "./SokobanFieldState";

export const SokobanSudokuTypeManager: SudokuTypeManager<SokobanPTM> = {
    ...addGameStateExToSudokuManager(
        addFieldStateExToSudokuManager(
            DigitSudokuTypeManager(),
            {
                initialFieldStateExtension(puzzle): SokobanFieldState {
                    return {
                        cluePositions: puzzle?.extension?.clues.map(() => emptyPosition) ?? [],
                        sokobanPosition: puzzle?.extension?.sokobanStartPosition ?? emptyPosition,
                    };
                },
            }
        ),
        {
            initialGameStateExtension: {animating: false, sokobanDirection: defaultSokobanDirection},
            useProcessedGameStateExtension(
                {
                    fieldExtension,
                    stateExtension: {animating},
                }
            ): SokobanProcessedGameState {
                return useAnimatedValue(
                    fieldExtension as SokobanFieldState,
                    animating ? settings.animationSpeed.get() / 2 : 0,
                    (a, b, coeff) => ({
                        cluePositions: a.cluePositions.map((positionA, index) => {
                            const positionB = b.cluePositions[index];
                            return {
                                top: mixAnimatedValue(positionA.top, positionB.top, coeff),
                                left: mixAnimatedValue(positionA.left, positionB.left, coeff),
                            };
                        }),
                        sokobanPosition: {
                            top: mixAnimatedValue(a.sokobanPosition.top, b.sokobanPosition.top, coeff),
                            left: mixAnimatedValue(a.sokobanPosition.left, b.sokobanPosition.left, coeff),
                        },
                    })
                );
            },
            getProcessedGameStateExtension({fieldExtension}): SokobanProcessedGameState {
                return fieldExtension;
            },
        }
    ),

    processArrowDirection(
        currentCell, xDirection, yDirection, context, isMainKeyboard
    ): { cell?: Position; state?: PartialGameStateEx<SokobanPTM> } {
        return context.cellWriteMode === CellWriteMode.move || !isMainKeyboard
            ? {
                state: moveSokobanPlayer(xDirection, yDirection)(context),
            }
            : defaultProcessArrowDirection(currentCell, xDirection, yDirection, context, isMainKeyboard);
    },
    applyArrowProcessorToNoCell: true,

    postProcessPuzzle(puzzle): PuzzleDefinition<SokobanPTM> {
        const {items = []} = puzzle;
        if (!Array.isArray(items)) {
            throw new Error("puzzle.items is expected to be an array for SokobanSudokuTypeManager");
        }

        const isSokobanClue = ({tags}: Constraint<SokobanPTM, any>) => tags?.includes(cageTag);
        const isSokobanPlayer = ({tags, cells: {length}}: Constraint<SokobanPTM, any>) => tags?.includes(ellipseTag) && length === 1;
        const sokobanPlayer = items.find(isSokobanPlayer);
        if (!sokobanPlayer) {
            throw new Error("Didn't find the sokoban player start position");
        }

        const clues = items.filter(isSokobanClue);
        const otherItems = items.filter((item) => !isSokobanClue(item) && !isSokobanPlayer(item));
        return {
            ...puzzle,
            items: (
                {
                    fieldExtension: {cluePositions},
                    processedGameStateExtension,
                }
            ): Constraint<SokobanPTM, any>[] => [
                ...clues.map((clue, index) => SokobanClueConstraint(
                    clue,
                    cluePositions[index],
                    processedGameStateExtension.cluePositions[index],
                )),
                SokobanPlayerConstraint(processedGameStateExtension.sokobanPosition),
                ...otherItems,
            ],
            extension: {
                clues,
                sokobanStartPosition: sokobanPlayer.cells[0],
            },
        };
    },

    extraCellWriteModes: [SokobanMovePlayerCellWriteModeInfo],

    controlButtons: [
    ],

    // TODO: support shared games
};
