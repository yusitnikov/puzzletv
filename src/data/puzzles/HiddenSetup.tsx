import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import {
    arrowsExplained,
    arrowsTitle,
    cannotRepeatInCage,
    conventionalNotationsApply,
    evenExplained,
    evenTitle,
    inBetweenLineExplained,
    inBetweenLineTitle,
    killerCagesExplained,
    killerCagesTitle,
    normalSudokuRulesApply,
    renbanExplained,
    renbanTitle,
    ruleWithTitle,
} from "../ruleSnippets";
import { KillerCageConstraintByRect } from "../../components/puzzle/constraints/killer-cage/KillerCage";
import { RenbanConstraint } from "../../components/puzzle/constraints/renban/Renban";
import { BetweenLineConstraint } from "../../components/puzzle/constraints/between-line/BetweenLine";
import { EvenConstraint } from "../../components/puzzle/constraints/even/Even";
import { CellsMap } from "../../types/puzzle/CellsMap";
import { ArrowConstraint } from "../../components/puzzle/constraints/arrow/Arrow";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";
import React from "react";
import { CellHighlightColor, CellHighlightByDataProps } from "../../components/puzzle/cell/CellHighlight";
import { Raumplaner } from "../authors";
import {
    isValidFinishedPuzzleByStageConstraints,
    MultiStageTypeManager,
} from "../../puzzleTypes/multi-stage/types/MultiStageTypeManager";
import { PuzzleContext } from "../../types/puzzle/PuzzleContext";
import { Constraint } from "../../types/puzzle/Constraint";
import { MultiStagePTM } from "../../puzzleTypes/multi-stage/types/MultiStagePTM";
import { translate } from "../../utils/translate";

const getStageCellsMap = (stage: number): CellsMap<boolean> => {
    switch (stage) {
        case 1:
            return {
                3: {
                    3: true,
                    4: true,
                },
                5: {
                    4: true,
                    5: true,
                },
            };
        case 2:
            return {
                2: {
                    4: true,
                },
                4: {
                    2: true,
                    4: true,
                    6: true,
                },
                6: {
                    4: true,
                },
            };
        case 3:
            return {
                0: {
                    0: true,
                    4: true,
                    8: true,
                },
                8: {
                    0: true,
                    4: true,
                    8: true,
                },
            };
        case 4:
            return {
                0: {
                    6: true,
                    7: true,
                },
                4: {
                    0: true,
                    1: true,
                    7: true,
                    8: true,
                },
                8: {
                    1: true,
                    2: true,
                },
            };
    }

    return {};
};

const getStage = (context: PuzzleContext<MultiStagePTM>) => {
    if (
        context.getCellDigit(3, 3) !== 8 ||
        context.getCellDigit(3, 4) !== 1 ||
        context.getCellDigit(5, 4) !== 9 ||
        context.getCellDigit(5, 5) !== 2
    ) {
        return 1;
    }

    if (
        context.getCellDigit(2, 4) !== 5 ||
        context.getCellDigit(4, 2) !== 1 ||
        context.getCellDigit(4, 4) !== 4 ||
        context.getCellDigit(4, 6) !== 9 ||
        context.getCellDigit(6, 4) !== 7
    ) {
        return 2;
    }

    if (
        context.getCellDigit(0, 0) !== 6 ||
        context.getCellDigit(0, 4) !== 2 ||
        context.getCellDigit(0, 8) !== 8 ||
        context.getCellDigit(8, 0) !== 4 ||
        context.getCellDigit(8, 4) !== 8 ||
        context.getCellDigit(8, 8) !== 6
    ) {
        return 3;
    }

    if (
        context.getCellDigit(0, 6) !== 3 ||
        context.getCellDigit(0, 7) !== 7 ||
        context.getCellDigit(4, 0) !== 2 ||
        context.getCellDigit(4, 1) !== 5 ||
        context.getCellDigit(4, 7) !== 8 ||
        context.getCellDigit(4, 8) !== 7 ||
        context.getCellDigit(8, 1) !== 7 ||
        context.getCellDigit(8, 2) !== 9
    ) {
        return 4;
    }

    return 5;
};

export const HiddenSetup: PuzzleDefinition<MultiStagePTM> = {
    extension: {},
    author: Raumplaner,
    title: {
        [LanguageCode.en]: "Hidden Setup",
        [LanguageCode.ru]: "Скрытая установка",
        [LanguageCode.de]: "Verstecktes Setup",
    },
    slug: "hidden-setup",
    saveStateKey: "hidden-setup-v2",
    typeManager: {
        ...MultiStageTypeManager({ getStage }),
        getCellHighlight(
            { top, left },
            { stateExtension: { stage } },
        ): Required<Pick<CellHighlightByDataProps<MultiStagePTM>, "color" | "strokeWidth">> | undefined {
            const colors = getStageCellsMap(stage);

            return colors[top]?.[left] === undefined
                ? undefined
                : {
                      color: CellHighlightColor.secondary,
                      strokeWidth: 1,
                  };
        },
    },
    gridSize: GridSize9,
    regions: Regions9,
    rules: ({ stateExtension: { stage } }) => {
        return (
            <>
                <RulesParagraph>
                    {translate({
                        [LanguageCode.en]: "This puzzle does reveal its clues in stages",
                        [LanguageCode.ru]: "Этот судоку раскрывает свои подсказки поэтапно",
                        [LanguageCode.de]: "Dieses Rätsel enthüllt seine Hinweise schrittweise",
                    })}
                    .
                </RulesParagraph>
                <RulesParagraph>
                    {translate({
                        [LanguageCode.en]:
                            "Enter the correct digits into the highlighted cells to proceed to the next stage of the puzzle",
                        [LanguageCode.ru]:
                            "Введите правильные цифры в выделенные ячейки, чтобы перейти к следующему этапу",
                        [LanguageCode.de]:
                            "Geben Sie die richtigen Ziffern in die hervorgehobenen Zellen ein, um mit der nächsten Stufe des Rätsels fortzufahren",
                    })}
                    .
                </RulesParagraph>
                <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
                <RulesParagraph>{translate(conventionalNotationsApply)}:</RulesParagraph>
                <RulesUnorderedList>
                    <li>{ruleWithTitle(translate(evenTitle), translate(evenExplained))}.</li>
                    <li>{ruleWithTitle(translate(renbanTitle), translate(renbanExplained()))}.</li>
                    <li>
                        {ruleWithTitle(
                            translate(killerCagesTitle),
                            translate(killerCagesExplained),
                            translate(cannotRepeatInCage),
                        )}
                        .
                    </li>
                    <li>{ruleWithTitle(translate(inBetweenLineTitle), translate(inBetweenLineExplained))}.</li>
                    {stage >= 2 && <li>{ruleWithTitle(translate(arrowsTitle), translate(arrowsExplained))}.</li>}
                </RulesUnorderedList>
                {stage < 2 && (
                    <RulesParagraph>
                        {translate({
                            [LanguageCode.en]: "In later stages there will be additional clues",
                            [LanguageCode.ru]: "На более поздних этапах будут дополнительные подсказки",
                            [LanguageCode.de]: "In späteren Phasen wird es zusätzliche Hinweise geben",
                        })}
                        .
                    </RulesParagraph>
                )}
            </>
        );
    },
    items: ({ stateExtension: { stage } }) => {
        const result: Constraint<MultiStagePTM, any>[] = [
            KillerCageConstraintByRect("R4C1", 4, 1, 28),
            KillerCageConstraintByRect("R6C6", 4, 1, 12),
            RenbanConstraint(["R1C6", "R4C6", "R4C9"]),
            RenbanConstraint(["R5C1", "R5C5", "R9C5"]),
            BetweenLineConstraint(["R6C1", "R6C4", "R9C4"]),
            EvenConstraint("R1C6"),
            EvenConstraint("R3C6"),
            EvenConstraint("R4C7"),
            EvenConstraint("R4C9"),
        ];

        if (stage >= 2) {
            result.push(
                KillerCageConstraintByRect("R1C5", 1, 2, 5),
                KillerCageConstraintByRect("R5C1", 2, 1, 7),
                KillerCageConstraintByRect("R5C8", 2, 1, 15),
                KillerCageConstraintByRect("R8C5", 1, 2, 14),
                ArrowConstraint("R4C6", ["R3C5"], true),
                ArrowConstraint("R6C4", ["R7C5"], true),
            );
        }

        if (stage >= 3) {
            result.push(
                EvenConstraint("R1C1"),
                EvenConstraint("R1C5"),
                EvenConstraint("R1C9"),
                EvenConstraint("R6C9"),
                EvenConstraint("R9C1"),
                EvenConstraint("R9C9"),
            );
        }

        if (stage >= 4) {
            result.push(
                KillerCageConstraintByRect("R2C2", 2, 2, 17),
                KillerCageConstraintByRect("R2C7", 2, 2, 21),
                KillerCageConstraintByRect("R7C2", 2, 2, 17),
                KillerCageConstraintByRect("R7C7", 2, 2, 21),
            );
        }

        if (stage >= 5) {
            result.push(
                ArrowConstraint("R3C4", ["R3C3", "R4C3"], true),
                ArrowConstraint("R7C6", ["R7C7", "R6C7"], true),
            );
        }

        return result;
    },
    resultChecker: isValidFinishedPuzzleByStageConstraints(5),
};
