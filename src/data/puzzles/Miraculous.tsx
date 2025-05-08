import { allDrawingModes, PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { GridSize9 } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { CellColor, CellColorValue } from "../../types/puzzle/CellColor";
import { ThermometerConstraint } from "../../components/puzzle/constraints/thermometer/Thermometer";
import { KropkiDotConstraint } from "../../components/puzzle/constraints/kropki-dot/KropkiDot";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import {
    blackKropkiDotsExplained,
    chaosConstructionRulesApply,
    moveButtonTip,
    normalSudokuRulesApply,
    notAllDotsGiven,
    thermometersExplained,
    toroidalRulesApply,
} from "../ruleSnippets";
import { AutoRegionConstraint } from "../../components/puzzle/constraints/auto-region/AutoRegion";
import { Constraint, isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import { CellsMap, processCellsMaps } from "../../types/puzzle/CellsMap";
import { ConsecutiveNeighborsConstraint } from "../../components/puzzle/constraints/consecutive-neighbors/ConsecutiveNeighbors";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { translate } from "../../utils/translate";

const initialColors: CellsMap<CellColorValue> = {
    1: {
        8: CellColor.darkGrey,
    },
    3: {
        3: CellColor.blue,
        4: CellColor.green,
        8: CellColor.lightGrey,
    },
    4: {
        4: CellColor.darkGrey,
        5: CellColor.orange,
    },
    5: {
        5: CellColor.lightGrey,
        6: CellColor.purple,
        8: CellColor.yellow,
    },
    6: {
        6: CellColor.yellow,
        7: CellColor.red,
    },
    8: {
        0: CellColor.green,
        2: CellColor.orange,
        4: CellColor.purple,
        6: CellColor.red,
        8: CellColor.blue,
    },
};

const SameColorRegionConstraint: Constraint<NumberPTM> = {
    name: "same color regions",
    cells: Object.entries(initialColors).flatMap(([top, row]) =>
        Object.keys(row).map((left) => ({
            top: Number(top),
            left: Number(left),
        })),
    ),
    props: undefined,
    isValidCell(cell, _digits, _cells, context) {
        const color = initialColors[cell.top][cell.left];

        const region = context.puzzleIndex.getCustomRegionByBorderLinesAt(context, cell);

        return region.filter(({ top, left }) => initialColors[top]?.[left] === color).length === 2;
    },
};

export const Miraculous: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    slug: "miraculous",
    saveStateKey: "miraculous-v2",
    title: {
        [LanguageCode.en]: "Miraculous",
    },
    author: {
        [LanguageCode.en]: "Smank, Raumplaner and Uklusi",
        [LanguageCode.ru]: "Smank, Raumplaner и Uklusi",
        [LanguageCode.de]: "Smank, Raumplaner und Uklusi",
    },
    rules: () => (
        <>
            <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            <RulesParagraph>{translate(chaosConstructionRulesApply)}.</RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Cells highlighted the same color share a region",
                    [LanguageCode.ru]: "Ячейки, выделенные одним цветом, принадлежат одной общей области",
                    [LanguageCode.de]: "Die eingefärbten Zellen gleicher Farbe gehören dabei jeweils zur selben Region",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]:
                        "All digits must be consecutive to their adjacent neighbours. For the purpose of this rule 1 and 9 are consecutive",
                    [LanguageCode.ru]:
                        "Соседние ячейки содержат последовательные цифры (различающиеся на 1). Для этого правила, 1 и 9 считаются последовательными",
                    [LanguageCode.de]:
                        "Alle im Gitter direkt benachbarten Zahlen müssen jeweils aufeinanderfolgend sein. Zu diesem Zweck gelten die Ziffern 1 und 9 als aufeinanderfolgend",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate(toroidalRulesApply)}. {translate(moveButtonTip)}.
            </RulesParagraph>
            <RulesParagraph>
                {translate(blackKropkiDotsExplained)}. {translate(notAllDotsGiven)}.
            </RulesParagraph>
            <RulesParagraph>{translate(thermometersExplained)}.</RulesParagraph>
        </>
    ),
    typeManager: DigitPuzzleTypeManager(),
    gridSize: GridSize9,
    initialColors: processCellsMaps((colors) => colors, [initialColors]),
    items: [
        ThermometerConstraint(["R5C2", "R4C1"]),
        KropkiDotConstraint("R1C7", "R1C8", true),
        ConsecutiveNeighborsConstraint(true),
        SameColorRegionConstraint,
        AutoRegionConstraint(),
    ],
    allowDrawing: allDrawingModes,
    disableDiagonalBorderLines: true,
    loopHorizontally: true,
    loopVertically: true,
    gridMargin: 0.99,
    resultChecker: isValidFinishedPuzzleByConstraints,
};
