import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {CellStateEx} from "../../../types/sudoku/CellState";
import {GivenDigitsMap, serializeGivenDigitsMap, unserializeGivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {GameState} from "../../../types/sudoku/GameState";
import {CellOwnershipConstraint} from "../components/CellOwnership";
import {indexes, indexesFromTo} from "../../../utils/indexes";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../../utils/playerDataHash";
import {Position} from "../../../types/layout/Position";
import {getDefaultDigitsCount} from "../../../types/sudoku/PuzzleDefinition";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";

export const GuessSudokuTypeManager = <GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    solution: GivenDigitsMap<number>
): SudokuTypeManager<number, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    ...DigitSudokuTypeManager<GameStateExtensionType, ProcessedGameStateExtensionType>(),

    items: [CellOwnershipConstraint],

    handleDigitInCell(
        isGlobal,
        clientId,
        cellWriteMode,
        cellState,
        cellData,
        {top, left},
        {puzzle: {params = {}}, state: {currentPlayer, selectedCells, initialDigits}, multiPlayer: {isEnabled}},
        defaultResult,
        cache
    ): Partial<CellStateEx<number>> {
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
            ({top, left}) => solution[top][left] === cellData || initialDigits[top]?.[left] !== undefined)
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
        puzzle,
        state,
        {initialDigits, excludedDigits}
    ): GameState<number> & GameStateExtensionType {
        return {
            ...state,
            initialDigits: unserializeGivenDigitsMap(initialDigits, puzzle.typeManager.unserializeCellData),
            excludedDigits: unserializeGivenDigitsMap(excludedDigits, item => CellDataSet.unserialize(puzzle, item)),
        };
    },

    getPlayerScore(context, clientId) {
        const {
            puzzle,
            state,
            multiPlayer: {isEnabled},
        } = context;

        const {
            params = {},
            typeManager: {createCellDataByDisplayDigit},
            fieldSize: {rowsCount, columnsCount},
            digitsCount = getDefaultDigitsCount(puzzle),
        } = puzzle;

        const {playerObjects} = state;

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
                        const cellData = createCellDataByDisplayDigit(digit, state);
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
