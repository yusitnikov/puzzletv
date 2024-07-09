import {Rect} from "../../../types/layout/Rect";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";

export interface CaterpillarGrid {
  bounds: Rect;
  props: Partial<PuzzleDefinition<any>>;
}
