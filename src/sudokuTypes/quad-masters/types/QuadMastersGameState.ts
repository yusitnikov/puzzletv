import {QuadMastersQuad} from "./QuadMastersQuad";

export interface QuadMastersGameState {
    isQuadTurn: boolean;
    currentQuad?: QuadMastersQuad;
    allQuads: QuadMastersQuad[];
}

export const initialQuadMastersGameState: QuadMastersGameState = {
    isQuadTurn: true,
    currentQuad: undefined,
    allQuads: [],
};

export const serializeQuadMastersGameState = ({isQuadTurn, currentQuad, allQuads}: QuadMastersGameState): any => ({
    isQuadTurn,
    currentQuad,
    allQuads,
});

export const unserializeQuadMastersGameState = ({isQuadTurn, currentQuad, allQuads}: any): QuadMastersGameState => ({
    isQuadTurn,
    currentQuad,
    allQuads,
});
