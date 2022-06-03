import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {FieldSize8} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {withFieldLayer} from "../../contexts/FieldLayerContext";
import {FieldLayer} from "../../types/sudoku/FieldLayer";
import {CenteredText} from "../../components/svg/centered-text/CenteredText";
import {parsePositionLiteral, PositionLiteral} from "../../types/layout/Position";
import {ReactNode} from "react";
import {darkGreyColor} from "../../components/app/globals";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {ChessPieceCellData} from "../../sudokuTypes/chess/components/ChessPieceCellData";
import {ChessPieceType} from "../../sudokuTypes/chess/types/ChessPieceType";
import {ChessColor} from "../../sudokuTypes/chess/types/ChessColor";
import {gameStateGetCurrentFieldState, gameStateGetCurrentGivenDigits} from "../../types/sudoku/GameState";
import {areSameGivenDigitsMaps, mergeGivenDigitsMaps} from "../../types/sudoku/GivenDigitsMap";

interface MarkProps {
    cell: PositionLiteral;
    children: ReactNode;
}

const Mark = withFieldLayer(FieldLayer.regular, ({cell, children}: MarkProps) => {
    const {top, left} = parsePositionLiteral(cell);

    return <>
        <ChessPieceCellData
            top={top + 0.5}
            left={left + 0.5}
            data={{
                type: [1, 6].includes(top)
                    ? ChessPieceType.pawn
                    : [
                        ChessPieceType.rook,
                        ChessPieceType.knight,
                        ChessPieceType.bishop,
                        ChessPieceType.queen,
                        ChessPieceType.king,
                        ChessPieceType.bishop,
                        ChessPieceType.knight,
                        ChessPieceType.rook
                    ][left],
                color: top < 4 ? ChessColor.black : ChessColor.white,
            }}
            size={0.7}
            customColor={darkGreyColor}
        />
        <CenteredText
            top={top + 0.75}
            left={left + 0.8}
            size={0.4}
            fill={darkGreyColor}
        >
            {children}
        </CenteredText>
    </>;
});

export const RealChessPuzzleCJK: PuzzleDefinition<number> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Real Chess Sudoku",
        [LanguageCode.ru]: "Настоящий шахматный судоку",
    },
    author: {
        [LanguageCode.en]: "CJK",
    },
    slug: "real-chess-puzzle-cjk",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize8,
    initialDigits: {
        4: {
            3: 2,
            4: 1,
        }
    },
    items: [
        <Mark cell={"R1C1"}>5</Mark>,
        <Mark cell={"R1C2"}>5</Mark>,
        <Mark cell={"R1C3"}>6</Mark>,
        <Mark cell={"R1C4"}>3</Mark>,
        <Mark cell={"R1C5"}>3</Mark>,
        <Mark cell={"R1C6"}>7</Mark>,
        <Mark cell={"R1C7"}>1</Mark>,
        <Mark cell={"R1C8"}>3</Mark>,

        <Mark cell={"R2C1"}>1</Mark>,
        <Mark cell={"R2C2"}>4</Mark>,
        <Mark cell={"R2C3"}>6</Mark>,
        <Mark cell={"R2C4"}>3</Mark>,
        <Mark cell={"R2C5"}>7</Mark>,
        <Mark cell={"R2C6"}>6</Mark>,
        <Mark cell={"R2C7"}>1</Mark>,
        <Mark cell={"R2C8"}>5</Mark>,

        <Mark cell={"R7C1"}>5</Mark>,
        <Mark cell={"R7C2"}>8</Mark>,
        <Mark cell={"R7C3"}>7</Mark>,
        <Mark cell={"R7C4"}>5</Mark>,
        <Mark cell={"R7C5"}>2</Mark>,
        <Mark cell={"R7C6"}>5</Mark>,
        <Mark cell={"R7C7"}>7</Mark>,
        <Mark cell={"R7C8"}>7</Mark>,

        <Mark cell={"R8C1"}>6</Mark>,
        <Mark cell={"R8C2"}>8</Mark>,
        <Mark cell={"R8C3"}>5</Mark>,
        <Mark cell={"R8C4"}>3</Mark>,
        <Mark cell={"R8C5"}>3</Mark>,
        <Mark cell={"R8C6"}>4</Mark>,
        <Mark cell={"R8C7"}>8</Mark>,
        <Mark cell={"R8C8"}>6</Mark>,
    ],
    rules: () => <>
        <RulesParagraph>
            Right now we are in the middle of a game of chess.
            There have been made some moves by the standard chess rules, but neither a capture nor a castling appeared yet.
            Also, every piece has been moved at most once.
        </RulesParagraph>
        <RulesParagraph>
            Every piece carries a digit from 1 to 8, which wants to be written in the current cell of the figure.
            It is even possible to fill the whole grid with digits from 1 to 8, such that every digit appears in every row, column and box exactly once!
        </RulesParagraph>
        <RulesParagraph>
            Can you discover the current chess position and solve the sudoku?
        </RulesParagraph>
    </>,
    resultChecker: ({puzzle, state}) => areSameGivenDigitsMaps(
        puzzle.typeManager,
        mergeGivenDigitsMaps(puzzle.initialDigits!, gameStateGetCurrentGivenDigits(state)),
        {
            0: {
                0: 8,
                1: 5,
                2: 3,
                3: 1,
                4: 6,
                5: 7,
                6: 2,
                7: 4,
            },
            1: {
                0: 7,
                1: 2,
                2: 6,
                3: 4,
                4: 8,
                5: 3,
                6: 1,
                7: 5,
            },
            2: {
                0: 2,
                1: 6,
                2: 5,
                3: 7,
                4: 4,
                5: 1,
                6: 3,
                7: 8,
            },
            3: {
                0: 1,
                1: 4,
                2: 8,
                3: 3,
                4: 7,
                5: 6,
                6: 5,
                7: 2,
            },
            4: {
                0: 4,
                1: 8,
                2: 7,
                3: 2,
                4: 1,
                5: 5,
                6: 6,
                7: 3,
            },
            5: {
                0: 6,
                1: 3,
                2: 1,
                3: 5,
                4: 2,
                5: 8,
                6: 4,
                7: 7,
            },
            6: {
                0: 5,
                1: 1,
                2: 4,
                3: 8,
                4: 3,
                5: 2,
                6: 7,
                7: 6,
            },
            7: {
                0: 3,
                1: 7,
                2: 2,
                3: 6,
                4: 5,
                5: 4,
                6: 8,
                7: 1,
            },
        }
    ),
    getLmdSolutionCode: (puzzle, state) => {
        const {cells} = gameStateGetCurrentFieldState(state);

        return cells.map(row => row[0].usersDigit).join("") + cells[5].map(cell => cell.usersDigit).join("");
    }
};
