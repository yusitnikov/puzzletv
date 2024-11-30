import { QuadInputGameState } from "../../../components/sudoku/constraints/quad/QuadInput/QuadInputGameState";

export interface QuadMastersGameState extends QuadInputGameState<number> {
    isQuadTurn: boolean;
}
