import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {addGameStateExToSudokuManager} from "../../../types/sudoku/SudokuTypeManagerPlugin";
import {RuleBoxGameState} from "./RuleBoxGameState";
import {ToRuleBoxPTM} from "./RuleBoxPTM";
import {Constraint} from "../../../types/sudoku/Constraint";
import {isCageConstraint} from "../../../components/sudoku/constraints/killer-cage/KillerCage";
import {RuleBoxConstraint} from "../components/RuleBox";
import {RulesParagraph} from "../../../components/sudoku/rules/RulesParagraph";

const rulePrefix = "rule:";

export const RuleBoxSudokuTypeManager = <T extends AnyPTM>(
  baseTypeManager: SudokuTypeManager<T>,
): SudokuTypeManager<ToRuleBoxPTM<T>> => {
  const extendedTypeManager = addGameStateExToSudokuManager<T, RuleBoxGameState, {}>(
    baseTypeManager,
    {
      initialGameStateExtension: {
        ruleBoxes: {},
      },
    }
  );

  return {
    ...extendedTypeManager,

    postProcessPuzzle(puzzle) {
      puzzle = extendedTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;

      const {items = []} = puzzle;

      const processItems = (items: Constraint<ToRuleBoxPTM<T>, any>[]): Constraint<ToRuleBoxPTM<T>, any>[] => items.map(
        (item) => isCageConstraint(item) && typeof item.props.sum === "string" && item.props.sum.startsWith(rulePrefix)
          ? RuleBoxConstraint(item.cells, item.props.sum.substring(rulePrefix.length).trim())
          : item
      );

      puzzle = {
        ...puzzle,
        items: typeof items === "function"
          ? ((...args) => processItems(items(...args)))
          : processItems(items),
      };

      const baseRules = puzzle.rules;
      puzzle = {
        ...puzzle,
        rules: (translate, context) => <>
          {baseRules?.(translate, context)}

          {Object.entries((context.stateExtension as RuleBoxGameState).ruleBoxes ?? {}).map(([ruleText, wasClicked]) => wasClicked && <RulesParagraph key={ruleText}>
            {ruleText}
          </RulesParagraph>)}
        </>,
      };

      return puzzle;
    },
  };
};
