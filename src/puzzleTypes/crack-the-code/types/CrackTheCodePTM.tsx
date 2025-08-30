import { AddGameStateEx, AddPuzzleEx } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { NumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { CrackTheCodeGameState } from "./CrackTheCodeGameState";
import { CrackTheCodePuzzleExtension } from "./CrackTheCodePuzzleExtension";

export type CrackTheCodePTM = AddPuzzleEx<
    AddGameStateEx<NumberPTM, CrackTheCodeGameState>,
    CrackTheCodePuzzleExtension
>;
