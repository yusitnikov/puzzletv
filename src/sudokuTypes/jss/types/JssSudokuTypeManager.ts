import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {getRegionCells, PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {PositionSet} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {JssCell} from "./JssCell";
import {GivenDigitsMap, mergeGivenDigitsMaps, processGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {resolveCellColorValue} from "../../../types/sudoku/CellColor";
import {JssConstraint} from "../constraints/Jss";
import {TextProps, textTag} from "../../../components/sudoku/constraints/text/Text";

export const JssSudokuTypeManager = <T extends AnyPTM>(
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

            if (puzzle.regions?.length) {
                const [inactiveRegion, ...activeRegions] = [...puzzle.regions]
                    .sort((a, b) => getRegionCells(b).length - getRegionCells(a).length);

                puzzle = {
                    ...puzzle,
                    regions: activeRegions,
                    inactiveCells: [
                        ...(puzzle.inactiveCells ?? []),
                        ...getRegionCells(inactiveRegion),
                    ],
                };
            }

            const allRegionCells = new PositionSet(puzzle.regions?.flatMap(getRegionCells));

            puzzle.initialColors = puzzle.initialColors ?? {};
            puzzle.solutionColors = puzzle.solutionColors ?? {};
            if (typeof puzzle.initialColors !== "object" || typeof puzzle.solutionColors !== "object") {
                throw new Error(`puzzle.initialColors and puzzle.solutionColors are expected to be objects for ${JssSudokuTypeManager.name}`);
            }

            // Treat given colors inside active regions as solution colors
            puzzle.solutionColors = mergeGivenDigitsMaps(
                puzzle.solutionColors,
                processGivenDigitsMaps(
                    ([colors], position) =>
                        allRegionCells.contains(position) ? colors : undefined,
                    [puzzle.initialColors]
                )
            );
            // Treat given colors outside active regions as JSS clues
            let jssCellsMap: GivenDigitsMap<JssCell> = processGivenDigitsMaps(
                ([[color]], position): JssCell | undefined =>
                    color && !allRegionCells.contains(position)
                        ? {
                            ...position,
                            backgroundColor: resolveCellColorValue(color)
                        }
                        : undefined,
                [puzzle.initialColors]
            );
            puzzle.initialColors = undefined;

            puzzle.items = puzzle.items ?? [];
            if (!Array.isArray(puzzle.items)) {
                throw new Error(`puzzle.items is expected to be an array for ${JssSudokuTypeManager.name}`);
            }
            const isJssTextClue = (constraint: Constraint<T, any>): constraint is Constraint<T, TextProps> => {
                const {tags = [], cells: {length, 0: cell}} = constraint;
                return tags.includes(textTag) && length === 1 && cell.top % 1 === 0 && cell.left % 1 === 0;
            };
            for (const constraint of puzzle.items) {
                if (isJssTextClue(constraint)) {
                    const {cells: [{top, left}], props: {text, size}, color} = constraint;
                    jssCellsMap[top] = jssCellsMap[top] ?? {};
                    jssCellsMap[top][left] = jssCellsMap[top][left] ?? {top, left};
                    jssCellsMap[top][left].text = text;
                    jssCellsMap[top][left].textColor = color;
                    jssCellsMap[top][left].textSize = size;
                }
            }
            puzzle.items = puzzle.items.filter((constraint) => !isJssTextClue(constraint));

            const jssCells = Object.values(jssCellsMap).flatMap((rowMap) => Object.values(rowMap));
            if (jssCells.length) {
                puzzle.items = [...puzzle.items, JssConstraint(jssCells)];
            }

            return baseTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;
        },
    };
};
