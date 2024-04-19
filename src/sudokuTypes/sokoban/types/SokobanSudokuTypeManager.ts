import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {defaultSokobanDirection, SokobanGameState} from "./SokobanGameState";
import {AnimatedValue} from "../../../hooks/useAnimatedValue";
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
import {SokobanFieldState, sokobanFieldStateAnimationMixer} from "./SokobanFieldState";
import {comparer, IReactionDisposer, reaction} from "mobx";

const initialFieldStateExtension = (puzzle?: PuzzleDefinition<SokobanPTM>): SokobanFieldState => {
    return {
        cluePositions: puzzle?.extension?.clues.map(() => emptyPosition) ?? [],
        sokobanPosition: puzzle?.extension?.sokobanStartPosition ?? emptyPosition,
    };
};

export const SokobanSudokuTypeManager: SudokuTypeManager<SokobanPTM> = {
    ...addGameStateExToSudokuManager(
        addFieldStateExToSudokuManager(
            DigitSudokuTypeManager(),
            {
                initialFieldStateExtension,
            }
        ),
        {
            initialGameStateExtension(puzzle): SokobanGameState {
                return {
                    animationManager: new AnimatedValue(
                        initialFieldStateExtension(puzzle),
                        0,
                        sokobanFieldStateAnimationMixer
                    ),
                    animating: false,
                    sokobanDirection: defaultSokobanDirection,
                };
            },
            serializeGameState({animationManager, ...state}: Partial<SokobanGameState>): any {
                return state;
            },
            unserializeGameState(state: any): Partial<SokobanGameState> {
                return {
                    ...state,
                    animationManager: new AnimatedValue(
                        initialFieldStateExtension(),
                        0,
                        sokobanFieldStateAnimationMixer
                    ),
                    animating: false,
                };
            },
        }
    ),

    getReactions(context): IReactionDisposer[] {
        return [
            reaction(
                () => {
                    return {
                        value: context.fieldExtension,
                        animationTime: context.stateExtension.animating ? settings.animationSpeed.get() / 2 : 0,
                    };
                },
                ({value, animationTime}) => {
                    context.stateExtension.animationManager.update(value, animationTime);
                },
                {
                    name: "update sokoban animation",
                    equals: comparer.structural,
                    fireImmediately: true,
                }
            ),
        ];
    },

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
                    stateExtension: {animationManager: {animatedValue}},
                }
            ): Constraint<SokobanPTM, any>[] => [
                ...clues.map((clue, index) => SokobanClueConstraint(
                    clue,
                    cluePositions[index],
                    animatedValue.cluePositions[index],
                )),
                SokobanPlayerConstraint(animatedValue.sokobanPosition),
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
