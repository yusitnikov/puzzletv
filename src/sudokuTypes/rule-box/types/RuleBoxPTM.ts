import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {AddGameStateEx} from "../../../types/sudoku/SudokuTypeManagerPlugin";
import {RuleBoxGameState} from "./RuleBoxGameState";

export type AnyRuleBoxPTM<
  CellType = any,
  GameStateExType extends RuleBoxGameState = any,
> = AnyPTM<CellType, GameStateExType>;

export type ToRuleBoxPTM<T extends AnyPTM> = AddGameStateEx<T, RuleBoxGameState, {}>;
