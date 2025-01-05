import { Constraint } from "../../../types/sudoku/Constraint";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { DecorativeShapeProps } from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";

export interface SlideAndSeekPuzzleExtension {
    shapes: Constraint<AnyPTM, DecorativeShapeProps>[];
}
