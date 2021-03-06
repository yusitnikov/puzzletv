import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {FieldSize9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
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
    ruleWithTitle
} from "../ruleSnippets";
import {gameStateGetCurrentFieldState, ProcessedGameState} from "../../types/sudoku/GameState";
import {KillerCageConstraintByRect} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {RenbanConstraint} from "../../components/sudoku/constraints/renban/Renban";
import {InBetweenLineConstraint} from "../../components/sudoku/constraints/in-between-line/InBetweenLine";
import {EvenConstraint} from "../../components/sudoku/constraints/even/Even";
import {GivenDigitsMap} from "../../types/sudoku/GivenDigitsMap";
import {ArrowConstraint} from "../../components/sudoku/constraints/arrow/Arrow";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {RulesUnorderedList} from "../../components/sudoku/rules/RulesUnorderedList";
import React from "react";
import {Button} from "../../components/layout/button/Button";
import {
    h2HeightCoeff,
    rulesHeaderPaddingCoeff,
    rulesMarginCoeff,
    yellowColor
} from "../../components/app/globals";
import {CellSelectionColor, CellSelectionProps} from "../../components/sudoku/cell/CellSelection";

const getStageCellsMap = (stage: number): GivenDigitsMap<boolean> => {
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

const getStage = (state: ProcessedGameState<number>) => {
    const {cells} = gameStateGetCurrentFieldState(state);

    if (
        cells[3][3].usersDigit !== 8 ||
        cells[3][4].usersDigit !== 1 ||
        cells[5][4].usersDigit !== 9 ||
        cells[5][5].usersDigit !== 2
    ) {
        return 1;
    }

    if (
        cells[2][4].usersDigit !== 5 ||
        cells[4][2].usersDigit !== 1 ||
        cells[4][4].usersDigit !== 4 ||
        cells[4][6].usersDigit !== 9 ||
        cells[6][4].usersDigit !== 7
    ) {
        return 2;
    }

    if (
        cells[0][0].usersDigit !== 6 ||
        cells[0][4].usersDigit !== 2 ||
        cells[0][8].usersDigit !== 8 ||
        cells[8][0].usersDigit !== 4 ||
        cells[8][4].usersDigit !== 8 ||
        cells[8][8].usersDigit !== 6
    ) {
        return 3;
    }

    if (
        cells[0][6].usersDigit !== 3 ||
        cells[0][7].usersDigit !== 7 ||
        cells[4][0].usersDigit !== 2 ||
        cells[4][1].usersDigit !== 5 ||
        cells[4][7].usersDigit !== 8 ||
        cells[4][8].usersDigit !== 7 ||
        cells[8][1].usersDigit !== 7 ||
        cells[8][2].usersDigit !== 9
    ) {
        return 4;
    }

    return 5;
};

interface HiddenSetupState {
    stage: number;
}

export const HiddenSetup: PuzzleDefinition<number, HiddenSetupState, HiddenSetupState> = {
    author: {
        [LanguageCode.en]: "Raumplaner",
    },
    title: {
        [LanguageCode.en]: "Hidden Setup",
        [LanguageCode.ru]: "?????????????? ??????????????????",
    },
    slug: "hidden-setup",
    saveStateKey: "hidden-setup-v2",
    typeManager: {
        ...DigitSudokuTypeManager<HiddenSetupState, HiddenSetupState>(),
        initialGameStateExtension: {
            stage: 1,
        },
        serializeGameState({stage}): any {
            return {stage};
        },
        unserializeGameState({stage = 1}: any): Partial<HiddenSetupState> {
            return {stage};
        },
        getCellSelectionType(
            {top, left},
            puzzle,
            state
        ): Required<Pick<CellSelectionProps, "color" | "strokeWidth">> | undefined {
            const colors = getStageCellsMap(state.stage);

            return colors[top]?.[left] === undefined ? undefined : {
                color: CellSelectionColor.secondary,
                strokeWidth: 1,
            };
        },
    },
    fieldSize: FieldSize9,
    aboveRules: (
        translate,
        {state, onStateChange, cellSize}
    ) => {
        const stage = getStage(state);
        const isNext = stage > state.stage;
        const coeff = isNext ? 1 : 0;

        return <div style={{
            background: yellowColor,
            marginBottom: cellSize * rulesMarginCoeff * coeff,
            padding: `${cellSize * rulesHeaderPaddingCoeff * coeff / 2}px ${cellSize * rulesHeaderPaddingCoeff}px`,
            fontSize: cellSize * h2HeightCoeff,
            lineHeight: `${cellSize * h2HeightCoeff * 1.5}px`,
            height: (cellSize * h2HeightCoeff * 3) * coeff,
            overflow: "hidden",
            transition: "0.3s all linear",
            textAlign: "center",
        }}>
            {translate("Congratulations")}, {translate({
                [LanguageCode.en]: <>you completed the&nbsp;stage</>,
                [LanguageCode.ru]: <>???? ?????????????????? ????????</>,
            })}! &nbsp;

            <Button
                type={"button"}
                cellSize={cellSize}
                style={{
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    lineHeight: `${cellSize * h2HeightCoeff * 1.5 - 2}px`,
                    paddingTop: 0,
                    paddingBottom: 0,
                }}
                onClick={() => onStateChange({stage})}
            >
                {translate({
                    [LanguageCode.en]: "Go to the next stage",
                    [LanguageCode.ru]: "?????????????? ???? ?????????????????? ????????",
                })}
            </Button>
        </div>;
    },
    rules: (translate, {state: {stage}}) => {
        return <>
            <RulesParagraph>{translate({
                [LanguageCode.en]: "This puzzle does reveal its clues in stages",
                [LanguageCode.ru]: "???????? ???????????? ???????????????????? ???????? ?????????????????? ????????????????",
            })}.</RulesParagraph>
            <RulesParagraph>{translate({
                [LanguageCode.en]: "Enter the correct digits into the highlighted cells to proceed to the next stage of the puzzle",
                [LanguageCode.ru]: "?????????????? ???????????????????? ?????????? ?? ???????????????????? ????????????, ?????????? ?????????????? ?? ???????????????????? ??????????",
            })}.</RulesParagraph>
            <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            <RulesParagraph>{translate(conventionalNotationsApply)}:</RulesParagraph>
            <RulesUnorderedList>
                <li>{ruleWithTitle(translate(evenTitle), translate(evenExplained))}.</li>
                <li>{ruleWithTitle(translate(renbanTitle), translate(renbanExplained))}.</li>
                <li>{ruleWithTitle(translate(killerCagesTitle), translate(killerCagesExplained), translate(cannotRepeatInCage))}.</li>
                <li>{ruleWithTitle(translate(inBetweenLineTitle), translate(inBetweenLineExplained))}.</li>
                {stage >= 2 && <li>{ruleWithTitle(translate(arrowsTitle), translate(arrowsExplained))}.</li>}
            </RulesUnorderedList>
            {stage < 2 && <RulesParagraph>{translate({
                [LanguageCode.en]: "In later stages there will be additional clues",
                [LanguageCode.ru]: "???? ?????????? ?????????????? ???????????? ?????????? ???????????????????????????? ??????????????????",
            })}.</RulesParagraph>}
        </>;
    },
    items: ({stage}) => {
        const result = [
            KillerCageConstraintByRect("R4C1", 4, 1, 28),
            KillerCageConstraintByRect("R6C6", 4, 1, 12),
            RenbanConstraint(["R1C6", "R4C6", "R4C9"]),
            RenbanConstraint(["R5C1", "R5C5", "R9C5"]),
            InBetweenLineConstraint(["R6C1", "R6C4", "R9C4"]),
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
                ArrowConstraint("R4C6", ["R3C5"]),
                ArrowConstraint("R6C4", ["R7C5"]),
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
                ArrowConstraint("R3C4", ["R3C3", "R4C3"]),
                ArrowConstraint("R7C6", ["R7C7", "R6C7"]),
            );
        }

        return result;
    },
    resultChecker: (context) => isValidFinishedPuzzleByConstraints({
        ...context,
        state: {
            ...context.state,
            stage: 5,
        }
    }),
};
