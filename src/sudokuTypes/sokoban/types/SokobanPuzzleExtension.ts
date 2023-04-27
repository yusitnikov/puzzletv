import {Position} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {SokobanPTM} from "./SokobanPTM";
import {KillerCageProps} from "../../../components/sudoku/constraints/killer-cage/KillerCage";

export type SokobanClue = Constraint<SokobanPTM, KillerCageProps>;

export interface SokobanPuzzleExtension {
    clues: SokobanClue[];
    sokobanStartPosition: Position;
}
