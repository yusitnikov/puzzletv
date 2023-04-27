import {Position} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export interface RotatableClue {
    pivot: Position;
    clues: Constraint<AnyPTM, any>[],
}

export interface RotatableCluesPuzzleExtension {
    clues: RotatableClue[];
}