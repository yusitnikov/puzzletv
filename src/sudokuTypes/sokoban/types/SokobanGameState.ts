import { SokobanFieldState } from "./SokobanFieldState";
import { Position } from "../../../types/layout/Position";
import { AnimatedValue } from "../../../hooks/useAnimatedValue";

export interface SokobanGameState {
    animationManager: AnimatedValue<SokobanFieldState>;
    animating: boolean;
    sokobanDirection: Position;
}

export const defaultSokobanDirection: Position = { top: 1, left: 0 };
