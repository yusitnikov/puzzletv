import { Rect } from "../../../types/layout/Rect";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import { PuzzleImportOptions } from "../../../types/sudoku/PuzzleImportOptions";

export interface CaterpillarGrid {
    bounds: Rect;
    outsideBounds: Rect;
    props: Partial<PuzzleDefinition<any>>;
    overrides: Partial<PuzzleImportOptions>;
}
