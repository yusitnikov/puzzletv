import {Position} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {SokobanOptions} from "./SokobanOptions";
import {SokobanPTM} from "./SokobanPTM";

export type SokobanClue = Constraint<SokobanPTM, any>;

export interface SokobanPuzzleExtension {
    clues: SokobanClue[];
    sokobanStartPosition: Position;
    options: SokobanOptions;
}
