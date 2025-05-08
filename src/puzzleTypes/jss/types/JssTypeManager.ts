import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import {
    getRegionCells,
    importGivenColorsAsSolution,
    importSolutionColorsAsGiven,
    PuzzleDefinition,
} from "../../../types/puzzle/PuzzleDefinition";
import { PositionSet } from "../../../types/layout/Position";
import { Constraint } from "../../../types/puzzle/Constraint";
import { JssCell } from "./JssCell";
import { CellsMap, processCellsMaps } from "../../../types/puzzle/CellsMap";
import { CellColorValue, resolveCellColorValue } from "../../../types/puzzle/CellColor";
import { JssConstraint } from "../constraints/Jss";
import { isTextConstraint, TextProps } from "../../../components/puzzle/constraints/text/Text";

export const JssTypeManager = <T extends AnyPTM>(
    baseTypeManager: PuzzleTypeManager<T>,
    puzzleHasZeroRegion = false,
): PuzzleTypeManager<T> => {
    return {
        ...baseTypeManager,
        mapImportedColors: true,
        postProcessPuzzle(puzzle): PuzzleDefinition<T> {
            puzzle = {
                ...puzzle,
                disableBackgroundColorOpacity: true,
            };

            if (puzzle.regions?.length) {
                let activeRegions = puzzle.regions;
                const inactiveCells = puzzle.inactiveCells ?? [];

                if (puzzleHasZeroRegion) {
                    // Get the largest region
                    const inactiveRegion = activeRegions.reduce((a, b) =>
                        getRegionCells(a).length > getRegionCells(b).length ? a : b,
                    );
                    activeRegions = activeRegions.filter((region) => region !== inactiveRegion);
                    inactiveCells.push(...getRegionCells(inactiveRegion));
                }

                puzzle = {
                    ...puzzle,
                    regions: activeRegions,
                    inactiveCells,
                };
            }

            const allRegionCells = new PositionSet(puzzle.regions?.flatMap(getRegionCells));

            // Treat given colors inside active regions as solution colors
            importGivenColorsAsSolution(puzzle, (position) => allRegionCells.contains(position));
            // Treat solution colors outside active regions as given colors
            importSolutionColorsAsGiven(puzzle, (position) => !allRegionCells.contains(position));

            // Treat given colors outside active regions as JSS clues
            let jssCellsMap: CellsMap<JssCell> = processCellsMaps(
                ([[color]], position): JssCell | undefined =>
                    color && !allRegionCells.contains(position)
                        ? {
                              ...position,
                              backgroundColor: resolveCellColorValue(color),
                          }
                        : undefined,
                [puzzle.initialColors as CellsMap<CellColorValue[]>],
            );
            puzzle.initialColors = undefined;

            puzzle.items = puzzle.items ?? [];
            if (!Array.isArray(puzzle.items)) {
                throw new Error(`puzzle.items is expected to be an array for ${JssTypeManager.name}`);
            }
            const isJssTextClue = (constraint: Constraint<T, any>): constraint is Constraint<T, TextProps> => {
                const {
                    cells: { length, 0: cell },
                } = constraint;
                return (
                    isTextConstraint(constraint) &&
                    length === 1 &&
                    cell.top % 1 === 0 &&
                    cell.left % 1 === 0 &&
                    constraint.props.text !== ""
                );
            };
            for (const constraint of puzzle.items) {
                if (isJssTextClue(constraint)) {
                    const {
                        cells: [{ top, left }],
                        props: { text, size },
                        color,
                    } = constraint;
                    jssCellsMap[top] = jssCellsMap[top] ?? {};
                    jssCellsMap[top][left] = jssCellsMap[top][left] ?? { top, left };
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
