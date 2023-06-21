import {allDrawingModes, PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {FieldSize6, FieldSize8, Regions6, Regions8} from "../../types/sudoku/FieldSize";
import {ChessSudokuTypeManager} from "../../sudokuTypes/chess/types/ChessSudokuTypeManager";
import {chessInitialPiecesByCellNames} from "../../sudokuTypes/chess/utils/chessCoords";
import {ChessPieceType} from "../../sudokuTypes/chess/types/ChessPieceType";
import {ChessColor} from "../../sudokuTypes/chess/types/ChessColor";
import {ChessBoardCellsBackgroundConstraint} from "../../sudokuTypes/chess/components/ChessBoardCellsBackground";
import {
    ChessBoardIndexesConstraint,
    chessBoardIndexesMargin
} from "../../sudokuTypes/chess/components/ChessBoardIndexes";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {Chameleon} from "../authors";
import {almostNormalSudokuRulesApply} from "../ruleSnippets";
import {
    chessSudokuRules,
    emptyCells,
    mateInOne,
    noPastPromotions,
    normalSudokuRulesForChessPieces, optionalChessPiecesRules
} from "../../sudokuTypes/chess/data/ruleSnippets";
import {RulesSpoiler} from "../../components/sudoku/rules/RulesSpoiler";
import {areSameGivenDigitsMaps, GivenDigitsMap, mergeGivenDigitsMaps} from "../../types/sudoku/GivenDigitsMap";
import {ValidChessPositionConstraint} from "../../sudokuTypes/chess/constraints/ValidChessPosition";
import {ChessPTM} from "../../sudokuTypes/chess/types/ChessPTM";
import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {ChessPiece} from "../../sudokuTypes/chess/types/ChessPiece";

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

const isValidSolution = (
    context: PuzzleContext<ChessPTM>,
    mandatorySolutionPieces: GivenDigitsMap<ChessPiece>,
    optionalSolutionPieces: GivenDigitsMap<ChessPiece> = {},
) => {
    const currentFinalDigits = mergeGivenDigitsMaps(
        context.userDigits,
        optionalSolutionPieces
    );

    const correctFinalDigits = mergeGivenDigitsMaps(
        context.puzzle.initialDigits!,
        context.stateInitialDigits || {},
        mandatorySolutionPieces,
        optionalSolutionPieces
    );

    return areSameGivenDigitsMaps(context, currentFinalDigits, correctFinalDigits);
};

export const RealChessPuzzle: PuzzleDefinition<ChessPTM> = {
    title: {
        [LanguageCode.en]: "Easy-peasy, Mate in One",
        [LanguageCode.ru]: "Мат в 1 ход",
    },
    slug: "real-chess-sudoku",
    author: Chameleon,
    rules: translate => <>
        <RulesParagraph>
            {translate(chessSudokuRules)}. {translate(optionalChessPiecesRules)}.
        </RulesParagraph>
        <RulesParagraph>
            <strong>{translate(almostNormalSudokuRulesApply)}</strong>: {translate(normalSudokuRulesForChessPieces)}. {translate({
                [LanguageCode.en]: <>For instance, there could be no other knights (regardless of color) in the top-left box, on column <strong>d</strong> and on row <strong>7</strong></>,
                [LanguageCode.ru]: <>Например, в верхне-левом регионе, на линии <strong>d</strong> и на линии <strong>7</strong> не может быть других коней (любого цвета)</>,
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
                [LanguageCode.ru]: "используйте цвета, чтобы пометить возможные места расположения различных фигур, или чтобы пометить какие поля уже атакованы",
            })}.</RulesSpoiler>
        </RulesParagraph>
    </>,
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize8,
    regions: Regions8,
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
    resultChecker: (context) => isValidSolution(context, mandatorySolutionPieces, optionalSolutionPieces),
    items: [
        ChessBoardCellsBackgroundConstraint(),
        ChessBoardIndexesConstraint(),
        ValidChessPositionConstraint,
    ],
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000AMM",
    getLmdSolutionCode: () => "bishopf8c5",
};

export const RealChessPuzzleCompatibilitySlug: typeof RealChessPuzzle= {
    ...RealChessPuzzle,
    slug: "real-chess-puzzle",
    noIndex: true,
};

export const RealChessPuzzle2: PuzzleDefinition<ChessPTM> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Easy-peasy, Mate in One v2",
        [LanguageCode.ru]: "Мат в 1 ход v2",
    },
    slug: "real-chess-sudoku-v2",
    author: Chameleon,
    rules: translate => <>
        <RulesParagraph>
            {translate(chessSudokuRules)}.
        </RulesParagraph>
        <RulesParagraph>
            {translate({
                [LanguageCode.en]: "Also, there's a 6x6 sudoku grid in the middle of the chess board",
                [LanguageCode.ru]: "Кроме того, в центре шахматной доски есть поле судоку 6x6",
            })}.
        </RulesParagraph>
        <RulesParagraph>
            <strong>{translate(almostNormalSudokuRulesApply)}</strong>: {translate(normalSudokuRulesForChessPieces)}. {translate({
            [LanguageCode.en]: <>For instance, there could be no other bishops (regardless of color) in the bottom-left box, in column <strong>d</strong> and in row <strong>3</strong></>,
            [LanguageCode.ru]: <>Например, в нижне-левом регионе, на линии <strong>d</strong> и на линии <strong>3</strong> не может быть других слонов (любого цвета)</>,
        })}. {translate(emptyCells)}.
        </RulesParagraph>
        <RulesParagraph>
            {translate(noPastPromotions)}.
        </RulesParagraph>
        <RulesParagraph>
            {translate(mateInOne)}.
        </RulesParagraph>
        <RulesParagraph>
            {translate({
                [LanguageCode.en]: "There are no chess pieces outside the sudoku grid",
                [LanguageCode.ru]: "Шахматные фигуры не могут находиться за пределами поля судоку",
            })}. {translate({
            [LanguageCode.en]: "The chess piece that moves to do the mate in one can't escape the sudoku grid either (while doing the move)",
            [LanguageCode.ru]: "Шахматная фигура, которая ходит для того, чтобы поставить мат в один ход, тоже не может выйти за пределы поля судоку для этого",
        })}.
        </RulesParagraph>
    </>,
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize6,
    regions: Regions6,
    fieldMargin: chessBoardIndexesMargin + 1,
    initialDigits: {
        0: {
            5: {color: ChessColor.black, type: ChessPieceType.king},
        },
        1: {
            1: {color: ChessColor.white, type: ChessPieceType.king},
            3: {color: ChessColor.black, type: ChessPieceType.queen},
            4: {color: ChessColor.black, type: ChessPieceType.pawn},
        },
        2: {
            3: {color: ChessColor.black, type: ChessPieceType.bishop},
        },
        3: {
            0: {color: ChessColor.black, type: ChessPieceType.rook},
            1: {color: ChessColor.white, type: ChessPieceType.pawn},
        },
        4: {
            0: {color: ChessColor.white, type: ChessPieceType.pawn},
            1: {color: ChessColor.black, type: ChessPieceType.rook},
            2: {color: ChessColor.black, type: ChessPieceType.bishop},
        },
        5: {
            3: {color: ChessColor.black, type: ChessPieceType.pawn},
        },
    },
    items: [
        ChessBoardCellsBackgroundConstraint(),
        ChessBoardIndexesConstraint(),
        ValidChessPositionConstraint,
    ],
    allowDrawing: allDrawingModes,
    resultChecker: (context) => isValidSolution(
        context,
        {
            0: {
                1: {color: ChessColor.white, type: ChessPieceType.bishop},
                2: {color: ChessColor.white, type: ChessPieceType.rook},
                4: {color: ChessColor.white, type: ChessPieceType.knight},
            },
            1: {
                2: {color: ChessColor.black, type: ChessPieceType.knight},
            },
            2: {
                4: {color: ChessColor.white, type: ChessPieceType.queen},
                5: {color: ChessColor.white, type: ChessPieceType.knight},
            },
            4: {
                3: {color: ChessColor.black, type: ChessPieceType.knight},
            },
            5: {
                5: {color: ChessColor.white, type: ChessPieceType.rook},
            },
        }
    ),
};
