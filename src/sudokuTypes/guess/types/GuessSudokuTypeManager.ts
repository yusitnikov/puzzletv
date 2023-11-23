import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {CellStateEx} from "../../../types/sudoku/CellState";
import {serializeGivenDigitsMap, unserializeGivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {GameStateEx, mergeGameStateWithUpdates} from "../../../types/sudoku/GameState";
import {CellOwnershipConstraint} from "../components/CellOwnership";
import {indexes, indexesFromTo} from "../../../utils/indexes";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../../utils/playerDataHash";
import {Position} from "../../../types/layout/Position";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";
import {AnyNumberPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const GuessSudokuTypeManager = <T extends AnyNumberPTM>(): SudokuTypeManager<T> => ({
    ...DigitSudokuTypeManager(),

    items: [CellOwnershipConstraint()],

    handleDigitInCell(
        isGlobal,
        clientId,
        cellWriteMode,
        cellState,
        cellData,
        {top, left},
        {
            puzzle: {solution = {}, params = {}},
            currentPlayer,
            selectedCells,
            allInitialDigits,
            multiPlayer: {isEnabled},
        },
        defaultResult,
        cache
    ): Partial<CellStateEx<T>> {
        const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;

        if (!isGlobal) {
            return defaultResult;
        }

        if (cellWriteMode !== CellWriteMode.main) {
            return defaultResult;
        }

        if (!isMyTurn) {
            return {};
        }

        if (cellState.initialDigit) {
            return {};
        }

        const areAllCorrect: boolean = (cache.areAllPositive = cache.areAllPositive ?? selectedCells.items.every(
            ({top, left}) => solution[top][left] === cellData || allInitialDigits[top]?.[left] !== undefined)
        );

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

    getSharedState({typeManager: {serializeCellData}}, {initialDigits, excludedDigits}): any {
        return {
            initialDigits: serializeGivenDigitsMap(initialDigits, serializeCellData),
            excludedDigits: serializeGivenDigitsMap(excludedDigits, item => item.serialize()),
        };
    },

    setSharedState(
        {puzzle, myGameState},
        {initialDigits, excludedDigits}
    ): GameStateEx<T> {
        return mergeGameStateWithUpdates(myGameState, {
            initialDigits: unserializeGivenDigitsMap(initialDigits, puzzle.typeManager.unserializeCellData),
            excludedDigits: unserializeGivenDigitsMap(excludedDigits, item => CellDataSet.unserialize(puzzle, item)),
        });
    },

    getPlayerScore(context, clientId) {
        const {
            puzzle,
            multiPlayer: {isEnabled},
            playerObjects,
            digitsCount,
        } = context;

        const {
            params = {},
            typeManager: {createCellDataByDisplayDigit},
            fieldSize: {rowsCount, columnsCount},
        } = puzzle;

        const isCompetitive = isEnabled && !params.share;

        let score = 0;

        for (const top of indexes(rowsCount)) {
            for (const left of indexes(columnsCount)) {
                const position: Position = {top, left};

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
