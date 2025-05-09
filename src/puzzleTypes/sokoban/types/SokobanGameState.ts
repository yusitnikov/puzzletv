import { Position } from "../../../types/layout/Position";

export interface SokobanGameState {
    animating: boolean;
    sokobanDirection: Position;
}

export const defaultSokobanDirection: Position = { top: 1, left: 0 };
