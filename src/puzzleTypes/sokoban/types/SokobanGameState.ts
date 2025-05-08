import { SokobanGridState } from "./SokobanGridState";
import { Position } from "../../../types/layout/Position";
import { AnimatedValue } from "../../../hooks/useAnimatedValue";

export interface SokobanGameState {
    animationManager: AnimatedValue<SokobanGridState>;
    animating: boolean;
    sokobanDirection: Position;
}

export const defaultSokobanDirection: Position = { top: 1, left: 0 };
