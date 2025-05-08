import { QuadInputGameState } from "../../../components/puzzle/constraints/quad/QuadInput/QuadInputGameState";

export interface QuadMastersGameState extends QuadInputGameState<number> {
    isQuadTurn: boolean;
}
