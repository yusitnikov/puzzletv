import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {MultiStageGameState} from "../../multi-stage/types/MultiStageGameState";
import {MultiStageSudokuTypeManager} from "../../multi-stage/types/MultiStageSudokuTypeManager";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../../types/sudoku/Constraint";
import {createRegularRegions, getDefaultRegionsForRowsAndColumns} from "../../../types/sudoku/FieldSize";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";
import {indexes} from "../../../utils/indexes";
import {TenInOneRegionConstraint} from "../constraints/TenInOneRegion";
import {Position} from "../../../types/layout/Position";
import {GivenDigitsMap, mergeGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {gameStateGetCurrentFieldState} from "../../../types/sudoku/GameState";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";
import {LanguageCode} from "../../../types/translations/LanguageCode";

export const TenInOneSudokuTypeManager = (
    isRemainingCell: (cell: Position) => boolean,
): SudokuTypeManager<number, MultiStageGameState, MultiStageGameState> => ({
    ...MultiStageSudokuTypeManager({
        getStage: (context) =>
            context.state.stage === 1
                ? (isValidFinishedPuzzleByConstraints(context) ? 2 : 1)
                : 3,
        onStageChange: (context, stage) => {
            const {
                puzzle: {
                    fieldSize: {rowsCount, columnsCount},
                    typeManager,
                },
                state,
            } = context;

            if (stage === 2) {
                const {cells} = gameStateGetCurrentFieldState(state);

                const allCells: Position[] = indexes(rowsCount).flatMap(top => indexes(columnsCount).map(left => ({top, left})));
                const remainingCells = allCells.filter(isRemainingCell);

                const initialDigits: GivenDigitsMap<number> = {};
                for (const {top, left} of remainingCells) {
                    initialDigits[top] = initialDigits[top] || {};
                    initialDigits[top][left] = cells[top][left].usersDigit!;
                }

                return {
                    initialDigits: mergeGivenDigitsMaps(state.initialDigits, initialDigits),
                };
            }

            return {
                fieldStateHistory: fieldStateHistoryAddState(
                    typeManager,
                    state.fieldStateHistory,
                    state => ({
                        ...state,
                        cells: state.cells.map(cellsRow => cellsRow.map(
                            ({cornerDigits, centerDigits, colors}) => ({
                                usersDigit: undefined,
                                cornerDigits: cornerDigits.clear(),
                                centerDigits: centerDigits.clear(),
                                colors: colors.clear(),
                            })
                        )),
                    })
                ),
            };
        },
        getStageCompletionText: ({state: {stage}}) => stage === 2
            ? {
                [LanguageCode.en]: <>Now other digits from stage 1 can be&nbsp;removed.</>,
                [LanguageCode.ru]: <>Теперь можно удалить остальные цифры с этапа 1.</>,
            }
            : undefined,
        getStageButtonText: ({state: {stage}}) => stage === 2
            ? {
                [LanguageCode.en]: "Clean up the grid",
                [LanguageCode.ru]: "Очистить поле",
            }
            : undefined,
    }),

    getRegionsForRowsAndColumns(
        puzzle,
        {stage}
    ): Constraint<any>[] {
        const individualBoxes = stage === 1;
        const {fieldSize: {rowsCount, columnsCount, regionWidth, regionHeight}} = puzzle;

        if (!regionWidth || !regionHeight || regionWidth !== regionHeight) {
            throw new Error("Configuration error: irregular field sizes are not supported by ten-in-one puzzles");
        }

        const regions = createRegularRegions(rowsCount, columnsCount, regionWidth, regionHeight);
        const boxes = regions.map(region => individualBoxes ? TenInOneRegionConstraint(region) : RegionConstraint(region));

        if (!individualBoxes) {
            return [
                ...boxes,
                ...getDefaultRegionsForRowsAndColumns(puzzle),
            ];
        }

        const boxSize = regionWidth;

        return [
            ...boxes,
            ...indexes(boxSize).flatMap(boxLeftIndex => {
                const boxLeftOffset = boxLeftIndex * boxSize;

                return indexes(boxSize).flatMap(boxRightIndex => {
                    const boxRightOffset = boxRightIndex * boxSize;

                    return indexes(boxSize).flatMap(i => [
                        RegionConstraint(
                            indexes(boxSize).map(left => ({
                                left: boxLeftOffset + left,
                                top: boxRightOffset + i,
                            })),
                            false,
                            "row"
                        ),
                        RegionConstraint(
                            indexes(boxSize).map(top => ({
                                left: boxLeftOffset + i,
                                top: boxRightOffset + top,
                            })),
                            false,
                            "column"
                        ),
                    ]);
                });
            }),
        ];
    },
});
