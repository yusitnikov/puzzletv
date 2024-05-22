import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {addGameStateExToSudokuManager} from "../../../types/sudoku/SudokuTypeManagerPlugin";
import {RuleBoxGameState} from "./RuleBoxGameState";
import {ToRuleBoxPTM} from "./RuleBoxPTM";
import {Constraint} from "../../../types/sudoku/Constraint";
import {isCageConstraint} from "../../../components/sudoku/constraints/killer-cage/KillerCage";
import {RuleBoxConstraint} from "../components/RuleBox";

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

      return puzzle;
    },
  };
};
