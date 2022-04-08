import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {ChessGameState} from "./ChessGameState";
import {ChessPiece} from "./ChessPiece";
import {ChessColor} from "./ChessColor";
import {ChessPieceCellDataComponentType} from "../components/ChessPieceCellData";
import {ChessMainControls} from "../components/ChessMainControls";

export const ChessSudokuTypeManager: SudokuTypeManager<ChessPiece, ChessGameState, ChessGameState> = {
    areSameCellData({type: type1, color: color1}, {type: type2, color: color2}): boolean {
        return type1 === type2 && color1 === color2;
    },

    compareCellData({type: type1, color: color1}, {type: type2, color: color2}): number {
        return color1 - color2 || type1 - type2;
    },

    getCellDataHash({type, color}): string {
        return `${type}-${color}`;
    },

    cloneCellData(digit) {
        return {...digit};
    },

    createCellDataByDisplayDigit(digit, {selectedColor}): ChessPiece {
        return {
            type: digit,
            color: selectedColor,
        };
    },

    createCellDataByTypedDigit(digit, {selectedColor}): ChessPiece {
        return {
            type: digit,
            color: selectedColor,
        }
    },

    cellDataComponentType: ChessPieceCellDataComponentType,

    initialGameStateExtension: {
        selectedColor: ChessColor.black,
    },

    mainControlsCount: 1,

    mainControlsComponent: ChessMainControls,

    maxDigitsCount: 6,

    digitShortcuts: ["P", "N", "B", "R", "Q", "K"],

    digitShortcutTips: [undefined, "please note that Ctrl+N may not work"],
};
