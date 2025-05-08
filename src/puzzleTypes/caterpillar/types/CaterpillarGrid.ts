import { Rect } from "../../../types/layout/Rect";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { PuzzleImportOptions } from "../../../types/puzzle/PuzzleImportOptions";

export interface CaterpillarGrid {
    bounds: Rect;
    outsideBounds: Rect;
    props: Partial<PuzzleDefinition<any>>;
    overrides: Partial<PuzzleImportOptions>;
}
