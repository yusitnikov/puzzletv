import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { ChessGameState } from "./ChessGameState";
import { ChessPiece } from "./ChessPiece";
import { ChessColor } from "./ChessColor";
import { ChessPieceCellDataComponentType } from "../components/ChessPieceCellData";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { PartialGameStateEx } from "../../../types/puzzle/GameState";
import { ctrlKeyText } from "../../../utils/os";
import { ControlButtonRegion } from "../../../components/puzzle/controls/ControlButtonsManager";
import { ChessMainControls } from "../components/ChessMainControls";
import { ChessPTM } from "./ChessPTM";
import { RegularDigitComponentType } from "../../../components/puzzle/digit/RegularDigit";
import { addGameStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { createSimpleKeyInfo } from "../../../types/puzzle/KeyInfo";

export const ChessTypeManager: PuzzleTypeManager<ChessPTM> = addGameStateExToPuzzleTypeManager<
    ChessPTM,
    ChessGameState
>(
    {
        areSameCellData({ type: type1, color: color1 }, { type: type2, color: color2 }, _context, cell1): boolean {
            const forConstraints = cell1 !== undefined;
            return type1 === type2 && (forConstraints || color1 === color2);
        },

        compareCellData(
            { type: type1, color: color1 },
            { type: type2, color: color2 },
            _context,
            _useState = true,
            forConstraints = true,
        ): number {
            return (forConstraints ? 0 : color1 - color2) || type1 - type2;
        },

        getCellDataHash({ type, color }): string {
            return `${type}-${color}`;
        },

        cloneCellData(digit) {
            return { ...digit };
        },

        serializeCellData(data: ChessPiece): any {
            return data;
        },

        unserializeCellData(data: any): ChessPiece {
            return data as ChessPiece;
        },

        createCellDataByDisplayDigit(digit, { stateExtension: { selectedColor } }): ChessPiece {
            return {
                type: digit,
                color: selectedColor,
            };
        },

        createCellDataByTypedDigit(digit, { stateExtension: { selectedColor } }): ChessPiece {
            return {
                type: digit,
                color: selectedColor,
            };
        },

        createCellDataByImportedDigit(digit): ChessPiece {
            return {
                type: digit,
                // TODO: support for importing piece's color
                color: ChessColor.white,
            };
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
            },
        ],

        maxDigit: 6,

        digitShortcuts: [
            ["P"],
            [
                createSimpleKeyInfo("N", {
                    [LanguageCode.en]: `please note that ${ctrlKeyText}+N may not work`,
                    [LanguageCode.ru]: `${ctrlKeyText}+N может не работать`,
                    [LanguageCode.de]: `bitte beachten Sie, dass ${ctrlKeyText}+N möglicherweise nicht funktioniert`,
                }),
            ],
            ["B"],
            ["R"],
            ["Q"],
            ["K"],
        ],

        getInternalState(_puzzle, { extension: { selectedColor } }): any {
            return { selectedColor };
        },

        unserializeInternalState(_puzzle, { selectedColor }): PartialGameStateEx<ChessPTM> {
            return { extension: { selectedColor } };
        },
    },
    {
        initialGameStateExtension: {
            selectedColor: ChessColor.white,
        },
    },
);
