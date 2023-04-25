import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {CellColor} from "../../../types/sudoku/CellColor";
import {lineTag} from "../../../components/sudoku/constraints/line/Line";
import {PuzzleLineSet} from "../../../types/sudoku/PuzzleLineSet";
import {GivenDigitsMap, processGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {indexes} from "../../../utils/indexes";
import {FogConstraint, FogProps, fogTag} from "../../../components/sudoku/constraints/fog/Fog";
import {gameStateGetCurrentFieldState} from "../../../types/sudoku/GameState";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";

export const YajilinFogSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>
): SudokuTypeManager<T> => {
    return {
        ...baseTypeManager,
        mapImportedColors: true,
        postProcessPuzzle(puzzle): PuzzleDefinition<T> {
            puzzle = {
                ...puzzle,
                disableBackgroundColorOpacity: true,
            };

            if (puzzle.fieldSize.rowsCount > 9) {
                puzzle = {
                    ...puzzle,
                    digitsCount: 9,
                    disableDiagonalBorderLines: true,
                    disableDiagonalCenterLines: true,
                };
            }

            if (puzzle.solution) {
                puzzle.solution = processGivenDigitsMaps(
                    ([value]) => value === 0 ? undefined : value,
                    [puzzle.solution]
                );
            }

            let yajilinFogLineSolution = new PuzzleLineSet(puzzle);
            const yajilinFogShadeSolution: GivenDigitsMap<CellColor> = {};

            const {initialColors} = puzzle;
            if (typeof initialColors === "object") {
                for (const [topStr, row] of Object.entries(initialColors)) {
                    const top = Number(topStr);
                    for (const [leftStr, colors] of Object.entries(row)) {
                        const left = Number(leftStr);
                        if (colors.includes(CellColor.darkGrey)) {
                            yajilinFogShadeSolution[top] = yajilinFogShadeSolution[top] || {};
                            yajilinFogShadeSolution[top][left] = CellColor.black;

                            delete row[left];
                            if (Object.keys(row).length === 0) {
                                delete initialColors[top];
                            }
                        }
                    }
                }
            }

            const originalItems = puzzle.items;
            if (Array.isArray(originalItems)) {
                const items: typeof originalItems = [];

                for (const item of originalItems) {
                    const {tags, color, cells, props} = item;

                    if (tags?.includes(lineTag) && color === "#000000") {
                        yajilinFogLineSolution = yajilinFogLineSolution.bulkAdd(indexes(cells.length - 1).map(i => ({
                            start: cells[i],
                            end: cells[i + 1],
                        })));

                        continue;
                    }

                    if (tags?.includes(fogTag)) {
                        const {
                            startCells3x3,
                            startCells,
                            bulbCells,
                        } = props as FogProps<T>;

                        items.push(FogConstraint(
                            startCells3x3,
                            startCells,
                            bulbCells,
                            yajilinFogLineSolution.size ? yajilinFogLineSolution : true,
                            Object.keys(yajilinFogShadeSolution).length ? yajilinFogShadeSolution : [CellColor.black],
                        ));

                        continue;
                    }

                    items.push(item);
                }

                puzzle = {
                    ...puzzle,
                    items,
                };
            }

            const originalResultChecker = puzzle.resultChecker;
            if (originalResultChecker && typeof initialColors === "object") {
                puzzle.resultChecker = (context) => {
                    const {state, cellsIndex} = context;

                    const {cells, lines} = gameStateGetCurrentFieldState(state, true);

                    if (
                        Object.keys(yajilinFogShadeSolution).length &&
                        !cells.every((row, top) => row.every(({colors}, left) => {
                            if (initialColors[top]?.[left]?.length) {
                                return true;
                            }

                            const isActualBlack = colors.size === 1 && colors.first() === CellColor.black;
                            const isExpectedBlack = !!yajilinFogShadeSolution[top]?.[left];
                            return isActualBlack === isExpectedBlack;
                        }))
                    ) {
                        return false;
                    }

                    if (
                        yajilinFogLineSolution.size &&
                        !new PuzzleLineSet(
                            puzzle,
                            cellsIndex.getCenterLines(lines.items, true)
                        ).equals(yajilinFogLineSolution)
                    ) {
                        return false;
                    }

                    return originalResultChecker(context);
                };
            }

            return puzzle;
        },
    };
};
