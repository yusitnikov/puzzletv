import {QuadMastersQuad, serializeQuad, unserializeQuad} from "./QuadMastersQuad";

export interface QuadMastersGameState {
    isQuadTurn: boolean;
    currentQuad?: QuadMastersQuad;
    allQuads: QuadMastersQuad[];
}

export const initialQuadMastersGameState: QuadMastersGameState = {
    isQuadTurn: true,
    allQuads: [],
};

export const serializeQuadMastersGameState = ({isQuadTurn, currentQuad, allQuads}: QuadMastersGameState): any => ({
    isQuadTurn,
    currentQuad: currentQuad && serializeQuad(currentQuad),
    allQuads: allQuads.map(serializeQuad),
});

export const unserializeQuadMastersGameState = ({isQuadTurn, currentQuad, allQuads}: any): QuadMastersGameState => ({
    isQuadTurn,
    currentQuad: currentQuad && unserializeQuad(currentQuad),
    allQuads: (allQuads as any[]).map(unserializeQuad),
});
