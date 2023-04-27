import {SokobanFieldState} from "./SokobanFieldState";
import {Position} from "../../../types/layout/Position";

export interface SokobanGameState {
    animating: boolean;
    sokobanDirection: Position;
}

export const defaultSokobanDirection: Position = {top: 1, left: 0};

// TODO: make the sokoban animation ok while moving in different directions fast?
export type SokobanProcessedGameState = SokobanFieldState;
