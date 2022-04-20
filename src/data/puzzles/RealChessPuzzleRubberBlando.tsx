import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {FieldSize9} from "../../types/sudoku/FieldSize";
import {ChessPiece} from "../../sudokuTypes/chess/types/ChessPiece";
import {ChessGameState} from "../../sudokuTypes/chess/types/ChessGameState";
import {ChessSudokuTypeManager} from "../../sudokuTypes/chess/types/ChessSudokuTypeManager";
import {ChessColor} from "../../sudokuTypes/chess/types/ChessColor";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {normalSudokuRulesApply} from "../ruleSnippets";
import {ChessPieceType} from "../../sudokuTypes/chess/types/ChessPieceType";
import {ChessBoardCellsBackground} from "../../sudokuTypes/chess/components/ChessBoardCellsBackground";
import {ChessBoardIndexes, chessBoardIndexesMargin} from "../../sudokuTypes/chess/components/ChessBoardIndexes";

export const RealChessPuzzleRubberBlando: PuzzleDefinition<ChessPiece, ChessGameState, ChessGameState> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Real Chess Sudoku",
        [LanguageCode.ru]: "Настоящий шахматный судоку",
    },
    slug: "real-chess-sudoku-rubber-blando",
    author: {
        [LanguageCode.en]: "RubberBlando",
    },
    rules: translate => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Given digits represent the starting position of each chess piece (see image). Note that the two 9's are a white bishop on the white squares and a black bishop on the black squares.",
        })}</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "All movement is in reference to the chessboard, the sudoku board does not define moves beyond normal sudoku rules."
        })}</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Rooks (1's and 2's), Knights (3's and 4's), Queens (7 and 8), and Bishops (9) all follow their normal chess move rules, with the exception they can move through other pieces to an empty square.",
        })}</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Kings (5's and 6's) have a “Anti-Kings Move” Restriction. They can be anywhere, except immediately next to their same number in any direction.",
        })}</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Every chess piece must make at least 2 valid moves.",
        })}</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Every location on the chess board must be filled from a continuation of moves from the given starting positions (all pieces are given, every square gets filled).",
        })}</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "Squares off the chessboard only have normal Sudoku rules.",
        })}</RulesParagraph>
        <RulesParagraph>{translate({
            [LanguageCode.en]: "At the puzzles conclusion, the chessboard will contain exactly 32 white pieces and 32 black pieces.",
        })}</RulesParagraph>
    </>,
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize9,
    fieldMargin: chessBoardIndexesMargin,
    initialDigits: {
        0: {
            5: {color: ChessColor.black, type: ChessPieceType.bishop},
            6: {color: ChessColor.black, type: ChessPieceType.knight},
            7: {color: ChessColor.black, type: ChessPieceType.rook},
        },
        1: {
            0: {color: ChessColor.black, type: ChessPieceType.rook},
            1: {color: ChessColor.black, type: ChessPieceType.knight},
            3: {color: ChessColor.black, type: ChessPieceType.king},
        },
        3: {
            1: {color: ChessColor.white, type: ChessPieceType.queen},
        },
        4: {
            3: {color: ChessColor.white, type: ChessPieceType.king},
        },
        5: {
            7: {color: ChessColor.black, type: ChessPieceType.queen},
            8: {color: ChessColor.white, type: ChessPieceType.bishop},
        },
        7: {
            7: {color: ChessColor.white, type: ChessPieceType.knight},
            8: {color: ChessColor.white, type: ChessPieceType.rook},
        },
        8: {
            1: {color: ChessColor.white, type: ChessPieceType.rook},
            2: {color: ChessColor.white, type: ChessPieceType.knight},
        },
    },
    items: <>
        <ChessBoardCellsBackground shifted={true}/>
        <ChessBoardIndexes shifted={true}/>
    </>,
};
