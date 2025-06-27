import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { EscapePTM } from "./EscapePTM";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { Constraint } from "../../../types/puzzle/Constraint";
import { isEllipse, isRect } from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { addGameStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { EscapeStartScreen } from "../components/EscapeStartScreen";
import { emptyPosition, getLineVector, getVectorLength, Position, PositionSet } from "../../../types/layout/Position";
import { EscapeMonsterConstraint } from "../constraints/EscapeMonster";
import { AnimatedValue, mixAnimatedPosition } from "../../../types/struct/AnimatedValue";
import { reaction } from "mobx";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { notFinishedResultCheck } from "../../../types/puzzle/PuzzleResultCheck";
import { translate } from "../../../utils/translate";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { EscapeKeyboardListenerConstraint } from "../constraints/EscapeKeyboardListener";
import { escapeMonsterAnimationSpeed } from "./EscapeMonsterAnimationSpeed";
import { RulesParagraph } from "../../../components/puzzle/rules/RulesParagraph";

export const EscapeTypeManager = (): PuzzleTypeManager<EscapePTM> =>
    addGameStateExToPuzzleTypeManager(
        {
            ...DigitPuzzleTypeManager(),

            gridControlsComponent: EscapeStartScreen,

            isReady(context: PuzzleContext<EscapePTM>): boolean {
                return context.stateExtension.isReady && !context.stateExtension.isDead;
            },

            disableMouseHandlers: true,
            disableSelectAllCells: true,

            processArrowDirection(currentCell, xDirection, yDirection, context) {
                const newCell = {
                    top: currentCell.top + yDirection,
                    left: currentCell.left + xDirection,
                };

                return isValidCell(newCell, context) ? { cell: newCell } : {};
            },

            postProcessPuzzle(puzzle: PuzzleDefinition<EscapePTM>): PuzzleDefinition<EscapePTM> {
                const { items = [], resultChecker, rules } = puzzle;
                if (!Array.isArray(items)) {
                    throw new Error("puzzle.items is expected to be an array for SokobanTypeManager");
                }

                const isPlayer = (item: Constraint<EscapePTM, any>) => isRect(item) && item.cells.length === 1;
                const player = items.find(isPlayer);
                if (!player) {
                    throw new Error("Didn't find the narrow escape player's start position");
                }

                const isMonster = (item: Constraint<EscapePTM, any>) => isEllipse(item) && item.cells.length === 1;
                const monster = items.find(isMonster);
                if (!monster) {
                    throw new Error("Didn't find the narrow escape monster's start position");
                }

                return {
                    ...puzzle,
                    saveState: false,
                    extension: {
                        playerStartPosition: player.cells[0],
                        monsterStartPosition: monster.cells[0],
                    },
                    items: [
                        ...items.filter((item) => item !== player && item !== monster),
                        EscapeMonsterConstraint,
                        EscapeKeyboardListenerConstraint,
                    ],
                    rules: (context) => (
                        <>
                            {rules?.(context)}

                            <RulesParagraph>
                                {translate({
                                    [LanguageCode.en]:
                                        "But beware! You'll need to use the keyboard to navigate between the cells and enter the digits, and there's a monster in the grid that will try to eat your cursor!",
                                    [LanguageCode.ru]:
                                        "Но осторожно! Вам придется использовать клавиатуру для перемещения между клетками и ввода цифр, и на поле есть монстр, который попытается съесть ваш курсор!",
                                    [LanguageCode.de]:
                                        "Aber Vorsicht! Sie müssen die Tastatur verwenden, um zwischen den Zellen zu navigieren und die Ziffern einzugeben. Außerdem lauert im Raster ein Monster, das versucht, Ihren Cursor zu fressen!",
                                })}
                            </RulesParagraph>

                            <RulesParagraph>
                                {translate({
                                    [LanguageCode.en]: "Neither you nor the monster could go through black digits.",
                                    [LanguageCode.ru]: "Ни вы, ни монстр не можете пройти через черные цифры.",
                                    [LanguageCode.de]:
                                        "Weder Sie noch das Monster können durch schwarze Ziffern gehen.",
                                })}
                            </RulesParagraph>

                            <RulesParagraph>
                                {translate({
                                    [LanguageCode.en]:
                                        "All standard keyboard controls apply: arrows and WASD for navigating between the cells, digit keys for entering digits, ZXCV for switching between the input modes, etc.",
                                    [LanguageCode.ru]:
                                        "Работают все стандартные клавиши управления: стрелки и WASD для навигации между клетками, цифровые клавиши для ввода цифр, ZXCV для переключения между режимами ввода, и т. д.",
                                    [LanguageCode.de]:
                                        "Es gelten alle Standard-Tastatursteuerungen: Pfeiltasten und WASD zum Navigieren zwischen den Zellen, Zifferntasten zum Eingeben von Ziffern, ZXCV zum Umschalten zwischen den Eingabemodi usw.",
                                })}
                            </RulesParagraph>

                            <RulesParagraph>
                                {translate({
                                    [LanguageCode.en]:
                                        "You can also press space bar to turn the digit under the cursor into a black digit. Warning: this action cannot be undone!",
                                    [LanguageCode.ru]:
                                        "Кроме того, Вы можете нажать на пробел, чтобы превратить цифру под курсором в черную цифру. Внимание: это действие нельзя отменить!",
                                    [LanguageCode.de]:
                                        "Zusätzlich können Sie die Leertaste drücken, um die Ziffer unter dem Cursor in eine schwarze Ziffer umzuwandeln. Achtung: Diese Aktion kann nicht rückgängig gemacht werden!",
                                })}
                            </RulesParagraph>
                        </>
                    ),
                    resultChecker: (context) => {
                        if (context.stateExtension.isDead) {
                            return {
                                isCorrectResult: false,
                                isPending: false,
                                forceShowResult: true,
                                resultPhrase: translate({
                                    [LanguageCode.en]: "Oh no, you've got eaten!",
                                    [LanguageCode.ru]: "О нет, тебя съели!",
                                    [LanguageCode.de]: "Oh nein, du hast gegessen!",
                                }),
                            };
                        }

                        return resultChecker?.(context) ?? notFinishedResultCheck();
                    },
                    allowDrawing: [],
                };
            },

            getReactions(context: PuzzleContext<EscapePTM>) {
                const monsterAnimation = getEscapeMonsterAnimatedPosition(context);

                return [
                    reaction(
                        () =>
                            context.stateExtension.isReady &&
                            !context.stateExtension.isDead &&
                            !monsterAnimation.isAnimating,
                        (shouldUpdate) => {
                            if (!shouldUpdate) {
                                return;
                            }

                            const currentPosition = context.stateExtension.monsterPosition;

                            interface CellInfo {
                                step: number;
                                nodes: PositionSet;
                                distance: number;
                            }
                            const cellsInfo: CellsMap<CellInfo> = {};
                            let bestStep = 0;
                            let bestDistance = 1000000;
                            let bestCells: Position[] = [];

                            const addCell = (cell: Position, value: Omit<CellInfo, "distance">) => {
                                const distance = context.selectedCells.size
                                    ? Math.min(
                                          ...context.selectedCells.items.map((selectedCell) =>
                                              getVectorLength(getLineVector({ start: cell, end: selectedCell })),
                                          ),
                                      )
                                    : 0;
                                const fullValue: CellInfo = { ...value, distance };
                                cellsInfo[cell.top] ??= {};
                                cellsInfo[cell.top][cell.left] = fullValue;
                                if (value.step !== 0) {
                                    if (distance < bestDistance) {
                                        bestDistance = distance;
                                        bestStep = value.step;
                                        bestCells = [];
                                    }
                                    if (distance === bestDistance && value.step === bestStep) {
                                        bestCells.push(cell);
                                    }
                                }
                                return fullValue;
                            };
                            addCell(currentPosition, { step: 0, nodes: new PositionSet() });

                            let wave = [currentPosition];
                            for (let step = 1; wave.length && bestDistance !== 0; step++) {
                                const nextWave: Position[] = [];

                                for (const waveCell of wave) {
                                    const info = cellsInfo[waveCell.top][waveCell.left];

                                    for (const direction of allDirections) {
                                        const newCell: Position = {
                                            top: waveCell.top + direction.top,
                                            left: waveCell.left + direction.left,
                                        };
                                        if (!isValidCell(newCell, context)) {
                                            continue;
                                        }

                                        let newInfo = cellsInfo[newCell.top]?.[newCell.left];
                                        if (!newInfo) {
                                            newInfo = addCell(newCell, {
                                                step,
                                                nodes: new PositionSet(step === 1 ? [newCell] : []),
                                            });
                                            nextWave.push(newCell);
                                        }
                                        if (newInfo.step === step) {
                                            newInfo.nodes = newInfo.nodes.bulkAdd(info.nodes.items);
                                        }
                                    }
                                }

                                wave = nextWave;
                            }

                            const newPositionOptions = PositionSet.merge(
                                ...bestCells.map(({ top, left }) => cellsInfo[top][left].nodes),
                            ).items;

                            if (newPositionOptions.length) {
                                const newPosition =
                                    newPositionOptions[Math.floor(Math.random() * newPositionOptions.length)];
                                context.onStateChange({
                                    extension: {
                                        monsterPosition: newPosition,
                                    },
                                });
                            }
                        },
                        { name: "monsterPositionReaction" },
                    ),
                    reaction(
                        () => {
                            if (
                                !context.stateExtension.isReady ||
                                context.stateExtension.isDead ||
                                context.resultCheck.isCorrectResult
                            ) {
                                return false;
                            }

                            const monsterPosition = getEscapeMonsterAnimatedPosition(context).animatedValue;
                            return context.selectedCells.items.some(
                                (cell) => getVectorLength(getLineVector({ start: monsterPosition, end: cell })) < 0.65,
                            );
                        },
                        (isDead) => {
                            if (isDead) {
                                context.onStateChange({ extension: { isDead: true } });
                            }
                        },
                        { name: "updateIsDead" },
                    ),
                ];
            },
        },
        {
            initialGameStateExtension: (puzzle) => ({
                isReady: false,
                isDead: false,
                monsterPosition: puzzle?.extension?.monsterStartPosition ?? emptyPosition,
            }),
        },
    );

const allDirections: Position[] = [
    { top: 1, left: 0 },
    { top: -1, left: 0 },
    { top: 0, left: 1 },
    { top: 0, left: -1 },
];

const isValidCell = ({ top, left }: Position, context: PuzzleContext<EscapePTM>) =>
    top >= 0 &&
    top < context.puzzle.gridSize.rowsCount &&
    left >= 0 &&
    left < context.puzzle.gridSize.columnsCount &&
    context.allInitialDigits[top]?.[left] === undefined;

export const getEscapeMonsterAnimatedPosition = (context: PuzzleContext<EscapePTM>) =>
    context.getCachedItem(
        "escapeMonsterAnimatedPosition",
        () =>
            new AnimatedValue(
                () => context.stateExtension.monsterPosition,
                () => (context.stateExtension.isReady ? escapeMonsterAnimationSpeed.get() : 0),
                mixAnimatedPosition,
            ),
    );
