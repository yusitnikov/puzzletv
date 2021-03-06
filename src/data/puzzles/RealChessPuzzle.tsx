import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {FieldSize8} from "../../types/sudoku/FieldSize";
import {ChessPiece} from "../../sudokuTypes/chess/types/ChessPiece";
import {ChessGameState} from "../../sudokuTypes/chess/types/ChessGameState";
import {ChessSudokuTypeManager} from "../../sudokuTypes/chess/types/ChessSudokuTypeManager";
import {chessInitialPiecesByCellNames} from "../../sudokuTypes/chess/utils/chessCoords";
import {ChessPieceType} from "../../sudokuTypes/chess/types/ChessPieceType";
import {ChessColor} from "../../sudokuTypes/chess/types/ChessColor";
import {ChessBoardCellsBackground} from "../../sudokuTypes/chess/components/ChessBoardCellsBackground";
import {ChessBoardIndexes, chessBoardIndexesMargin} from "../../sudokuTypes/chess/components/ChessBoardIndexes";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {Chameleon} from "../authors";
import {almostNormalSudokuRulesApply} from "../ruleSnippets";
import {
    chessSudokuRules,
    emptyCells,
    mateInOne,
    noPastPromotions,
    normalSudokuRulesForChessPieces
} from "../../sudokuTypes/chess/data/ruleSnippets";
import {RulesSpoiler} from "../../components/sudoku/rules/RulesSpoiler";
import {gameStateGetCurrentGivenDigits} from "../../types/sudoku/GameState";
import {areSameGivenDigitsMaps, mergeGivenDigitsMaps} from "../../types/sudoku/GivenDigitsMap";
import {ValidChessPositionConstraint} from "../../sudokuTypes/chess/constraints/ValidChessPosition";

const mandatorySolutionPieces = chessInitialPiecesByCellNames({
    "g8": {color: ChessColor.black, type: ChessPieceType.knight},
    "d4": {color: ChessColor.white, type: ChessPieceType.king},
    "e4": {color: ChessColor.white, type: ChessPieceType.queen},
    "f5": {color: ChessColor.white, type: ChessPieceType.rook},
    "c3": {color: ChessColor.white, type: ChessPieceType.knight},
});

const optionalSolutionPieces = chessInitialPiecesByCellNames({
    "f7": {color: ChessColor.black, type: ChessPieceType.pawn},
});

export const RealChessPuzzle: PuzzleDefinition<ChessPiece, ChessGameState, ChessGameState> = {
    title: {
        [LanguageCode.en]: "Easy-peasy, Mate in One",
        [LanguageCode.ru]: "?????? ?? 1 ??????",
    },
    slug: "real-chess-sudoku",
    author: Chameleon,
    rules: translate => <>
        <RulesParagraph>
            {translate(chessSudokuRules)}.
        </RulesParagraph>
        <RulesParagraph>
            <strong>{translate(almostNormalSudokuRulesApply)}</strong>: {translate(normalSudokuRulesForChessPieces)}. {translate({
                [LanguageCode.en]: <>For instance, there could be no other knights (regardless of color) in the top-left box, on column <strong>d</strong> and on row <strong>7</strong></>,
                [LanguageCode.ru]: <>????????????????, ?? ????????????-?????????? ??????????????, ???? ?????????? <strong>d</strong> ?? ???? ?????????? <strong>7</strong> ???? ?????????? ???????? ???????????? ?????????? (???????????? ??????????)</>,
            })}. {translate(emptyCells)}.
        </RulesParagraph>
        <RulesParagraph>
            {translate(noPastPromotions)}.
        </RulesParagraph>
        <RulesParagraph>
            {translate(mateInOne)}.
        </RulesParagraph>
        <RulesParagraph>
            {translate("Tip")}: <RulesSpoiler>{translate({
                [LanguageCode.en]: "use colors to mark possible options to place different chess pieces, or to mark which cells are already under attack",
                [LanguageCode.ru]: "?????????????????????? ??????????, ?????????? ???????????????? ?????????????????? ?????????? ???????????????????????? ?????????????????? ??????????, ?????? ?????????? ???????????????? ?????????? ???????? ?????? ??????????????????",
            })}.</RulesSpoiler>
        </RulesParagraph>
    </>,
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize8,
    fieldMargin: chessBoardIndexesMargin,
    initialDigits: chessInitialPiecesByCellNames({
        "h8": {color: ChessColor.black, type: ChessPieceType.rook},
        "b1": {color: ChessColor.black, type: ChessPieceType.rook},
        "h7": {color: ChessColor.black, type: ChessPieceType.king},
        "h6": {color: ChessColor.black, type: ChessPieceType.queen},
        "f8": {color: ChessColor.black, type: ChessPieceType.bishop},
        "h5": {color: ChessColor.black, type: ChessPieceType.bishop},
        "d7": {color: ChessColor.black, type: ChessPieceType.knight},
        "e6": {color: ChessColor.black, type: ChessPieceType.pawn},
        "b5": {color: ChessColor.black, type: ChessPieceType.pawn},
        "g4": {color: ChessColor.black, type: ChessPieceType.pawn},
        "e5": {color: ChessColor.white, type: ChessPieceType.knight},
        "d3": {color: ChessColor.white, type: ChessPieceType.rook},
        "e3": {color: ChessColor.white, type: ChessPieceType.bishop},
        "g2": {color: ChessColor.white, type: ChessPieceType.bishop},
        "c2": {color: ChessColor.white, type: ChessPieceType.pawn},
        "a3": {color: ChessColor.white, type: ChessPieceType.pawn},
    }),
    resultChecker: ({puzzle, state}) => {
        const currentGivenDigits = gameStateGetCurrentGivenDigits(state);

        const currentFinalDigits = mergeGivenDigitsMaps(
            puzzle.initialDigits!,
            state.initialDigits || {},
            currentGivenDigits,
            optionalSolutionPieces
        );

        const correctFinalDigits = mergeGivenDigitsMaps(
            puzzle.initialDigits!,
            state.initialDigits || {},
            mandatorySolutionPieces,
            optionalSolutionPieces
        );

        return areSameGivenDigitsMaps(puzzle.typeManager, currentFinalDigits, correctFinalDigits);
    },
    items: [
        <ChessBoardCellsBackground/>,
        <ChessBoardIndexes/>,
        ValidChessPositionConstraint,
    ],
};

export const RealChessPuzzleCompatibilitySlug: typeof RealChessPuzzle= {
    ...RealChessPuzzle,
    slug: "real-chess-puzzle",
    noIndex: true,
};
