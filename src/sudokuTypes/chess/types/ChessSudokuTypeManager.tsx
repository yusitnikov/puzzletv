import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {ChessGameState} from "./ChessGameState";
import {ChessPiece} from "./ChessPiece";
import {ChessColor} from "./ChessColor";
import {ChessPieceCellDataComponentType} from "../components/ChessPieceCellData";
import {ChessMainControls} from "../components/ChessMainControls";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {GameState} from "../../../types/sudoku/GameState";

export const ChessSudokuTypeManager: SudokuTypeManager<ChessPiece, ChessGameState, ChessGameState> = {
    areSameCellData(
        {type: type1, color: color1},
        {type: type2, color: color2},
        state,
        forConstraints
    ): boolean {
        return type1 === type2 && (forConstraints || color1 === color2);
    },

    compareCellData(
        {type: type1, color: color1},
        {type: type2, color: color2},
        state,
        forConstraints
    ): number {
        return (forConstraints ? 0 : color1 - color2) || type1 - type2;
    },

    getCellDataHash({type, color}): string {
        return `${type}-${color}`;
    },

    cloneCellData(digit) {
        return {...digit};
    },

    serializeCellData(data: ChessPiece): any {
        return data;
    },

    unserializeCellData(data: any): ChessPiece {
        return data as ChessPiece;
    },

    serializeGameState({selectedColor}) {
        return {selectedColor};
    },

    unserializeGameState({selectedColor}) {
        return {selectedColor};
    },

    createCellDataByDisplayDigit(digit, {selectedColor}): ChessPiece {
        return {
            type: digit,
            color: selectedColor,
        };
    },

    createCellDataByTypedDigit(digit, {state: {selectedColor}}): ChessPiece {
        return {
            type: digit,
            color: selectedColor,
        }
    },

    getDigitByCellData(data: ChessPiece) {
        return data.type;
    },

    cellDataComponentType: ChessPieceCellDataComponentType,

    initialGameStateExtension: {
        selectedColor: ChessColor.black,
    },

    mainControlsComponent: ChessMainControls,

    maxDigitsCount: 6,

    digitShortcuts: [["P"], ["N"], ["B"], ["R"], ["Q"], ["K"]],

    digitShortcutTips: [
        undefined,
        {
            [LanguageCode.en]: "please note that Ctrl+N may not work",
            [LanguageCode.ru]: "Ctrl+N может не работать",
        },
    ],

    getInternalState(puzzle, {selectedColor}): any {
        return {selectedColor};
    },

    unserializeInternalState(
        puzzle,
        {selectedColor}
    ): Partial<GameState<ChessPiece> & ChessGameState> {
        return {selectedColor};
    }
};
