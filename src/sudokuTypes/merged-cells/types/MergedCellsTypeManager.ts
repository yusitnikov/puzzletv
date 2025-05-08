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
import { ColorsImportMode, PuzzleImportOptions } from "../../../types/sudoku/PuzzleImportOptions";
import { RegionConstraint } from "../../../components/sudoku/constraints/region/Region";
import { indexes } from "../../../utils/indexes";
import { MergedCellShape } from "./MergedCellShape";
import { FractionalSudokuHouseConstraint } from "../constraints/FractionalSudokuHouse";
import { lightGreyColor } from "../../../components/app/globals";
import { FractionalSudokuGridLinesConstraint } from "../constraints/FractionalSudokuGridLines";

export const MergedCellsTypeManager = <T extends AnyNumberPTM>({
    fractionalSudoku = false,
    cellPieceWidth = 2,
    cellPieceHeight = 2,
}: PuzzleImportOptions): SudokuTypeManager<T> => {
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
        supportSingleRegion: true,
        postProcessPuzzle({ initialColors = {}, ...puzzle }): PuzzleDefinition<T> {
            if (typeof initialColors !== "object") {
                throw new Error("initialColors must be a plain object");
            }

            const {
                gridSize: { rowsCount, columnsCount },
            } = puzzle;
            const cellRegions = createRegionsByGivenDigitsMap(
                processGivenDigitsMaps((colors) => colors.join(), [initialColors]),
                columnsCount,
                rowsCount,
            );

            let { initialDigits, solution } = puzzle;
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

                // Move given/solution digits to the main cell of the cell part
                for (const map of [initialDigits, solution]) {
                    for (const { top, left } of cells.slice(1)) {
                        const value = map?.[top]?.[left];
                        if (value !== undefined) {
                            map![mainCell.top] ??= {};
                            map![mainCell.top][mainCell.left] = value;
                            delete map![top][left];
                        }
                    }
                }
            }

            puzzle = {
                ...puzzle,
                customCellBounds,
                initialDigits,
                solution,
            };

            if (fractionalSudoku) {
                if (rowsCount % cellPieceHeight !== 0 || columnsCount % cellPieceWidth !== 0) {
                    throw new Error("Invalid grid size for fractional sudoku");
                }
                const sudokuRowsCount = rowsCount / cellPieceHeight;
                const sudokuColumnsCount = columnsCount / cellPieceWidth;
                const toSudokuCell = ({ top, left }: Position): Position => ({
                    top: Math.floor(top / cellPieceHeight),
                    left: Math.floor(left / cellPieceWidth),
                });

                const cellShapes = cellRegions.map(
                    (cells): MergedCellShape => ({
                        mainCell: cells[0],
                        cellsCount: cells.length,
                    }),
                );

                const cells: MergedCellShape[][][] = indexes(sudokuRowsCount).map(() =>
                    indexes(sudokuColumnsCount).map(() => []),
                );
                for (const cellShape of cellShapes) {
                    const sudokuCell = toSudokuCell(cellShape.mainCell);
                    cells[sudokuCell.top][sudokuCell.left].push(cellShape);
                }

                const houses = [
                    ...indexes(sudokuRowsCount).map((top) =>
                        indexes(sudokuColumnsCount).map((left) => ({ top, left })),
                    ),
                    ...indexes(sudokuColumnsCount).map((left) =>
                        indexes(sudokuRowsCount).map((top) => ({ top, left })),
                    ),
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
