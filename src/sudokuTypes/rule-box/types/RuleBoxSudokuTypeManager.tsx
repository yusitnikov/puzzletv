import { ReactNode } from "react";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { addGameStateExToSudokuManager } from "../../../types/sudoku/SudokuTypeManagerPlugin";
import { RuleBoxGameState } from "./RuleBoxGameState";
import { ToRuleBoxPTM } from "./RuleBoxPTM";
import { isCageConstraint } from "../../../components/sudoku/constraints/killer-cage/KillerCage";
import { isRuleBoxConstraint, RuleBoxConstraint } from "../components/RuleBox";
import { RulesParagraph } from "../../../components/sudoku/rules/RulesParagraph";
import { ParsedRulesHtml } from "../../../components/sudoku/rules/ParsedRulesHtml";
import { processPuzzleItems } from "../../../types/sudoku/PuzzleDefinition";

const rulePrefix = "rule:";

export const RuleBoxSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>,
): SudokuTypeManager<ToRuleBoxPTM<T>> => {
    const extendedTypeManager = addGameStateExToSudokuManager<T, RuleBoxGameState, {}>(baseTypeManager, {
        initialGameStateExtension: {
            ruleBoxes: {},
        },
    });

    return {
        ...extendedTypeManager,

        postProcessPuzzle(puzzle) {
            puzzle = extendedTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;

            const { importOptions: { htmlRules } = {} } = puzzle;

            const rulesMap: Record<string, ReactNode> = {};

            puzzle = {
                ...puzzle,
                items: processPuzzleItems(
                    (items) =>
                        items.map((item) => {
                            if (
                                isCageConstraint(item) &&
                                typeof item.props.sum === "string" &&
                                item.props.sum.startsWith(rulePrefix)
                            ) {
                                const text = item.props.sum.substring(rulePrefix.length).trim();
                                const html = htmlRules ? <ParsedRulesHtml>{text}</ParsedRulesHtml> : text;
                                rulesMap[text] = html;
                                return RuleBoxConstraint(item.cells, text, html);
                            } else {
                                return item;
                            }
                        }),
                    puzzle.items,
                ),
            };

            const baseRules = puzzle.rules;
            puzzle = {
                ...puzzle,
                rules: (context) => (
                    <>
                        {baseRules?.(context)}

                        {Object.entries((context.stateExtension as RuleBoxGameState).ruleBoxes ?? {}).map(
                            ([ruleText, wasClicked]) =>
                                wasClicked && (
                                    <RulesParagraph key={ruleText}>{rulesMap[ruleText] ?? ruleText}</RulesParagraph>
                                ),
                        )}
                    </>
                ),
            };

            return puzzle;
        },

        disableFogDemo: (context) => {
            if (!context.resolvedPuzzleItems.some(isRuleBoxConstraint)) {
                return false;
            }

            for (const rule in (context.stateExtension as RuleBoxGameState).ruleBoxes) {
                if (/\b(?:fow|fog of war)\b/i.test(rule)) {
                    return false;
                }
            }

            return true;
        },
    };
};
