import { Constraint } from "../../../types/puzzle/Constraint";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { DecorativeShapeProps } from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";

export interface SlideAndSeekPuzzleExtension {
    shapes: Constraint<AnyPTM, DecorativeShapeProps>[];
}
