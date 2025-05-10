import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AddGameStateEx } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { RuleBoxGameState } from "./RuleBoxGameState";

export type AnyRuleBoxPTM<CellType = any, GameStateExType extends RuleBoxGameState = any> = AnyPTM<
    CellType,
    GameStateExType
>;

export type ToRuleBoxPTM<T extends AnyPTM> = AddGameStateEx<T, RuleBoxGameState>;
