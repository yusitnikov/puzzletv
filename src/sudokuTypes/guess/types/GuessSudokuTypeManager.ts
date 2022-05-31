import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {CellStateEx, getCellDataComparer} from "../../../types/sudoku/CellState";
import {GivenDigitsMap, serializeGivenDigitsMap, unserializeGivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {GameState} from "../../../types/sudoku/GameState";
import {Set} from "../../../types/struct/Set";
import {CellOwnershipConstraint} from "../components/CellOwnership";
import {indexes, indexesFromTo} from "../../../utils/indexes";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../../utils/playerDataHash";
import {Position} from "../../../types/layout/Position";
import {getDefaultDigitsCount} from "../../../types/sudoku/PuzzleDefinition";

export const GuessSudokuTypeManager = <GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    solution: GivenDigitsMap<number>,
    serializeGameState?: SudokuTypeManager<number, GameStateExtensionType, any>["serializeGameState"],
    unserializeGameState?: SudokuTypeManager<number, GameStateExtensionType, any>["unserializeGameState"]
): SudokuTypeManager<number, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    ...DigitSudokuTypeManager<GameStateExtensionType, ProcessedGameStateExtensionType>(
        RegularDigitComponentType,
        serializeGameState,
        unserializeGameState
    ),

    items: [CellOwnershipConstraint],

    handleDigitInCell(
        isGlobal,
        clientId,
        cellWriteMode,
        cellState,
        cellData,
        {top, left},
        {state: {currentPlayer, selectedCells, initialDigits}, multiPlayer: {isEnabled}},
        defaultResult,
        cache
    ): Partial<CellStateEx<number>> {
        const isMyTurn = !isEnabled || currentPlayer === clientId;

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
        {typeManager: {areSameCellData, cloneCellData, serializeCellData, unserializeCellData}},
        state,
        {initialDigits, excludedDigits}
    ): GameState<number> & GameStateExtensionType {
        const compareCellData = getCellDataComparer(areSameCellData);

        return {
            ...state,
            initialDigits: unserializeGivenDigitsMap(initialDigits, unserializeCellData),
            excludedDigits: unserializeGivenDigitsMap(excludedDigits, item => Set.unserialize(
                item,
                compareCellData,
                cloneCellData,
                serializeCellData,
                unserializeCellData
            )),
        };
    },

    getPlayerScore(context, clientId) {
        const {
            puzzle,
            state,
            multiPlayer: {isEnabled},
        } = context;

        const {
            typeManager: {createCellDataByDisplayDigit},
            fieldSize: {rowsCount, columnsCount},
            digitsCount = getDefaultDigitsCount(puzzle),
        } = puzzle;

        const {playerObjects} = state;

        let score = 0;

        for (const top of indexes(rowsCount)) {
            for (const left of indexes(columnsCount)) {
                const position: Position = {top, left};

                if (isEnabled) {
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
