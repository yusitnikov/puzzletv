import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {CellStateEx, getCellDataComparer} from "../../../types/sudoku/CellState";
import {GivenDigitsMap, serializeGivenDigitsMap, unserializeGivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {GameState} from "../../../types/sudoku/GameState";
import {Set} from "../../../types/struct/Set";
import {CellOwnershipConstraint} from "../components/CellOwnership";

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
        {state: {currentPlayer, selectedCells}, multiPlayer: {isEnabled}},
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
            ({top, left}) => solution[top][left] === cellData)
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
            ignoreOwnership: !areAllCorrect,
        }
    },

    // handleDigitGlobally(
    //     isGlobal,
    //     clientId,
    //     {state},
    //     cellData,
    //     defaultResult
    // ): Partial<ProcessedGameState<number> & ProcessedGameStateExtensionType> {
    //     if (!isGlobal) {
    //         return defaultResult;
    //     }
    //
    //     const {cellWriteMode, selectedCells} = state;
    //     const newState = {...state, ...defaultResult};
    //
    //     if (cellWriteMode !== CellWriteMode.main || !selectedCells.size) {
    //         return defaultResult;
    //     }
    //
    //     return defaultResult;
    // },

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
});
