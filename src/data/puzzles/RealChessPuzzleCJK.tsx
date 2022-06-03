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

interface MarkProps {
    cell: PositionLiteral;
    children: ReactNode;
}

const Mark = withFieldLayer(FieldLayer.regular, ({cell, children}: MarkProps) => {
    const {top, left} = parsePositionLiteral(cell);

    return <CenteredText
        top={top + 0.5}
        left={left + 0.5}
        size={0.4}
        fill={darkGreyColor}
    >
        {children}
    </CenteredText>;
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
};
