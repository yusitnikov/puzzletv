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
import {ChessPTM} from "./ChessPTM";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {addGameStateExToSudokuManager} from "../../../types/sudoku/SudokuTypeManagerPlugin";

export const ChessSudokuTypeManager: SudokuTypeManager<ChessPTM> = addGameStateExToSudokuManager<ChessPTM, ChessGameState, {}>({
    areSameCellData(
        {type: type1, color: color1},
        {type: type2, color: color2},
        context,
        cell1,
    ): boolean {
        const forConstraints = cell1 !== undefined;
        return type1 === type2 && (forConstraints || color1 === color2);
    },

    compareCellData(
        {type: type1, color: color1},
        {type: type2, color: color2},
        context,
        useState = true,
        forConstraints = true
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

    createCellDataByDisplayDigit(digit, {stateExtension: {selectedColor}}): ChessPiece {
        return {
            type: digit,
            color: selectedColor,
        };
    },

    createCellDataByTypedDigit(digit, {stateExtension: {selectedColor}}): ChessPiece {
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

    digitComponentType: RegularDigitComponentType(),

    cellDataComponentType: ChessPieceCellDataComponentType,

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
            [LanguageCode.de]: `bitte beachten Sie, dass ${ctrlKeyText}+N möglicherweise nicht funktioniert`,
        },
    ],

    getInternalState(puzzle, {extension: {selectedColor}}): any {
        return {selectedColor};
    },

    unserializeInternalState(
        puzzle,
        {selectedColor}
    ): PartialGameStateEx<ChessPTM> {
        return {extension: {selectedColor}};
    },
}, {
    initialGameStateExtension: {
        selectedColor: ChessColor.black,
    },
});
