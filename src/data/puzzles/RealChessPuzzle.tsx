import {allDrawingModes, PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {FieldSize8, Regions6, Regions8} from "../../types/sudoku/FieldSize";
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
import {areSameGivenDigitsMapsByContext, GivenDigitsMap, mergeGivenDigitsMaps} from "../../types/sudoku/GivenDigitsMap";
import {ValidChessPositionConstraint} from "../../sudokuTypes/chess/constraints/ValidChessPosition";
import {ChessPTM} from "../../sudokuTypes/chess/types/ChessPTM";
import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {ChessPiece} from "../../sudokuTypes/chess/types/ChessPiece";
import {indexes, indexesFromTo} from "../../utils/indexes";

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

    return areSameGivenDigitsMapsByContext(context, currentFinalDigits, correctFinalDigits);
};

export const RealChessPuzzle: PuzzleDefinition<ChessPTM> = {
    noIndex: true,
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
};

export const RealChessPuzzle2: PuzzleDefinition<ChessPTM> = {
    title: {
        [LanguageCode.en]: "Cross-blunder",
        [LanguageCode.ru]: "Двойной зевок",
        [LanguageCode.de]: "Doppelte Mattdrohnung",
    },
    slug: "real-chess-sudoku-v2",
    saveStateKey: "real-chess-sudoku-v2-3",
    author: {
        [LanguageCode.en]: "Chameleon & Raumplaner",
        [LanguageCode.ru]: "Хамелеона и Raumplaner'а",
    },
    rules: translate => <>
        <RulesParagraph>
            {translate(chessSudokuRules)}.
        </RulesParagraph>
        <RulesParagraph>
            {translate({
                [LanguageCode.en]: "Also, there's a 6x6 sudoku grid in the middle of the chess board",
                [LanguageCode.ru]: "Кроме того, в центре шахматной доски есть поле судоку 6x6",
                [LanguageCode.de]: "Zusätzlich gibt es ein 6x6 Sudoku-Rätselgitter in der Mitte des Schachbretts",
            })}.
        </RulesParagraph>
        <RulesParagraph>
            <strong>{translate(almostNormalSudokuRulesApply)}</strong>: {translate(normalSudokuRulesForChessPieces)}. {translate({
            [LanguageCode.en]: <>For instance, there could be no other bishops (<strong>regardless of color</strong>) in the bottom-left box, in column <strong>f</strong> and in row <strong>3</strong></>,
            [LanguageCode.ru]: <>Например, в нижне-левом регионе, на линии <strong>f</strong> и на линии <strong>3</strong> не может быть других слонов (<strong>любого цвета</strong>)</>,
            [LanguageCode.de]: <>Beispielsweise dürfte kein weiterer Läufer (<strong>egal welcher Farbe</strong>) in die 2x3 Region unten links, in Spalte <strong>f</strong> oder in Zeile <strong>3</strong> positioniert werden</>,
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
                [LanguageCode.de]: "Außerhalb des Sudoku-Rätselgitters dürfen keine Schachfiguren positioniert werden",
            })}. {translate({
                [LanguageCode.en]: "The chess piece that moves to do the mate in one can't escape the sudoku grid either (while doing the move)",
                [LanguageCode.ru]: "Шахматная фигура, которая ходит для того, чтобы поставить мат в один ход, тоже не может выйти за пределы поля судоку для этого",
                [LanguageCode.de]: "Die Figur, die den Zug zur jeweiligen Gewinnstellung ausführt, darf den 6x6 Bereich in der Mitte ebenfalls niemals verlassen",
            })}. {translate({
                [LanguageCode.en]: "The kings can move outside the sudoku grid, though (it's not a mate if the king has a legal move outside the sudoku grid)",
                [LanguageCode.ru]: "Однако, короли могут выйти за пределы поля судоку (это не мат, если у короля есть ход за пределы поля судоку)",
                [LanguageCode.de]: "Der König kann als einzige Figur den 6x6 Bereich verlassen (solange der König also noch einen erlaubten Zug auf ein Feld außerhalb des 6x6 Bereichs machen kann, ist es kein Matt)",
            })}.
        </RulesParagraph>
    </>,
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize8,
    regions: Regions6.map((region) => region.map(({top, left}) => ({
        top: top + 1,
        left: left + 1,
    }))),
    fieldMargin: chessBoardIndexesMargin,
    initialDigits: chessInitialPiecesByCellNames({
        "g7": {color: ChessColor.black, type: ChessPieceType.king},
        "c5": {color: ChessColor.white, type: ChessPieceType.king},
        "c6": {color: ChessColor.white, type: ChessPieceType.bishop},
        "e3": {color: ChessColor.white, type: ChessPieceType.pawn},
        "e6": {color: ChessColor.black, type: ChessPieceType.queen},
        "f6": {color: ChessColor.black, type: ChessPieceType.pawn},
        "d5": {color: ChessColor.white, type: ChessPieceType.pawn},
        "e5": {color: ChessColor.black, type: ChessPieceType.bishop},
        "d3": {color: ChessColor.black, type: ChessPieceType.rook},
        "e4": {color: ChessColor.black, type: ChessPieceType.rook},
        "f3": {color: ChessColor.black, type: ChessPieceType.bishop},
        "c2": {color: ChessColor.black, type: ChessPieceType.pawn},
    }),
    items: [
        ChessBoardCellsBackgroundConstraint(),
        ChessBoardIndexesConstraint(),
        ValidChessPositionConstraint,
        {
            name: "no chess pieces outside",
            cells: [
                ...indexes(8).map((i) => ({top: 0, left: i})),
                ...indexes(8).map((i) => ({top: 7, left: i})),
                ...indexesFromTo(1, 7).map((i) => ({top: i, left: 0})),
                ...indexesFromTo(1, 7).map((i) => ({top: i, left: 7})),
            ],
            props: undefined,
            isObvious: true,
            isValidCell: () =>  false,
        },
    ],
    allowDrawing: allDrawingModes,
    resultChecker: (context) => isValidSolution(
        context,
        chessInitialPiecesByCellNames({
            "b7": {color: ChessColor.black, type: ChessPieceType.pawn},
            "c7": {color: ChessColor.white, type: ChessPieceType.rook},
            "d6": {color: ChessColor.black, type: ChessPieceType.knight},
            "f5": {color: ChessColor.white, type: ChessPieceType.queen},
            "g5": {color: ChessColor.white, type: ChessPieceType.knight},
            "f7": {color: ChessColor.white, type: ChessPieceType.knight},
            "b4": {color: ChessColor.white, type: ChessPieceType.bishop},
            "c4": {color: ChessColor.black, type: ChessPieceType.knight},
            "g2": {color: ChessColor.white, type: ChessPieceType.rook},
        })
    ),
};
