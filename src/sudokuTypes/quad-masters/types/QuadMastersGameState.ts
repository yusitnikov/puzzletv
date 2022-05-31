import {QuadMastersQuad} from "./QuadMastersQuad";

export interface QuadMastersGameState {
    isQuadTurn: boolean;
    currentQuad?: QuadMastersQuad;
    allQuads: QuadMastersQuad[];
}

export const initialQuadMastersGameState: QuadMastersGameState = {
    isQuadTurn: true,
    allQuads: [],
};
