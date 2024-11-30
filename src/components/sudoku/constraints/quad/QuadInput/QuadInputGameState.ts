import { QuadInputState } from "./QuadInputState";

export interface QuadInputGameState<CellType> {
    currentQuad?: QuadInputState<CellType>;
    allQuads: QuadInputState<CellType>[];
}
