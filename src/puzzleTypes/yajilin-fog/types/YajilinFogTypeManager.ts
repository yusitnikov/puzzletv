import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { CellColor } from "../../../types/puzzle/CellColor";
import { isLine } from "../../../components/puzzle/constraints/line/Line";
import { PuzzleLineSet } from "../../../types/puzzle/PuzzleLineSet";
import { CellsMap, processCellsMaps } from "../../../types/puzzle/CellsMap";
import { indexes } from "../../../utils/indexes";
import { FogConstraint, FogProps, fogTag } from "../../../components/puzzle/constraints/fog/Fog";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { errorResultCheck, notFinishedResultCheck } from "../../../types/puzzle/PuzzleResultCheck";

export const YajilinFogTypeManager = <T extends AnyPTM>(
    baseTypeManager: PuzzleTypeManager<T>,
): PuzzleTypeManager<T> => {
    return {
        ...baseTypeManager,
        mapImportedColors: true,
        postProcessPuzzle(puzzle): PuzzleDefinition<T> {
            puzzle = {
                ...puzzle,
                disableBackgroundColorOpacity: true,
            };

            if (puzzle.gridSize.rowsCount > 9) {
                puzzle = {
                    ...puzzle,
                    digitsCount: 9,
                    disableDiagonalBorderLines: true,
                    disableDiagonalCenterLines: true,
                };
            }

            if (puzzle.solution) {
                puzzle.solution = processCellsMaps(([value]) => (value === 0 ? undefined : value), [puzzle.solution]);
            }

            let yajilinFogLineSolution = new PuzzleLineSet(puzzle);
            const yajilinFogShadeSolution: CellsMap<CellColor> = {};

            const { initialColors } = puzzle;
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
                    const { tags, color, cells, props } = item;

                    if (isLine(item) && color === "#000000") {
                        yajilinFogLineSolution = yajilinFogLineSolution.bulkAdd(
                            indexes(cells.length - 1).map((i) => ({
                                start: cells[i],
                                end: cells[i + 1],
                            })),
                        );

                        continue;
                    }

                    if (tags?.includes(fogTag)) {
                        const { startCells3x3, startCells, bulbCells } = props as FogProps<T>;

                        items.push(
                            FogConstraint({
                                startCells3x3: startCells3x3,
                                startCells: startCells,
                                bulbCells: bulbCells,
                                revealByCenterLines: yajilinFogLineSolution.size ? yajilinFogLineSolution : true,
                                revealByColors: Object.keys(yajilinFogShadeSolution).length
                                    ? yajilinFogShadeSolution
                                    : [CellColor.black],
                            }),
                        );

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
                    const {
                        puzzleIndex,
                        currentGridStateWithFogDemo: { cells, lines },
                    } = context;

                    let result = originalResultChecker(context);
                    if (!result.isCorrectResult && !result.isPending) {
                        return result;
                    }

                    if (Object.keys(yajilinFogShadeSolution).length) {
                        for (const [top, row] of cells.entries()) {
                            for (const [left, { colors }] of row.entries()) {
                                if (initialColors[top]?.[left]?.length) {
                                    continue;
                                }

                                const isActualBlack = colors.size === 1 && colors.first() === CellColor.black;
                                const isExpectedBlack = !!yajilinFogShadeSolution[top]?.[left];
                                if (isActualBlack && !isExpectedBlack) {
                                    return errorResultCheck();
                                }
                                if (!isActualBlack && isExpectedBlack) {
                                    result = notFinishedResultCheck();
                                }
                            }
                        }
                    }

                    if (yajilinFogLineSolution.size) {
                        const actualLines = new PuzzleLineSet(puzzle, puzzleIndex.getCenterLines(lines.items, true));
                        if (
                            actualLines.size > yajilinFogLineSolution.size ||
                            actualLines.items.some((item) => !yajilinFogLineSolution.contains(item))
                        ) {
                            return errorResultCheck();
                        }
                        // The previous condition confirmed that yajilinFogLineSolution contains all items of actualLines,
                        // so the check for having equal sets could be simplified to comparing the set sizes
                        if (actualLines.size !== yajilinFogLineSolution.size) {
                            result = notFinishedResultCheck();
                        }
                    }

                    return result;
                };
            }

            return puzzle;
        },
    };
};
