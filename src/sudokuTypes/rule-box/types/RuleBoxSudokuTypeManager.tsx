import { ReactNode } from "react";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { addGameStateExToSudokuManager } from "../../../types/sudoku/SudokuTypeManagerPlugin";
import { RuleBoxGameState } from "./RuleBoxGameState";
import { ToRuleBoxPTM } from "./RuleBoxPTM";
import { Constraint } from "../../../types/sudoku/Constraint";
import { isCageConstraint } from "../../../components/sudoku/constraints/killer-cage/KillerCage";
import { isRuleBoxConstraint, RuleBoxConstraint } from "../components/RuleBox";
import { RulesParagraph } from "../../../components/sudoku/rules/RulesParagraph";
import { ParsedRulesHtml } from "../../../components/sudoku/rules/ParsedRulesHtml";

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

            const { items = [], importOptions: { htmlRules } = {} } = puzzle;

            const rulesMap: Record<string, ReactNode> = {};

            const processItems = (items: Constraint<ToRuleBoxPTM<T>, any>[]): Constraint<ToRuleBoxPTM<T>, any>[] =>
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
                });

            puzzle = {
                ...puzzle,
                items: typeof items === "function" ? (...args) => processItems(items(...args)) : processItems(items),
            };

            const baseRules = puzzle.rules;
            puzzle = {
                ...puzzle,
                rules: (translate, context) => (
                    <>
                        {baseRules?.(translate, context)}

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
