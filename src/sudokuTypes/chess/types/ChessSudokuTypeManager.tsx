import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {ChessGameState} from "./ChessGameState";
import {ChessPiece} from "./ChessPiece";
import {ChessColor} from "./ChessColor";
import {ChessPieceCellDataComponentType} from "../components/ChessPieceCellData";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {PartialGameStateEx} from "../../../types/sudoku/GameState";
import {ctrlKeyText} from "../../../utils/os";
import {ControlButtonRegion} from "../../../components/sudoku/controls/ControlButtonsManager";
import {ChessMainControls} from "../components/ChessMainControls";

export const ChessSudokuTypeManager: SudokuTypeManager<ChessPiece, ChessGameState> = {
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

    unserializeGameState({selectedColor}): Partial<ChessGameState> {
        return {selectedColor};
    },

    createCellDataByDisplayDigit(digit, {extension: {selectedColor}}): ChessPiece {
        return {
            type: digit,
            color: selectedColor,
        };
    },

    createCellDataByTypedDigit(digit, {state: {extension: {selectedColor}}}): ChessPiece {
        return {
            type: digit,
            color: selectedColor,
        }
    },

    createCellDataByImportedDigit(digit): ChessPiece {
        return {
            type: digit,
            // TODO: support for importing piece's color
            color: ChessColor.white,
        }
    },

    getDigitByCellData(data: ChessPiece) {
        return data.type;
    },

    cellDataComponentType: ChessPieceCellDataComponentType,

    initialGameStateExtension: {
        selectedColor: ChessColor.black,
    },

    controlButtons: [
        {
            key: "chess-piece-color",
            region: ControlButtonRegion.custom,
            Component: ChessMainControls,
        }
    ],

    maxDigitsCount: 6,

    digitShortcuts: [["P"], ["N"], ["B"], ["R"], ["Q"], ["K"]],

    digitShortcutTips: [
        undefined,
        {
            [LanguageCode.en]: `please note that ${ctrlKeyText}+N may not work`,
            [LanguageCode.ru]: `${ctrlKeyText}+N может не работать`,
        },
    ],

    getInternalState(puzzle, {extension: {selectedColor}}): any {
        return {selectedColor};
    },

    unserializeInternalState(
        puzzle,
        {selectedColor}
    ): PartialGameStateEx<ChessPiece, ChessGameState> {
        return {extension: {selectedColor}};
    }
};
