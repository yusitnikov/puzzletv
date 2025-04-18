import { PuzzleDefinition } from "../../types/sudoku/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { RulesParagraph } from "../../components/sudoku/rules/RulesParagraph";
import { isValidFinishedPuzzleByConstraints } from "../../types/sudoku/Constraint";
import { createCubeFieldSize, createCubeRegions, CubeTypeManager } from "../../sudokuTypes/cube/types/CubeTypeManager";
import { Chameleon } from "../authors";
import { HeartConstraint, KropkiDotConstraint } from "../../components/sudoku/constraints/kropki-dot/KropkiDot";
import { NonRatioNeighborsConstraint } from "../../components/sudoku/constraints/consecutive-neighbors/ConsecutiveNeighbors";
import { blackKropkiDotsExplained, ratioDotsExplained } from "../ruleSnippets";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";
import { greenColor } from "../../components/app/globals";
import { translate } from "../../utils/translate";

export const HeartsCube = (showRatio: boolean): PuzzleDefinition<NumberPTM> => ({
    noIndex: showRatio,
    title: {
        [LanguageCode.en]: "Rational Cube",
        [LanguageCode.ru]: "Рациональный куб",
        [LanguageCode.de]: "Rationaler Würfel",
    },
    author: Chameleon,
    slug: showRatio ? "rational-cube-show-ratio" : "rational-cube",
    typeManager: CubeTypeManager(true),
    fieldSize: createCubeFieldSize(3),
    regions: createCubeRegions(3, 3, 3),
    digitsCount: 9,
    rules: () => (
        <>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Put digits from 1 to 9 into every cell of all cube faces",
                    [LanguageCode.ru]: "Поместите цифры от 1 до 9 в каждую ячейку всех граней куба",
                    [LanguageCode.de]: "Tragen Sie Ziffern von 1 bis 9 in jede Zelle aller Würfelflächen ein",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Digits cannot repeat in a row, column or 3x3 box (face of the cube)",
                    [LanguageCode.ru]: "Цифры не могут повторяться в строках, столбцах и регионах 3х3 (гранях куба)",
                    [LanguageCode.de]:
                        "Ziffern können sich in einer Zeile, Spalte oder einem 3x3-Feld (Seite des Würfels) nicht wiederholen.",
                })}
                .{" "}
                {translate({
                    [LanguageCode.en]:
                        '"Rows" and "columns" are 6 cells long - they extend across the edge and take 2 faces of the cube',
                    [LanguageCode.ru]:
                        '"Строки" и "столбцы" имеют длину 6 клеток - они проходят через ребро и занимают 2 грани куба',
                    [LanguageCode.de]:
                        '"Zeilen" und "Spalten" sind 6 Zellen lang – sie erstrecken sich über die Kante und nehmen 2 Seiten des Würfels ein',
                })}
                .
            </RulesParagraph>
            <RulesParagraph>{translate(blackKropkiDotsExplained)}.</RulesParagraph>
            <RulesParagraph>
                {translate(
                    ratioDotsExplained(
                        {
                            [LanguageCode.en]: "green",
                            [LanguageCode.ru]: "зелёной",
                            [LanguageCode.de]: "grünen",
                        },
                        "1:3",
                    ),
                )}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate(
                    ratioDotsExplained(
                        {
                            [LanguageCode.en]: "red",
                            [LanguageCode.ru]: "красной",
                            [LanguageCode.de]: "roten",
                        },
                        "2:3",
                    ),
                )}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "All black, green and red dots are given",
                    [LanguageCode.ru]: "Все чёрные, зелёные и красные точки даны",
                    [LanguageCode.de]: "Alle schwarzen, grünen und roten Punkte sind gegeben",
                })}
                .
            </RulesParagraph>
        </>
    ),
    initialDigits: { 2: { 2: 5 } },
    items: [
        HeartConstraint("R1C3", "R2C3", showRatio),
        HeartConstraint("R6C2", "R6C3", showRatio),
        HeartConstraint("R6C3", "R6C4", showRatio),
        KropkiDotConstraint("R5C6", "R6C6", true, [1, 3], greenColor, showRatio),
        KropkiDotConstraint("R3C1", "R4C1", true, [1, 2], undefined, showRatio),
        KropkiDotConstraint("R4C1", "R4C2", true, [1, 2], undefined, showRatio),
        NonRatioNeighborsConstraint([
            [1, 2],
            [1, 3],
            [2, 3],
        ]),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000AJY",
    getLmdSolutionCode: (context) => {
        return [
            context.getCellDigit(3, 0),
            context.getCellDigit(3, 1),
            context.getCellDigit(3, 2),
            context.getCellDigit(4, 0),
            context.getCellDigit(4, 1),
            context.getCellDigit(4, 2),
            context.getCellDigit(5, 0),
            context.getCellDigit(5, 1),
            context.getCellDigit(5, 2),
        ].join("");
    },
});
