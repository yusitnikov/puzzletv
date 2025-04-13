import { AnyNumberPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { DigitSudokuTypeManager } from "../../default/types/DigitSudokuTypeManager";
import { CellTypeProps } from "../../../types/sudoku/CellTypeProps";
import { getRegionCells, mergePuzzleItems, PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import {
    createRegionsByGivenDigitsMap,
    GivenDigitsMap,
    processGivenDigitsMaps,
} from "../../../types/sudoku/GivenDigitsMap";
import { CustomCellBounds } from "../../../types/sudoku/CustomCellBounds";
import { getRegionBorders } from "../../../utils/regions";
import { getAverageModePosition, Position, PositionSet } from "../../../types/layout/Position";
import { ColorsImportMode } from "../../../types/sudoku/PuzzleImportOptions";
import { RegionConstraint } from "../../../components/sudoku/constraints/region/Region";
import { indexes } from "../../../utils/indexes";
import { MergedCellShape } from "./MergedCellShape";
import { FractionalSudokuHouseConstraint } from "../constraints/FractionalSudokuHouse";
import { lightGreyColor } from "../../../components/app/globals";
import { FractionalSudokuGridLinesConstraint } from "../constraints/FractionalSudokuGridLines";

export const MergedCellsTypeManager = <T extends AnyNumberPTM>(fractionalSudoku = false): SudokuTypeManager<T> => {
    const baseTypeManager = DigitSudokuTypeManager<T>();

    return {
        ...baseTypeManager,
        getCellTypeProps({ top, left }, puzzle): CellTypeProps<T> {
            // The puzzle wasn't processed yet - ignore cell props for now
            if (!puzzle.customCellBounds) {
                return {};
            }

            return {
                isVisible: puzzle.customCellBounds?.[top]?.[left] !== undefined,
            };
        },
        colorsImportMode: ColorsImportMode.Initials,
        cosmeticRegions: fractionalSudoku,
        postProcessPuzzle({ initialColors = {}, ...puzzle }): PuzzleDefinition<T> {
            if (typeof initialColors !== "object") {
                throw new Error("initialColors must be a plain object");
            }

            const {
                fieldSize: { rowsCount, columnsCount },
            } = puzzle;
            const cellRegions = createRegionsByGivenDigitsMap(
                processGivenDigitsMaps((colors) => colors.join(), [initialColors]),
                columnsCount,
                rowsCount,
            );

            const customCellBounds: GivenDigitsMap<CustomCellBounds> = {};
            for (const cells of cellRegions) {
                const mainCell = cells[0];

                customCellBounds[mainCell.top] ??= {};
                customCellBounds[mainCell.top][mainCell.left] = {
                    borders: [getRegionBorders(cells, 1, false, false)],
                    userArea: {
                        ...getAverageModePosition(cells),
                        width: 1,
                        height: 1,
                    },
                };
            }

            puzzle = {
                ...puzzle,
                customCellBounds,
            };

            if (fractionalSudoku) {
                if (rowsCount !== columnsCount || rowsCount % 2 === 1) {
                    throw new Error("Invalid grid size for fractional sudoku");
                }
                const size = rowsCount / 2;
                const toSudokuCell = ({ top, left }: Position): Position => ({
                    top: Math.floor(top / 2),
                    left: Math.floor(left / 2),
                });

                const cellShapes = cellRegions.map(
                    (cells): MergedCellShape => ({
                        mainCell: cells[0],
                        cellsCount: cells.length,
                    }),
                );

                const cells: MergedCellShape[][][] = indexes(size).map(() => indexes(size).map(() => []));
                for (const cellShape of cellShapes) {
                    const sudokuCell = toSudokuCell(cellShape.mainCell);
                    cells[sudokuCell.top][sudokuCell.left].push(cellShape);
                }

                const houses = [
                    ...indexes(size).map((top) => indexes(size).map((left) => ({ top, left }))),
                    ...indexes(size).map((left) => indexes(size).map((top) => ({ top, left }))),
                    ...(puzzle.regions ?? []).map(
                        (region) => new PositionSet(getRegionCells(region).map(toSudokuCell)).items,
                    ),
                ].map((houseCells) => houseCells.flatMap(({ top, left }) => cells[top][left]));

                puzzle = {
                    ...puzzle,
                    borderColor: lightGreyColor,
                    items: mergePuzzleItems(puzzle.items, [
                        FractionalSudokuGridLinesConstraint<T>(),
                        ...cells.flat().map((cellShapes) =>
                            RegionConstraint<T>(
                                cellShapes.map((region) => region.mainCell),
                                false,
                                "cell",
                            ),
                        ),
                        ...houses.map((cellShapes) => FractionalSudokuHouseConstraint<T>(cellShapes)),
                    ]),
                };
            }

            return puzzle;
        },
    };
};
