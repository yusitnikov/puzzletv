import { PuzzleDefinition } from "../../types/sudoku/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { TenInOneSudokuTypeManager } from "../../sudokuTypes/ten-in-one/types/TenInOneSudokuTypeManager";
import { createRegularGridSize } from "../../types/sudoku/GridSize";
import {
    KillerCageConstraint,
    KillerCageConstraintByRect,
} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import { KropkiDotConstraint } from "../../components/sudoku/constraints/kropki-dot/KropkiDot";
import { AnalyticalNinja, Raumplaner } from "../authors";
import { RulesParagraph } from "../../components/sudoku/rules/RulesParagraph";
import {
    arrowsExplained,
    arrowsTitle,
    blackKropkiDotsExplained,
    cannotRepeatInCage,
    canRepeatOnArrows,
    conventionalNotationsApply,
    germanWhispersExplained,
    germanWhispersTitle,
    killerCagesExplained,
    killerCagesTitle,
    kropkiDotsTitle,
    normalSudokuRulesApply,
    normalSudokuRulesDoNotApply,
    notAllDotsGiven,
    renbanExplained,
    renbanTitle,
    ruleWithTitle,
    parityLineTitle,
    sameParityLineExplained,
    twoDigitArrowCirclesExplained,
    whiteKropkiDotsExplained,
} from "../ruleSnippets";
import { RulesUnorderedList } from "../../components/sudoku/rules/RulesUnorderedList";
import React from "react";
import { tenInOneMultiBoxLineRules, tenInOneStage1Rules } from "../../sudokuTypes/ten-in-one/data/ruleSnippets";
import { isValidFinishedPuzzleByStageConstraints } from "../../sudokuTypes/multi-stage/types/MultiStageSudokuTypeManager";
import { RulesIndentedBlock } from "../../components/sudoku/rules/RulesIndentedBlock";
import { processTranslations, translate } from "../../utils/translate";
import { ArrowConstraint } from "../../components/sudoku/constraints/arrow/Arrow";
import { RenbanConstraint } from "../../components/sudoku/constraints/renban/Renban";
import { Constraint, toDecorativeConstraint, toInvisibleConstraint } from "../../types/sudoku/Constraint";
import { WhispersConstraint } from "../../components/sudoku/constraints/whispers/Whispers";
import { Position, PositionLiteral } from "../../types/layout/Position";
import { AmbiguousLineConstraint } from "../../components/sudoku/constraints/ambiguous-line/AmbiguousLine";
import { SameParityLineConstraint } from "../../components/sudoku/constraints/same-parity-line/SameParityLine";
import { peachColor } from "../../components/app/globals";
import { MultiStagePTM } from "../../sudokuTypes/multi-stage/types/MultiStagePTM";

const remainingBoxPositionIndexes = [0, 4, 8];
const keepDigitsAccordingBoxPositionText = {
    [LanguageCode.en]:
        "Keep the digit from stage 1 in each box that corresponds to their box position " +
        "(e.g. keep r1c1 in box 1, r5c9 in box 6, and r9c5 in box 8), clean up all other cells",
    [LanguageCode.ru]:
        "Из этапа 1 оставьте в каждом квадрате цифру, которая соответствует положению её квадрата " +
        "(например, оставьте r1c1 в квадрате 1, r5c9 в квадрате 6, и r9c5 в квадрате 8), очистите все остальные ячейки",
    [LanguageCode.de]:
        "Behalten Sie die Ziffer aus Stufe 1 in jedem Kästchen, das ihrer Kästchenposition entspricht " +
        "(z. B. behalten Sie r1c1 in Kästchen 1, r5c9 in Kästchen 6 und r9c5 in Kästchen 8) und bereinigen Sie alle anderen Zellen",
};
const keepDigitsAccordingBoxPositionCallback = ({ top, left }: Position) =>
    remainingBoxPositionIndexes.includes(top) && remainingBoxPositionIndexes.includes(left);

const gridSize = createRegularGridSize(9, 3);
const resultChecker = isValidFinishedPuzzleByStageConstraints<MultiStagePTM>(2);

export const AbstractKillerDots: PuzzleDefinition<MultiStagePTM> = {
    author: Raumplaner,
    title: {
        [LanguageCode.en]: "Abstract Killer Dots",
        [LanguageCode.ru]: "Абстрактные точки-клетки",
        [LanguageCode.de]: "Abstrakte Killerpunkte",
    },
    slug: "abstract-killer-dots",
    typeManager: TenInOneSudokuTypeManager(keepDigitsAccordingBoxPositionCallback),
    gridSize,
    rules: () => (
        <>
            <RulesParagraph>{translate(conventionalNotationsApply)}:</RulesParagraph>
            <RulesUnorderedList>
                <li>
                    {ruleWithTitle(
                        translate(killerCagesTitle),
                        translate(killerCagesExplained),
                        translate(cannotRepeatInCage),
                    )}
                    .
                </li>
                <li>
                    {ruleWithTitle(
                        translate(kropkiDotsTitle),
                        translate(whiteKropkiDotsExplained),
                        translate(blackKropkiDotsExplained),
                    )}
                    . {translate(notAllDotsGiven)}.
                </li>
            </RulesUnorderedList>
            <RulesParagraph>
                <strong>{translate("Stage %1").replace("%1", "1")}:</strong>
            </RulesParagraph>
            <RulesIndentedBlock>
                <RulesParagraph>{translate(normalSudokuRulesDoNotApply)}.</RulesParagraph>
                <RulesParagraph>{translate(tenInOneStage1Rules)}.</RulesParagraph>
            </RulesIndentedBlock>
            <RulesParagraph>
                <strong>{translate("Stage %1").replace("%1", "2")}:</strong>
            </RulesParagraph>
            <RulesIndentedBlock>
                <RulesParagraph>{translate(keepDigitsAccordingBoxPositionText)}.</RulesParagraph>
                <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            </RulesIndentedBlock>
            <RulesParagraph>
                {translate(
                    processTranslations(
                        (phrase, author) => phrase.replace("%1", author),
                        {
                            [LanguageCode.en]: "Many thanks to %1 for the help to make the 3x3 logic unique",
                            [LanguageCode.ru]: "Большое спасибо %1 за помощь в создании уникальной логики 3x3",
                            [LanguageCode.de]: "Vielen Dank an %1 für die Hilfe, die 3x3-Logik einzigartig zu machen",
                        },
                        AnalyticalNinja,
                    ),
                )}
                .
            </RulesParagraph>
        </>
    ),
    items: [
        KillerCageConstraintByRect("R1C4", 3, 1, 13),
        KillerCageConstraintByRect("R2C2", 1, 2, 7),
        KillerCageConstraintByRect("R2C3", 1, 2, 9),
        KillerCageConstraintByRect("R2C6", 1, 2, 9),
        KillerCageConstraintByRect("R4C1", 2, 1, 17),
        KillerCageConstraintByRect("R4C6", 1, 2, 9),
        KillerCageConstraintByRect("R4C7", 1, 2, 10),
        KillerCageConstraintByRect("R5C4", 1, 2, 11),
        KillerCageConstraintByRect("R5C8", 2, 1, 12),
        KillerCageConstraintByRect("R6C5", 2, 1, 10),
        KillerCageConstraintByRect("R7C9", 1, 3, 10),
        KillerCageConstraintByRect("R8C5", 1, 2, 17),
        KillerCageConstraintByRect("R9C1", 2, 1, 5),
        KillerCageConstraintByRect("R9C7", 2, 1, 9),

        KropkiDotConstraint("R1C5", "R1C6", false),
        KropkiDotConstraint("R1C7", "R2C7", false),
        KropkiDotConstraint("R2C7", "R2C8", true),
        KropkiDotConstraint("R2C7", "R3C7", false),
        KropkiDotConstraint("R3C1", "R3C2", true),
        KropkiDotConstraint("R3C5", "R3C6", true),
        KropkiDotConstraint("R3C8", "R3C9", true),
        KropkiDotConstraint("R4C5", "R4C6", false),
        KropkiDotConstraint("R4C7", "R4C8", true),
        KropkiDotConstraint("R4C5", "R5C5", false),
        KropkiDotConstraint("R5C1", "R5C2", false),
        KropkiDotConstraint("R5C2", "R6C2", false),
        KropkiDotConstraint("R6C7", "R6C8", true),
        KropkiDotConstraint("R7C1", "R7C2", false),
        KropkiDotConstraint("R7C2", "R7C3", false),
        KropkiDotConstraint("R7C1", "R8C1", true),
        KropkiDotConstraint("R7C3", "R8C3", false),
        KropkiDotConstraint("R7C4", "R8C4", true),
        KropkiDotConstraint("R8C7", "R8C8", false),
        KropkiDotConstraint("R8C6", "R9C6", true),
        KropkiDotConstraint("R8C7", "R9C7", true),
    ],
    resultChecker,
};

export const LegoHouse: PuzzleDefinition<MultiStagePTM> = {
    noIndex: true,
    author: AnalyticalNinja,
    title: {
        [LanguageCode.en]: "Lego House",
        [LanguageCode.ru]: "Лего-дом",
        [LanguageCode.de]: "Lego Haus",
    },
    slug: "lego-house",
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000AO9",
    getLmdSolutionCode: () => "716571791716983254",
    typeManager: TenInOneSudokuTypeManager(({ top, left }) => {
        const topBoxIndex = Math.floor(top / 3);
        const leftBoxIndex = Math.floor(left / 3);
        const boxIndex = topBoxIndex * 3 + leftBoxIndex;

        return boxIndex === top;
    }),
    gridSize,
    rules: () => (
        <>
            <RulesParagraph>{translate(conventionalNotationsApply)}:</RulesParagraph>
            <RulesUnorderedList>
                <li>
                    {ruleWithTitle(
                        translate(killerCagesTitle),
                        translate(killerCagesExplained),
                        translate(cannotRepeatInCage),
                    )}
                    .
                </li>
                <li>
                    {ruleWithTitle(translate(arrowsTitle), translate(arrowsExplained))}. {translate(canRepeatOnArrows)}.
                </li>
            </RulesUnorderedList>
            <RulesParagraph>
                <strong>{translate("Stage %1").replace("%1", "1")}:</strong>
            </RulesParagraph>
            <RulesIndentedBlock>
                <RulesParagraph>{translate(normalSudokuRulesDoNotApply)}.</RulesParagraph>
                <RulesParagraph>{translate(tenInOneStage1Rules)}.</RulesParagraph>
            </RulesIndentedBlock>
            <RulesParagraph>
                <strong>{translate("Stage %1").replace("%1", "2")}:</strong>
            </RulesParagraph>
            <RulesIndentedBlock>
                <RulesParagraph>
                    {translate({
                        [LanguageCode.en]:
                            "Erase all digits within the grid whose box number does not match their row number " +
                            "(e.g. you'll keep the digits in r4c1c2c3 within box 4)",
                        [LanguageCode.ru]:
                            "Сотрите все цифры на поле, номер квадрата которых не соответствует их номеру строки " +
                            "(например, вы сохраните цифры в r4c1c2c3 в квадрате 4)",
                        [LanguageCode.de]:
                            "Löschen Sie alle Ziffern im Raster, deren Boxnummer nicht mit ihrer Zeilennummer übereinstimmt " +
                            "(z. B. behalten Sie die Ziffern in r4c1c2c3 in Box 4)",
                    })}
                    .
                </RulesParagraph>
                <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            </RulesIndentedBlock>
        </>
    ),
    items: [
        ArrowConstraint("R1C2", ["R2C3", "R3C2"]),
        ArrowConstraint("R2C7", ["R1C7", "R3C9"]),
        ArrowConstraint("R3C4", ["R2C4", "R1C5"]),
        ArrowConstraint("R4C3", ["R5C3", "R5C2", "R4C1"]),
        ArrowConstraint("R4C9", ["R5C8", "R6C9"]),
        ArrowConstraint("R5C4", ["R5C6"]),
        ArrowConstraint("R8C4", ["R8C5", "R9C5", "R9C4"]),
        ArrowConstraint("R8C9", ["R9C8", "R8C7", "R7C7"]),
        ArrowConstraint("R9C3", ["R8C3", "R9C2"]),

        KillerCageConstraintByRect("R1C2", 1, 3, 16),
        KillerCageConstraintByRect("R2C4", 3, 1, 18),
        KillerCageConstraintByRect("R3C4", 2, 1, 15),
        KillerCageConstraintByRect("R3C7", 3, 1, 10),
        KillerCageConstraint(["R4C3", "R5C2", "R5C3"], 14),
        KillerCageConstraint(["R4C5", "R4C6", "R5C6"], 12),
        KillerCageConstraintByRect("R4C7", 2, 1, 7),
        KillerCageConstraintByRect("R5C4", 2, 1, 10),
        KillerCageConstraintByRect("R6C2", 2, 1, 10),
        KillerCageConstraintByRect("R6C8", 2, 1, 6),
        KillerCageConstraintByRect("R7C1", 3, 1, 14),
        KillerCageConstraintByRect("R8C1", 2, 1, 13),
        KillerCageConstraintByRect("R8C4", 2, 1, 8),
        KillerCageConstraintByRect("R9C8", 2, 1, 8),
    ],
    resultChecker,
};

export const DollHouse: PuzzleDefinition<MultiStagePTM> = {
    noIndex: true,
    author: AnalyticalNinja,
    title: {
        [LanguageCode.en]: "Doll House",
        [LanguageCode.ru]: "Кукольный дом",
        [LanguageCode.de]: "Puppenhaus",
    },
    slug: "doll-house",
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000AQX",
    getLmdSolutionCode: () => "936261819318276945",
    typeManager: TenInOneSudokuTypeManager(keepDigitsAccordingBoxPositionCallback),
    gridSize,
    rules: () => (
        <>
            <RulesParagraph>{translate(conventionalNotationsApply)}:</RulesParagraph>
            <RulesUnorderedList>
                <li>
                    {ruleWithTitle(translate(arrowsTitle), translate(arrowsExplained))}.{" "}
                    {translate(twoDigitArrowCirclesExplained)}. {translate(canRepeatOnArrows)}.
                </li>
                <li>{ruleWithTitle(translate(renbanTitle), translate(renbanExplained()))}.</li>
                <li>{ruleWithTitle(translate(germanWhispersTitle), translate(germanWhispersExplained()))}.</li>
            </RulesUnorderedList>
            <RulesParagraph>
                <strong>{translate("Stage %1").replace("%1", "1")}:</strong>
            </RulesParagraph>
            <RulesIndentedBlock>
                <RulesParagraph>{translate(normalSudokuRulesDoNotApply)}.</RulesParagraph>
                <RulesParagraph>{translate(tenInOneStage1Rules)}.</RulesParagraph>
                <RulesParagraph>{translate(tenInOneMultiBoxLineRules)}.</RulesParagraph>
            </RulesIndentedBlock>
            <RulesParagraph>
                <strong>{translate("Stage %1").replace("%1", "2")}:</strong>
            </RulesParagraph>
            <RulesIndentedBlock>
                <RulesParagraph>{translate(keepDigitsAccordingBoxPositionText)}.</RulesParagraph>
                <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            </RulesIndentedBlock>
        </>
    ),
    items: ({ stateExtension: { stage } }) => {
        let lines: Constraint<MultiStagePTM, any>[] = [
            RenbanConstraint(["R3C3", "R2C3", "R1C4", "R2C5"]),
            RenbanConstraint(["R5C6", "R6C6", "R6C7", "R5C8"]),
            WhispersConstraint(["R5C5", "R4C4", "R6C2", "R8C2", "R8C6"]),
        ];
        if (stage === 1) {
            // Make the line constraints decorative (UI-only)
            lines = lines.map(toDecorativeConstraint);

            // Add parts of the lines in each box separately
            lines.push(
                ...[
                    RenbanConstraint(["R3C3", "R2C3"]),
                    RenbanConstraint(["R1C4", "R2C5"]),
                    RenbanConstraint(["R5C6", "R6C6"]),
                    RenbanConstraint(["R6C7", "R5C8"]),
                    WhispersConstraint(["R5C5", "R4C4"]),
                    WhispersConstraint(["R5C3", "R6C2"]),
                    WhispersConstraint(["R7C2", "R8C2", "R8C3"]),
                    WhispersConstraint(["R8C4", "R8C6"]),
                ].map(toInvisibleConstraint),
            );
        }

        return [
            ...lines,

            // these lines are always in one box
            RenbanConstraint(["R4C1", "R4C2"]),
            RenbanConstraint(["R8C8", "R8C9"]),
            WhispersConstraint(["R3C8", "R3C9"]),

            ArrowConstraint(["R3C1", "R3C2"], ["R2C1", "R1C2"], true, "R3C1"),
            ArrowConstraint(["R1C5", "R1C6"], ["R1C4", "R3C6"], true, "R1C5"),
            ArrowConstraint("R1C9", ["R1C8", "R2C7"], true),
            ArrowConstraint("R3C8", ["R3C7", "R2C7"], true),
            ArrowConstraint("R4C3", ["R6C1"], true),
            ArrowConstraint("R6C4", ["R6C5", "R5C4", "R4C5"], true),
            ArrowConstraint(["R5C9", "R6C9"], ["R6C8", "R5C7"], true, "R6C9"),
            ArrowConstraint("R9C2", ["R9C1", "R7C3"], true),
            ArrowConstraint(["R9C5", "R9C6"], ["R9C4", "R7C6"], true, "R9C5"),
            ArrowConstraint(["R9C8", "R9C9"], ["R9C7", "R7C7"], true, "R9C8"),
        ];
    },
    resultChecker,
};

const MoodyLineConstraint = (cellLiterals: PositionLiteral[], visible = true) =>
    AmbiguousLineConstraint<MultiStagePTM>(
        cellLiterals,
        [RenbanConstraint, WhispersConstraint, SameParityLineConstraint],
        visible ? undefined : 0,
        peachColor,
    );

export const MoodyLines: PuzzleDefinition<MultiStagePTM> = {
    noIndex: true,
    author: AnalyticalNinja,
    title: {
        [LanguageCode.en]: "Moody Lines",
        [LanguageCode.ru]: "Капризные линии",
        [LanguageCode.de]: "Stimmungsvolle Linien",
    },
    slug: "moody-lines",
    typeManager: TenInOneSudokuTypeManager(keepDigitsAccordingBoxPositionCallback),
    gridSize,
    lmdLink: "https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000ASD",
    getLmdSolutionCode: () => "592648736742839615",
    rules: () => (
        <>
            <RulesParagraph>
                {translate(arrowsExplained)}. {translate(canRepeatOnArrows)}.
            </RulesParagraph>
            <RulesParagraph>{translate(killerCagesExplained)}.</RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Ambiguous lines, each line must be one of these types (at least)",
                    [LanguageCode.ru]:
                        "Неоднозначные линии, каждая линия должна быть одного из этих типов (как минимум)",
                    [LanguageCode.de]: "Mehrdeutige Zeilen, jede Zeile muss (mindestens) einer dieser Typen sein",
                })}
                :
            </RulesParagraph>
            <RulesUnorderedList>
                <li>{ruleWithTitle(translate(renbanTitle), translate(renbanExplained(true)))}.</li>
                <li>{ruleWithTitle(translate(germanWhispersTitle), translate(germanWhispersExplained(true)))}.</li>
                <li>{ruleWithTitle(translate(parityLineTitle), translate(sameParityLineExplained(true)))}.</li>
            </RulesUnorderedList>
            <RulesParagraph>
                <strong>{translate("Stage %1").replace("%1", "1")}:</strong>
            </RulesParagraph>
            <RulesIndentedBlock>
                <RulesParagraph>{translate(normalSudokuRulesDoNotApply)}.</RulesParagraph>
                <RulesParagraph>{translate(tenInOneStage1Rules)}.</RulesParagraph>
                <RulesParagraph>
                    {translate(tenInOneMultiBoxLineRules)} (
                    {translate({
                        [LanguageCode.en]:
                            "in this stage, line segments in different boxes can be different line types",
                        [LanguageCode.ru]:
                            "на этом этапе сегменты линий в разных квадратах могут быть линиями разных типов",
                        [LanguageCode.de]:
                            "in dieser Phase können Liniensegmente in verschiedenen Feldern unterschiedliche Linientypen sein",
                    })}
                    ).
                </RulesParagraph>
            </RulesIndentedBlock>
            <RulesParagraph>
                <strong>{translate("Stage %1").replace("%1", "2")}:</strong>
            </RulesParagraph>
            <RulesIndentedBlock>
                <RulesParagraph>{translate(keepDigitsAccordingBoxPositionText)}.</RulesParagraph>
                <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            </RulesIndentedBlock>
        </>
    ),
    items: ({ stateExtension: { stage } }) => {
        let lines = [
            MoodyLineConstraint(["R5C2", "R3C2", "R1C4", "R1C5", "R2C5"]),
            MoodyLineConstraint(["R4C6", "R7C3", "R8C3", "R8C4", "R9C5"]),
            MoodyLineConstraint(["R2C8", "R3C9", "R5C9", "R7C7", "R9C9"]),
        ];
        if (stage === 1) {
            // Make the line constraints decorative (UI-only)
            lines = lines.map((constraint) => ({
                ...constraint,
                isValidCell: undefined,
                isValidPuzzle: undefined,
            }));

            // Add parts of the lines in each box separately
            lines.push(
                MoodyLineConstraint(["R5C2", "R4C2"], false),
                MoodyLineConstraint(["R3C2", "R2C3"], false),
                MoodyLineConstraint(["R1C4", "R1C5", "R2C5"], false),
                MoodyLineConstraint(["R4C6", "R6C4"], false),
                MoodyLineConstraint(["R7C3", "R8C3"], false),
                MoodyLineConstraint(["R8C4", "R9C5"], false),
                MoodyLineConstraint(["R2C8", "R3C9"], false),
                MoodyLineConstraint(["R4C9", "R5C9", "R6C8"], false),
                MoodyLineConstraint(["R7C7", "R9C9"], false),
            );
        }

        return [
            ...lines,

            ArrowConstraint("R1C1", ["R2C1", "R2C2", "R3C3"], true),
            ArrowConstraint("R2C5", ["R3C5", "R2C4"], true),
            ArrowConstraint("R2C7", ["R3C8", "R2C9"], true),
            ArrowConstraint("R6C3", ["R4C1"], true),
            ArrowConstraint("R6C6", ["R5C6", "R6C5"], true),
            ArrowConstraint("R4C7", ["R6C7"], true),
            ArrowConstraint("R7C2", ["R8C2", "R9C3"], true),
            ArrowConstraint("R9C6", ["R8C6", "R8C5", "R9C5"], true),
            ArrowConstraint("R8C7", ["R9C7", "R9C8"], true),

            KillerCageConstraint(["R1C2", "R1C3", "R2C3"], 16),
            KillerCageConstraint(["R1C5", "R1C6", "R2C5"], 18),
            KillerCageConstraint(["R1C7", "R2C7", "R2C8"], 16),
            KillerCageConstraint(["R4C1", "R4C2"], 6),
            KillerCageConstraint(["R4C4", "R4C5"], 14),
            KillerCageConstraint(["R5C8", "R6C8"], 15),
            KillerCageConstraint(["R7C1", "R8C1"], 9),
            KillerCageConstraint(["R7C4", "R7C5"], 7),
            KillerCageConstraint(["R7C8", "R8C8"], 11),
        ];
    },
    allowDrawing: ["center-line", "center-mark"],
    resultChecker,
};
