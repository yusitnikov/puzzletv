import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { CellStateEx } from "../../../types/puzzle/CellState";
import { serializeCellsMap, unserializeCellsMap } from "../../../types/puzzle/CellsMap";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { GameStateEx, mergeGameStateWithUpdates } from "../../../types/puzzle/GameState";
import { CellOwnershipConstraint } from "../components/CellOwnership";
import { indexes, indexesFromTo } from "../../../utils/indexes";
import { getExcludedDigitDataHash, getMainDigitDataHash } from "../../../utils/playerDataHash";
import { Position } from "../../../types/layout/Position";
import { CellDataSet } from "../../../types/puzzle/CellDataSet";
import { AnyNumberPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const GuessTypeManager = <T extends AnyNumberPTM>(): PuzzleTypeManager<T> => ({
    ...DigitPuzzleTypeManager(),

    items: [CellOwnershipConstraint()],

    handleDigitInCell(
        isGlobal,
        clientId,
        inputMode,
        cellState,
        cellData,
        { top, left },
        {
            puzzle: { solution = {}, params = {} },
            currentPlayer,
            selectedCells,
            allInitialDigits,
            multiPlayer: { isEnabled },
        },
        defaultResult,
        cache,
    ): Partial<CellStateEx<T>> {
        const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;

        if (!isGlobal) {
            return defaultResult;
        }

        if (inputMode !== PuzzleInputMode.mainDigit) {
            return defaultResult;
        }

        if (!isMyTurn) {
            return {};
        }

        if (cellState.initialDigit) {
            return {};
        }

        const areAllCorrect: boolean = (cache.areAllPositive =
            cache.areAllPositive ??
            selectedCells.items.every(
                ({ top, left }) => solution[top][left] === cellData || allInitialDigits[top]?.[left] !== undefined,
            ));

        if (solution[top][left] !== cellData) {
            return {
                excludedDigits: cellState.excludedDigits.add(cellData),
            };
        }

        return {
            initialDigit: cellData,
            usersDigit: undefined,
            centerDigits: cellState.centerDigits.clear(),
            cornerDigits: cellState.cornerDigits.clear(),
            excludedDigits: cellState.excludedDigits.clear(),
            isInvalid: !areAllCorrect,
        };
    },

    disableConflictChecker: true,

    getSharedState({ typeManager: { serializeCellData } }, { initialDigits, excludedDigits }): any {
        return {
            initialDigits: serializeCellsMap(initialDigits, serializeCellData),
            excludedDigits: serializeCellsMap(excludedDigits, (item) => item.serialize()),
        };
    },

    setSharedState(context, { initialDigits, excludedDigits }): GameStateEx<T> {
        const { puzzle, myGameState } = context;
        return mergeGameStateWithUpdates(myGameState, {
            initialDigits: unserializeCellsMap(initialDigits, puzzle.typeManager.unserializeCellData),
            excludedDigits: unserializeCellsMap(excludedDigits, (item) => CellDataSet.unserialize(context, item)),
        });
    },

    getPlayerScore(context, clientId) {
        const {
            puzzle,
            multiPlayer: { isEnabled },
            playerObjects,
            digitsCount,
        } = context;

        const {
            params = {},
            typeManager: { createCellDataByDisplayDigit },
            gridSize: { rowsCount, columnsCount },
        } = puzzle;

        const isCompetitive = isEnabled && !params.share;

        let score = 0;

        for (const top of indexes(rowsCount)) {
            for (const left of indexes(columnsCount)) {
                const position: Position = { top, left };

                if (isCompetitive) {
                    const playerObject = playerObjects[getMainDigitDataHash(position)];

                    if (playerObject?.isValid && playerObject?.clientId === clientId) {
                        score++;
                    }
                } else {
                    for (const digit of indexesFromTo(1, digitsCount, true)) {
                        const cellData = createCellDataByDisplayDigit(digit, context);
                        const playerObject = playerObjects[getExcludedDigitDataHash(position, cellData, context)];

                        if (playerObject?.isValid && playerObject?.clientId === clientId) {
                            score++;
                        }
                    }
                }
            }
        }

        return score;
    },
});
