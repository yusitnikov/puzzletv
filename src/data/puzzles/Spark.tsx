import { allDrawingModes, PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { isValidFinishedPuzzleByConstraints, toDecorativeConstraint } from "../../types/puzzle/Constraint";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import {
    blackKropkiDotsExplained,
    kropkiDotsTitle,
    notAllDotsGiven,
    notAllXVGiven,
    renbanExplained,
    renbanTitle,
    ruleWithTitle,
    vExplained,
    whiteKropkiDotsExplained,
    xExplained,
} from "../ruleSnippets";
import {
    createSparkGridSize,
    createSparkRegions,
    SparkTypeManager,
} from "../../puzzleTypes/spark/types/SparkTypeManager";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { KropkiDotConstraint } from "../../components/puzzle/constraints/kropki-dot/KropkiDot";
import { VMarkConstraint, XMarkConstraint } from "../../components/puzzle/constraints/xv/XV";
import { RegionConstraint } from "../../components/puzzle/constraints/region/Region";
import { RectConstraint } from "../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { darkGreyColor } from "../../components/app/globals";
import { GridLayer } from "../../types/puzzle/GridLayer";
import { rgba } from "../../utils/color";
import { SparkGridArrowsConstraint } from "../../puzzleTypes/spark/components/SparkGridArrows";
import { RenbanConstraint } from "../../components/puzzle/constraints/renban/Renban";
import { translate } from "../../utils/translate";
import { Chameleon } from "../authors";

const extraRegion = ["R1C1", "R3C1", "R1C8", "R2C7", "R8C1", "R1C13", "R3C13", "R8C13"];
const gridSize = createSparkGridSize(4, 2);
export const SparkKropki: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Spark Kropki XV",
    },
    author: {
        [LanguageCode.en]: "Fit for Puzzle",
    },
    slug: "spark-kropki-xv",
    typeManager: SparkTypeManager,
    gridSize,
    regions: createSparkRegions(gridSize),
    digitsCount: 8,
    rules: () => (
        <>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Fill every row/column (arrow direction) and bolded region with digits 1 to 8",
                    [LanguageCode.ru]:
                        "Заполните каждую строку/столбец (по направление стрелки) и выделенную жирными линиями область цифрами от 1 до 8",
                    [LanguageCode.de]:
                        "Füllen Sie jede Zeile/Spalte (entsprechend der Pfeilrichtung) und den fettgedruckten Bereich mit den Ziffern 1 bis 8",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Shaded cells must have digits 1-8",
                    [LanguageCode.ru]: "Подсвеченные ячейки должны содержать цифры 1-8",
                    [LanguageCode.de]: "Schattierte Zellen müssen die Ziffern 1-8 enthalten",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {ruleWithTitle("XV", translate(xExplained), translate(vExplained))}. {translate(notAllXVGiven)}.
            </RulesParagraph>
            <RulesParagraph>
                {ruleWithTitle(
                    translate(kropkiDotsTitle),
                    translate(blackKropkiDotsExplained),
                    translate(whiteKropkiDotsExplained),
                )}
                . {translate(notAllDotsGiven)}.
            </RulesParagraph>
        </>
    ),
    items: [
        ...SparkGridArrowsConstraint(gridSize),

        KropkiDotConstraint("R1C1", "R2C1", true),
        KropkiDotConstraint("R2C2", "R2C3", true),
        KropkiDotConstraint("R2C3", "R3C3", true),
        KropkiDotConstraint("R3C4", "R3C5", true),
        KropkiDotConstraint("R2C5", "R3C5", true),
        KropkiDotConstraint("R3C5", "R4C5", true),
        KropkiDotConstraint("R1C8", "R2C8", true),
        KropkiDotConstraint("R3C10", "R4C10", true),
        KropkiDotConstraint("R2C11", "R3C11", true),
        KropkiDotConstraint("R3C11", "R3C12", true),
        KropkiDotConstraint("R3C12", "R3C13", true),
        KropkiDotConstraint("R5C2", "R6C2", true),
        KropkiDotConstraint("R6C1", "R7C1", true),
        KropkiDotConstraint("R6C4", "R7C4", true),
        KropkiDotConstraint("R7C10", "R8C10", true),
        KropkiDotConstraint("R6C11", "R7C11", true),

        KropkiDotConstraint("R1C2", "R2C2", false),
        KropkiDotConstraint("R1C3", "R1C4", false),
        KropkiDotConstraint("R3C1", "R4C1", false),
        KropkiDotConstraint("R2C4", "R3C4", false),
        KropkiDotConstraint("R4C2", "R4C3", false),
        KropkiDotConstraint("R4C3", "R4C4", false),
        KropkiDotConstraint("R2C5", "R2C6", false),
        KropkiDotConstraint("R1C7", "R2C7", false),
        KropkiDotConstraint("R3C5", "R3C6", false),
        KropkiDotConstraint("R3C6", "R4C6", false),
        KropkiDotConstraint("R1C10", "R2C10", false),
        KropkiDotConstraint("R1C11", "R2C11", false),
        KropkiDotConstraint("R2C11", "R2C12", false),
        KropkiDotConstraint("R2C12", "R3C12", false),
        KropkiDotConstraint("R3C11", "R4C11", false),
        KropkiDotConstraint("R4C12", "R5C12", false),
        KropkiDotConstraint("R4C13", "R5C13", false),
        KropkiDotConstraint("R7C11", "R8C11", false),
        KropkiDotConstraint("R5C1", "R6C1", false),
        KropkiDotConstraint("R7C2", "R8C2", false),
        KropkiDotConstraint("R7C3", "R7C4", false),

        XMarkConstraint("R2C1", "R2C2"),
        XMarkConstraint("R3C3", "R4C3"),
        XMarkConstraint("R1C4", "R1C5"),
        XMarkConstraint("R1C7", "R1C8"),
        XMarkConstraint("R3C8", "R4C8"),
        XMarkConstraint("R5C3", "R5C4"),
        XMarkConstraint("R6C1", "R6C2"),
        XMarkConstraint("R7C1", "R7C2"),
        XMarkConstraint("R7C4", "R8C4"),
        XMarkConstraint("R2C10", "R3C10"),
        XMarkConstraint("R2C13", "R3C13"),
        XMarkConstraint("R5C12", "R5C13"),
        XMarkConstraint("R6C12", "R7C12"),

        VMarkConstraint("R4C2", "R5C2"),
        VMarkConstraint("R6C2", "R6C3"),
        VMarkConstraint("R2C8", "R3C8"),
        VMarkConstraint("R3C10", "R3C11"),
        VMarkConstraint("R2C12", "R2C13"),
        VMarkConstraint("R6C11", "R6C12"),

        RegionConstraint(extraRegion, false, "extra region"),
        ...extraRegion.map((cell) =>
            RectConstraint(
                [cell],
                1,
                rgba(darkGreyColor, 0.6),
                undefined,
                0,
                undefined,
                undefined,
                0,
                GridLayer.beforeSelection,
            ),
        ),

        // Constraints that go through a distant grid border
        { ...KropkiDotConstraint("R4C6", "R3C10", true), component: undefined },
        toDecorativeConstraint(KropkiDotConstraint("R4C6", "R5C6", true)),
        toDecorativeConstraint(KropkiDotConstraint("R3C9", "R3C10", true)),
        { ...KropkiDotConstraint("R7C4", "R7C10", true), component: undefined },
        toDecorativeConstraint(KropkiDotConstraint("R7C4", "R7C5", true)),
        toDecorativeConstraint(KropkiDotConstraint("R7C9", "R7C10", true)),
        { ...KropkiDotConstraint("R4C8", "R1C10", false), component: undefined },
        toDecorativeConstraint(KropkiDotConstraint("R4C8", "R5C8", false)),
        toDecorativeConstraint(KropkiDotConstraint("R1C9", "R1C10", false)),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
};

export const EmptySpark: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Empty spark",
    },
    slug: "empty-spark",
    typeManager: SparkTypeManager,
    gridSize,
    regions: createSparkRegions(gridSize),
    digitsCount: 8,
    rules: () => (
        <>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Fill every row/column (arrow direction) and bolded region with digits 1 to 8",
                    [LanguageCode.ru]:
                        "Заполните каждую строку/столбец (по направление стрелки) и выделенную жирными линиями область цифрами от 1 до 8",
                    [LanguageCode.de]:
                        "Füllen Sie jede Zeile/Spalte (entsprechend der Pfeilrichtung) und den fettgedruckten Bereich mit den Ziffern 1 bis 8",
                })}
                .
            </RulesParagraph>
        </>
    ),
    items: [...SparkGridArrowsConstraint(gridSize)],
    allowDrawing: allDrawingModes,
};

const gridSize6x6 = createSparkGridSize(3, 3, 3);
export const EmptySpark6x6: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Empty spark 6x6",
    },
    slug: "empty-spark-6x6",
    typeManager: SparkTypeManager,
    gridSize: gridSize6x6,
    regions: createSparkRegions(gridSize6x6),
    digitsCount: 9,
    rules: () => (
        <>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Fill every row/column (arrow direction) and bolded region with digits 1 to 9",
                    [LanguageCode.ru]:
                        "Заполните каждую строку/столбец (по направление стрелки) и выделенную жирными линиями область цифрами от 1 до 9",
                    [LanguageCode.de]:
                        "Füllen Sie jede Zeile/Spalte (entsprechend der Pfeilrichtung) und den fettgedruckten Bereich mit den Ziffern 1 bis 9",
                })}
                .
            </RulesParagraph>
        </>
    ),
    items: [...SparkGridArrowsConstraint(gridSize6x6)],
    allowDrawing: allDrawingModes,
};

const gridSizeWithNote = createSparkGridSize(4, 2, 4, true);

export const Sparkster: PuzzleDefinition<NumberPTM> = {
    title: {
        [LanguageCode.en]: "Sparkster",
    },
    author: Chameleon,
    slug: "sparkster",
    saveStateKey: "sparkster-notes",
    typeManager: SparkTypeManager,
    gridSize: gridSizeWithNote,
    regions: createSparkRegions(gridSizeWithNote),
    digitsCount: 8,
    rules: () => (
        <>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Fill every row/column (arrow direction) and bolded region with digits 1 to 8",
                    [LanguageCode.ru]:
                        "Заполните каждую строку/столбец (по направление стрелки) и выделенную жирными линиями область цифрами от 1 до 8",
                    [LanguageCode.de]:
                        "Füllen Sie jede Zeile/Spalte (entsprechend der Pfeilrichtung) und den fettgedruckten Bereich mit den Ziffern 1 bis 8",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>{ruleWithTitle(translate(renbanTitle), translate(renbanExplained()))}.</RulesParagraph>
            <RulesParagraph>
                {ruleWithTitle("XV", translate(xExplained))}. {translate(notAllXVGiven)}.
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "8 empty cells in the bottom are for note-taking",
                    [LanguageCode.ru]: "8 пустых клеток внизу - для заметок",
                    [LanguageCode.de]: "8 leere Zellen unten dienen zum Notieren",
                })}
                .
            </RulesParagraph>
        </>
    ),
    items: [
        ...SparkGridArrowsConstraint(gridSizeWithNote),
        RenbanConstraint(["R2C4", "R2C3", "R3C2", "R6C2", "R7C3", "R7C4"]),
        RenbanConstraint(["R2C10", "R2C11", "R3C12", "R6C12", "R7C11", "R7C10"]),
        RenbanConstraint(["R1C7", "R2C8"]),
        RenbanConstraint(["R2C7", "R3C8"]),
        RenbanConstraint(["R2C6", "R4C8"]),
        RenbanConstraint(["R5C3", "R6C3"]),
        RenbanConstraint(["R5C4", "R6C4", "R6C10"]),
        RenbanConstraint(["R5C11", "R6C11"]),
        RenbanConstraint(["R6C1", "R7C1", "R8C2", "R8C3"]),
        RenbanConstraint(["R6C13", "R7C12"]),
        RenbanConstraint(["R1C12", "R2C13", "R3C13"]),

        {
            ...RenbanConstraint(["R1C3", "R1C4", "R2C5", "R3C5", "R4C6", "R4C7", "R1C10", "R1C11"], false),
            component: undefined,
        },
        toDecorativeConstraint(RenbanConstraint(["R1C3", "R1C4", "R2C5", "R3C5", "R4C6", "R4C7", "R5C8"])),
        toDecorativeConstraint(RenbanConstraint(["R1.7C9.3", "R1C10", "R1C11"], false)),

        {
            ...RenbanConstraint(["R4C3", "R3C3", "R3C4", "R4C4", "R4C10", "R3C10", "R3C11", "R4C11"], false),
            component: undefined,
        },
        toDecorativeConstraint(RenbanConstraint(["R4C3", "R3C3", "R3C4", "R4C4", "R4.5C4.5", "R5C5"], false)),
        toDecorativeConstraint(RenbanConstraint(["R5C9", "R4.5C9.5", "R4C10", "R3C10", "R3C11", "R4C11"], false)),

        {
            ...XMarkConstraint("R8C4", "R8C10"),
            component: undefined,
        },
        toDecorativeConstraint(XMarkConstraint("R8C4", "R8C5")),
        toDecorativeConstraint(XMarkConstraint("R8C9", "R8C10")),
    ],
    allowDrawing: ["center-mark"],
    resultChecker: isValidFinishedPuzzleByConstraints,
};
