import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { MultiStageTypeManager } from "../../multi-stage/types/MultiStageTypeManager";
import { Constraint, isValidFinishedPuzzleByConstraints } from "../../../types/puzzle/Constraint";
import { createRegularRegions, getDefaultRegionsForRowsAndColumns } from "../../../types/puzzle/GridSize";
import { RegionConstraint } from "../../../components/puzzle/constraints/region/Region";
import { indexes } from "../../../utils/indexes";
import { TenInOneRegionConstraint } from "../constraints/TenInOneRegion";
import { Position } from "../../../types/layout/Position";
import { GivenDigitsMap, mergeGivenDigitsMaps } from "../../../types/puzzle/GivenDigitsMap";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { MultiStagePTM } from "../../multi-stage/types/MultiStagePTM";
import { myClientId } from "../../../hooks/useMultiPlayer";

export const TenInOneTypeManager = (
    isRemainingCell: (cell: Position) => boolean,
): PuzzleTypeManager<MultiStagePTM> => ({
    ...MultiStageTypeManager({
        getStage: (context) =>
            context.stateExtension.stage === 1
                ? isValidFinishedPuzzleByConstraints(context).isCorrectResult
                    ? 2
                    : 1
                : 3,
        onStageChange: (context, stage) => {
            const { puzzle, stateInitialDigits } = context;
            const {
                gridSize: { rowsCount, columnsCount },
            } = puzzle;

            if (stage === 2) {
                const allCells: Position[] = indexes(rowsCount).flatMap((top) =>
                    indexes(columnsCount).map((left) => ({ top, left })),
                );
                const remainingCells = allCells.filter(isRemainingCell);

                const initialDigits: GivenDigitsMap<number> = {};
                for (const { top, left } of remainingCells) {
                    initialDigits[top] = initialDigits[top] || {};
                    initialDigits[top][left] = context.getCellDigit(top, left)!;
                }

                return {
                    initialDigits: mergeGivenDigitsMaps(stateInitialDigits, initialDigits),
                };
            }

            return {
                // TODO support shared games
                gridStateHistory: gridStateHistoryAddState(context, myClientId, "ten-in-one-reset-grid", (state) => ({
                    ...state,
                    cells: state.cells.map((cellsRow) =>
                        cellsRow.map(({ cornerDigits, centerDigits, colors }) => ({
                            usersDigit: undefined,
                            cornerDigits: cornerDigits.clear(),
                            centerDigits: centerDigits.clear(),
                            colors: colors.clear(),
                        })),
                    ),
                })),
            };
        },
        getStageCompletionText: ({ stateExtension: { stage } }) =>
            stage === 2
                ? {
                      [LanguageCode.en]: <>Now other digits from stage 1 can be&nbsp;removed.</>,
                      [LanguageCode.ru]: <>Теперь можно удалить остальные цифры с этапа 1.</>,
                  }
                : undefined,
        getStageButtonText: ({ stateExtension: { stage } }) =>
            stage === 2
                ? {
                      [LanguageCode.en]: "Clean up the grid",
                      [LanguageCode.ru]: "Очистить поле",
                  }
                : undefined,
    }),

    getRegionsForRowsAndColumns(context): Constraint<MultiStagePTM, any>[] {
        const {
            puzzle,
            stateExtension: { stage },
        } = context;
        const individualBoxes = stage === 1;
        const {
            gridSize: { rowsCount, columnsCount, regionWidth, regionHeight },
        } = puzzle;

        if (!regionWidth || !regionHeight || regionWidth !== regionHeight) {
            throw new Error("Configuration error: irregular grid sizes are not supported by ten-in-one puzzles");
        }

        const regions = createRegularRegions(rowsCount, columnsCount, regionWidth, regionHeight);
        const boxes = regions.map(
            (region): Constraint<MultiStagePTM, any> =>
                individualBoxes ? TenInOneRegionConstraint(region) : RegionConstraint(region),
        );

        if (!individualBoxes) {
            return [...boxes, ...getDefaultRegionsForRowsAndColumns(context)];
        }

        const boxSize = regionWidth;

        return [
            ...boxes,
            ...indexes(boxSize).flatMap((boxLeftIndex) => {
                const boxLeftOffset = boxLeftIndex * boxSize;

                return indexes(boxSize).flatMap((boxRightIndex) => {
                    const boxRightOffset = boxRightIndex * boxSize;

                    return indexes(boxSize).flatMap<Constraint<MultiStagePTM, any>>((i) => [
                        RegionConstraint(
                            indexes(boxSize).map((left) => ({
                                left: boxLeftOffset + left,
                                top: boxRightOffset + i,
                            })),
                            false,
                            "row",
                        ),
                        RegionConstraint(
                            indexes(boxSize).map((top) => ({
                                left: boxLeftOffset + i,
                                top: boxRightOffset + top,
                            })),
                            false,
                            "column",
                        ),
                    ]);
                });
            }),
        ];
    },
});
